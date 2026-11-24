use std::cell::Cell;
use std::time::Duration;
use ic_cdk::call::Call;
use ic_cdk::management_canister::{
    http_request, transform_context_from_query, HttpHeader, HttpMethod as IcHttpMethod,
    HttpRequestArgs,
};
use ic_cdk_timers::TimerId;

use crate::cron;
use crate::storage;
use crate::types::{ExecutionLog, JobRecord, JobStatus, JobTarget};

thread_local! {
    static ACTIVE_TIMER: Cell<Option<TimerId>> = const { Cell::new(None) };
}

pub fn arm_next_timer() {
    ACTIVE_TIMER.with(|cell| {
        if let Some(timer_id) = cell.get() {
            ic_cdk_timers::clear_timer(timer_id);
            cell.set(None);
        }

        if let Some(earliest_ts) = storage::get_earliest_scheduled_timestamp() {
            let now_sec = ic_cdk::api::time() / 1_000_000_000;
            let delay_sec = earliest_ts.saturating_sub(now_sec);
            let timer_id = ic_cdk_timers::set_timer(
                Duration::from_secs(delay_sec),
                async {
                    run_cycle().await;
                },
            );
            cell.set(Some(timer_id));
        }
    });
}

pub async fn run_cycle() {
    let now_nanos = ic_cdk::api::time();
    let now_sec = now_nanos / 1_000_000_000;

    let due_jobs = storage::pop_due_jobs(now_sec, 20);

    for job in due_jobs {
        execute_single_job(job).await;
    }

    arm_next_timer();
}

fn extract_host(url: &str) -> Option<String> {
    let after_scheme = if let Some(stripped) = url.strip_prefix("https://") {
        stripped
    } else if let Some(stripped) = url.strip_prefix("http://") {
        stripped
    } else {
        url
    };
    let host_and_port = after_scheme.split('/').next()?.split('?').next()?;
    if host_and_port.is_empty() {
        None
    } else {
        Some(host_and_port.to_string())
    }
}

pub async fn execute_single_job(mut job: JobRecord) {
    let now_nanos = ic_cdk::api::time();
    let now_sec = now_nanos / 1_000_000_000;

    // 1. Dormancy Check (30 days inactivity)
    if let Some(last_run) = job.last_run_at {
        if now_sec.saturating_sub(last_run) >= 30 * 86400 {
            job.status = JobStatus::AutoPausedDormant;
            job.next_run_at = None;
            job.updated_at = now_sec;
            storage::update_job(job);
            return;
        }
    }

    // 2. Credits Deduction (1 credit CanisterCall, 2 credits HttpWebhook)
    let cost = match job.target {
        JobTarget::CanisterCall { .. } => 1,
        JobTarget::HttpWebhook { .. } => 2,
    };
    let current_month = cron::current_month_epoch(now_sec);
    if !storage::deduct_credits(job.owner, cost, current_month, now_sec) {
        job.status = JobStatus::ExhaustedCredits;
        job.next_run_at = None;
        job.updated_at = now_sec;
        storage::update_job(job);
        return;
    }

    // 3. Target Execution
    let start_nanos = ic_cdk::api::time();
    let (success, status_code, snippet, err_msg) = match &job.target {
        JobTarget::CanisterCall { canister_id, method, payload } => {
            let call_res = Call::unbounded_wait(*canister_id, method)
                .with_raw_args(payload)
                .await;
            match call_res {
                Ok(resp) => {
                    let bytes: &[u8] = &resp;
                    let preview = if bytes.is_empty() {
                        "OK (empty return)".to_string()
                    } else {
                        let hex_str = hex::encode(&bytes[..bytes.len().min(64)]);
                        format!("Hex({}... len={})", hex_str, bytes.len())
                    };
                    (true, Some(200), preview, None)
                }
                Err(err) => {
                    (false, None, String::new(), Some(format!("{err:?}")))
                }
            }
        }
        JobTarget::HttpWebhook { url, method, headers, body } => {
            let req_method = match method {
                crate::types::HttpMethod::GET => IcHttpMethod::GET,
                crate::types::HttpMethod::POST => IcHttpMethod::POST,
                crate::types::HttpMethod::HEAD => IcHttpMethod::HEAD,
            };
            let mut req_headers: Vec<HttpHeader> = headers.iter().map(|(k, v)| {
                HttpHeader {
                    name: k.clone(),
                    value: v.clone(),
                }
            }).collect();

            if !req_headers.iter().any(|h| h.name.eq_ignore_ascii_case("host")) {
                if let Some(host) = extract_host(url) {
                    req_headers.push(HttpHeader {
                        name: "Host".to_string(),
                        value: host,
                    });
                }
            }

            if !req_headers.iter().any(|h| h.name.eq_ignore_ascii_case("user-agent")) {
                req_headers.push(HttpHeader {
                    name: "User-Agent".to_string(),
                    value: "Mozilla/5.0 (compatible; icCron/1.0; +https://icpay.app)".to_string(),
                });
            }

            if !req_headers.iter().any(|h| h.name.eq_ignore_ascii_case("accept")) {
                req_headers.push(HttpHeader {
                    name: "Accept".to_string(),
                    value: "*/*".to_string(),
                });
            }

            let request = HttpRequestArgs {
                url: url.clone(),
                max_response_bytes: Some(8192),
                method: req_method,
                headers: req_headers,
                body: body.clone(),
                transform: Some(transform_context_from_query(
                    "transform_http_response".to_string(),
                    vec![],
                )),
                is_replicated: None,
            };

            match http_request(&request).await {
                Ok(resp) => {
                    let status: u16 = resp.status.0.try_into().unwrap_or(200);
                    let body_str = String::from_utf8_lossy(&resp.body).chars().take(256).collect::<String>();
                    (status < 400, Some(status), body_str, if status >= 400 { Some(format!("HTTP Status {status}")) } else { None })
                }
                Err(err) => {
                    (false, None, String::new(), Some(format!("{err:?}")))
                }
            }
        }
    };

    let finish_nanos = ic_cdk::api::time();
    let duration_ms = ((finish_nanos.saturating_sub(start_nanos)) / 1_000_000) as u32;

    // 4. Record execution log
    let log = ExecutionLog {
        log_id: job.total_runs + 1,
        job_id: job.id,
        started_at: start_nanos / 1_000_000_000,
        duration_ms,
        success,
        status_code,
        response_snippet: snippet,
        error: err_msg,
    };
    storage::insert_execution_log(log, job.total_runs);

    // 5. Update failure counters & Circuit breaker
    if success {
        job.consecutive_failures = 0;
    } else {
        job.consecutive_failures = job.consecutive_failures.saturating_add(1);
    }

    let max_retries = job.max_retries.max(10);
    if job.consecutive_failures >= max_retries {
        job.status = JobStatus::DeadLetterQueue;
        job.next_run_at = None;
    } else {
        job.next_run_at = cron::next_run_timestamp(&job.compiled_cron, now_sec);
    }

    job.total_runs += 1;
    job.last_run_at = Some(now_sec);
    job.updated_at = now_sec;
    storage::update_job(job);
    arm_next_timer();
}
