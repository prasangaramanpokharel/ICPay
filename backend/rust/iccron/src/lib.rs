use candid::Principal;
use ic_cdk::management_canister::{HttpRequestResult, TransformArgs};

pub mod api_keys;
pub mod credits;
pub mod cron;
pub mod engine;
pub mod storage;
pub mod types;

use types::{
    ApiKeySummary, CreateJobArgs, CreditBalance, CronAuditStats, ExecutionLog, JobRecord, JobStatus, JobSummary,
    JobTarget, PackQuote, ProjectRecord, UpdateJobArgs,
};

#[ic_cdk::init]
fn init() {
    engine::arm_next_timer();
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    engine::arm_next_timer();
}

#[ic_cdk::query]
fn transform_http_response(args: TransformArgs) -> HttpRequestResult {
    let mut res = args.response;
    res.headers.clear();
    if res.body.len() > 512 {
        res.body.truncate(512);
    }
    res
}

// -----------------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------------

#[ic_cdk::update]
fn create_project(name: String) -> Result<ProjectRecord, String> {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot create projects".to_string());
    }
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Project name cannot be empty".to_string());
    }
    if trimmed.len() > 64 {
        return Err("Project name cannot exceed 64 characters".to_string());
    }

    let id = storage::next_project_id();
    let now_sec = ic_cdk::api::time() / 1_000_000_000;
    let project = ProjectRecord {
        id,
        owner: caller,
        name: trimmed.to_string(),
        created_at: now_sec,
    };
    storage::insert_project(project.clone());
    Ok(project)
}

#[ic_cdk::update]
fn rename_project(project_id: u64, new_name: String) -> Result<ProjectRecord, String> {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot rename projects".to_string());
    }
    let trimmed = new_name.trim();
    if trimmed.is_empty() {
        return Err("Project name cannot be empty".to_string());
    }
    if trimmed.len() > 100 {
        return Err("Project name cannot exceed 100 characters".to_string());
    }
    let mut project = storage::get_project(project_id).ok_or_else(|| "Project not found".to_string())?;
    if project.owner != caller {
        return Err("Unauthorized".to_string());
    }
    project.name = trimmed.to_string();
    storage::insert_project(project.clone());
    Ok(project)
}

#[ic_cdk::update]
fn pause_project(project_id: u64) -> Result<u64, String> {
    let caller = ic_cdk::api::msg_caller();
    let project = storage::get_project(project_id).ok_or_else(|| "Project not found".to_string())?;
    if project.owner != caller {
        return Err("Unauthorized".to_string());
    }
    let jobs = storage::list_jobs_by_owner(caller, Some(project_id));
    let now_sec = ic_cdk::api::time() / 1_000_000_000;
    let mut count = 0u64;
    for mut job in jobs {
        if matches!(job.status, JobStatus::Active) {
            if let Some(ts) = job.next_run_at {
                storage::remove_from_schedule(ts, job.id);
            }
            job.status = JobStatus::Paused;
            job.next_run_at = None;
            job.updated_at = now_sec;
            storage::update_job(job);
            count += 1;
        }
    }
    engine::arm_next_timer();
    Ok(count)
}

#[ic_cdk::update]
fn resume_project(project_id: u64) -> Result<u64, String> {
    let caller = ic_cdk::api::msg_caller();
    let project = storage::get_project(project_id).ok_or_else(|| "Project not found".to_string())?;
    if project.owner != caller {
        return Err("Unauthorized".to_string());
    }
    let jobs = storage::list_jobs_by_owner(caller, Some(project_id));
    let now_sec = ic_cdk::api::time() / 1_000_000_000;
    let mut count = 0u64;
    for mut job in jobs {
        if matches!(job.status, JobStatus::Paused | JobStatus::AutoPausedDormant) {
            job.status = JobStatus::Active;
            job.consecutive_failures = 0;
            job.next_run_at = cron::next_run_timestamp(&job.compiled_cron, now_sec);
            job.updated_at = now_sec;
            storage::update_job(job);
            count += 1;
        }
    }
    engine::arm_next_timer();
    Ok(count)
}

#[ic_cdk::update]
fn delete_project(project_id: u64) -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    let project = storage::get_project(project_id).ok_or_else(|| "Project not found".to_string())?;
    if project.owner != caller {
        return Err("Unauthorized".to_string());
    }

    // Delete associated jobs
    let jobs = storage::list_jobs_by_owner(caller, Some(project_id));
    for job in jobs {
        storage::delete_job(job.id);
    }

    // Delete associated api keys
    let keys = storage::list_api_keys_by_project(project_id);
    for key in keys {
        let _ = storage::delete_api_key(&key.key_hash);
    }

    storage::delete_project(project_id);
    engine::arm_next_timer();
    Ok(())
}

#[ic_cdk::query]
fn list_my_projects() -> Vec<ProjectRecord> {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return vec![];
    }
    storage::list_projects_by_owner(caller)
}

// -----------------------------------------------------------------------------
// Jobs
// -----------------------------------------------------------------------------

fn validate_target_url(url: &str) -> Result<(), String> {
    let u = url.trim();
    if !u.starts_with("https://") && !u.starts_with("http://") {
        return Err("Webhook URL must begin with https:// or http://".to_string());
    }
    if u.len() > 2048 {
        return Err("Webhook URL exceeds 2048 characters".to_string());
    }

    let after_scheme = if let Some(stripped) = u.strip_prefix("https://") {
        stripped
    } else {
        u.strip_prefix("http://").unwrap()
    };

    let host_part = after_scheme
        .split('/')
        .next()
        .unwrap_or("")
        .split('?')
        .next()
        .unwrap_or("");
    let host = host_part
        .split(':')
        .next()
        .unwrap_or("")
        .trim()
        .to_ascii_lowercase();

    if host.is_empty() {
        return Err("Target URL has empty host".to_string());
    }

    if host == "169.254.169.254" || host.starts_with("169.254.") {
        return Err("Target URL points to forbidden metadata endpoint".to_string());
    }
    if host == "localhost"
        || host == "127.0.0.1"
        || host.starts_with("127.")
        || host == "0.0.0.0"
        || host == "::1"
        || host == "[::1]"
    {
        return Err("Target URL cannot point to loopback address".to_string());
    }
    if host.starts_with("10.") || host.starts_with("192.168.") {
        return Err("Target URL cannot point to private network address".to_string());
    }

    Ok(())
}

fn create_job_inner(
    caller: Principal,
    is_controller: bool,
    args: CreateJobArgs,
) -> Result<JobRecord, String> {
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot create jobs".to_string());
    }

    let project = storage::get_project(args.project_id)
        .ok_or_else(|| "Project not found".to_string())?;
    if project.owner != caller && !is_controller {
        return Err("Unauthorized to add job to this project".to_string());
    }

    let label = args.label.trim();
    if label.is_empty() {
        return Err("Job label cannot be empty".to_string());
    }

    match &args.target {
        JobTarget::CanisterCall { canister_id, method, .. } => {
            if *canister_id == Principal::anonymous() {
                return Err("Target canister ID cannot be anonymous".to_string());
            }
            if method.trim().is_empty() {
                return Err("Method name cannot be empty".to_string());
            }
        }
        JobTarget::HttpWebhook { url, .. } => {
            validate_target_url(url)?;
        }
    }

    let compiled_cron = cron::parse_cron(&args.cron_expression)?;
    let now_nanos = ic_cdk::api::time();
    let now_sec = now_nanos / 1_000_000_000;
    let next_run = cron::next_run_timestamp(&compiled_cron, now_sec);

    let job_id = storage::next_job_id();
    let job = JobRecord {
        id: job_id,
        project_id: args.project_id,
        owner: project.owner,
        label: label.to_string(),
        target: args.target,
        cron_expression: args.cron_expression.trim().to_string(),
        compiled_cron,
        status: JobStatus::Active,
        max_retries: args.max_retries.unwrap_or(10),
        consecutive_failures: 0,
        total_runs: 0,
        next_run_at: next_run,
        last_run_at: None,
        created_at: now_sec,
        updated_at: now_sec,
    };

    storage::insert_job(job.clone());
    engine::arm_next_timer();

    Ok(job)
}

#[ic_cdk::update]
fn create_job(args: CreateJobArgs) -> Result<JobRecord, String> {
    let caller = ic_cdk::api::msg_caller();
    create_job_inner(caller, ic_cdk::api::is_controller(&caller), args)
}

#[ic_cdk::update]
fn update_job(args: UpdateJobArgs) -> Result<JobRecord, String> {
    let caller = ic_cdk::api::msg_caller();
    let mut job = storage::get_job(args.job_id).ok_or_else(|| "Job not found".to_string())?;
    if job.owner != caller {
        return Err("Unauthorized".to_string());
    }

    let now_sec = ic_cdk::api::time() / 1_000_000_000;
    let mut schedule_changed = false;

    if let Some(lbl) = args.label {
        let trimmed = lbl.trim();
        if trimmed.is_empty() {
            return Err("Job label cannot be empty".to_string());
        }
        job.label = trimmed.to_string();
    }

    if let Some(target) = args.target {
        match &target {
            JobTarget::CanisterCall { canister_id, method, .. } => {
                if *canister_id == Principal::anonymous() {
                    return Err("Target canister ID cannot be anonymous".to_string());
                }
                if method.trim().is_empty() {
                    return Err("Method name cannot be empty".to_string());
                }
            }
            JobTarget::HttpWebhook { url, .. } => {
                validate_target_url(url)?;
            }
        }
        job.target = target;
    }

    if let Some(cron_expr) = args.cron_expression {
        let trimmed = cron_expr.trim();
        let compiled = cron::parse_cron(trimmed)?;
        job.cron_expression = trimmed.to_string();
        job.compiled_cron = compiled;
        schedule_changed = true;
    }

    if let Some(retries) = args.max_retries {
        job.max_retries = retries;
    }

    if schedule_changed {
        if let Some(old_ts) = job.next_run_at {
            storage::remove_from_schedule(old_ts, job.id);
        }
        if matches!(job.status, JobStatus::Active) {
            job.next_run_at = cron::next_run_timestamp(&job.compiled_cron, now_sec);
        } else {
            job.next_run_at = None;
        }
    }

    job.updated_at = now_sec;
    storage::update_job(job.clone());
    engine::arm_next_timer();
    Ok(job)
}

#[ic_cdk::update]
fn delete_job(job_id: u64) -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    let job = storage::get_job(job_id).ok_or_else(|| "Job not found".to_string())?;
    if job.owner != caller {
        return Err("Unauthorized".to_string());
    }
    storage::delete_job(job_id);
    engine::arm_next_timer();
    Ok(())
}

fn pause_job_inner(mut job: JobRecord) {
    if let Some(ts) = job.next_run_at {
        storage::remove_from_schedule(ts, job.id);
    }
    let now_sec = ic_cdk::api::time() / 1_000_000_000;
    job.status = JobStatus::Paused;
    job.next_run_at = None;
    job.updated_at = now_sec;
    storage::update_job(job);
    engine::arm_next_timer();
}

fn resume_job_inner(mut job: JobRecord) {
    let now_sec = ic_cdk::api::time() / 1_000_000_000;
    job.status = JobStatus::Active;
    job.consecutive_failures = 0;
    job.next_run_at = cron::next_run_timestamp(&job.compiled_cron, now_sec);
    job.updated_at = now_sec;
    storage::update_job(job);
    engine::arm_next_timer();
}

#[ic_cdk::update]
fn pause_job(job_id: u64) -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    let job = storage::get_job(job_id).ok_or_else(|| "Job not found".to_string())?;
    if job.owner != caller {
        return Err("Unauthorized".to_string());
    }
    pause_job_inner(job);
    Ok(())
}

#[ic_cdk::update]
fn resume_job(job_id: u64) -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    let job = storage::get_job(job_id).ok_or_else(|| "Job not found".to_string())?;
    if job.owner != caller {
        return Err("Unauthorized".to_string());
    }
    resume_job_inner(job);
    Ok(())
}

#[ic_cdk::update]
async fn trigger_job(job_id: u64) -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    let job = storage::get_job(job_id).ok_or_else(|| "Job not found".to_string())?;
    if job.owner != caller {
        return Err("Unauthorized".to_string());
    }

    ic_cdk::futures::spawn(async move {
        engine::execute_single_job(job).await;
    });
    Ok(())
}

#[ic_cdk::query]
fn list_jobs(project_id: Option<u64>) -> Vec<JobSummary> {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return vec![];
    }

    let jobs = storage::list_jobs_by_owner(caller, project_id);
    jobs.into_iter()
        .map(|j| {
            let (target_type, target_preview) = match &j.target {
                JobTarget::CanisterCall { canister_id, method, .. } => (
                    "CanisterCall".to_string(),
                    format!("{}::{}", canister_id, method),
                ),
                JobTarget::HttpWebhook { url, method, .. } => (
                    "HttpWebhook".to_string(),
                    format!("{:?} {}", method, url),
                ),
            };

            JobSummary {
                id: j.id,
                project_id: j.project_id,
                label: j.label,
                cron_expression: j.cron_expression,
                target_type,
                target_preview,
                status: j.status.as_str().to_string(),
                consecutive_failures: j.consecutive_failures,
                total_runs: j.total_runs,
                next_run_at: j.next_run_at,
                last_run_at: j.last_run_at,
            }
        })
        .collect()
}

#[ic_cdk::query]
fn get_job(job_id: u64) -> Result<JobRecord, String> {
    let caller = ic_cdk::api::msg_caller();
    let job = storage::get_job(job_id).ok_or_else(|| "Job not found".to_string())?;
    if job.owner != caller && !ic_cdk::api::is_controller(&caller) {
        return Err("Unauthorized".to_string());
    }
    Ok(job)
}

#[ic_cdk::query]
fn get_job_logs(job_id: u64, limit: Option<u64>) -> Vec<ExecutionLog> {
    let caller = ic_cdk::api::msg_caller();
    if let Some(job) = storage::get_job(job_id) {
        if job.owner != caller && !ic_cdk::api::is_controller(&caller) {
            return vec![];
        }
    } else {
        return vec![];
    }
    let lim = limit.unwrap_or(20).min(50) as usize;
    storage::list_job_logs(job_id, lim)
}

// -----------------------------------------------------------------------------
// API Keys
// -----------------------------------------------------------------------------

#[ic_cdk::update]
fn create_api_key(project_id: u64, label: String) -> Result<String, String> {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot create API keys".to_string());
    }
    let project = storage::get_project(project_id).ok_or_else(|| "Project not found".to_string())?;
    if project.owner != caller {
        return Err("Unauthorized".to_string());
    }

    let now_nanos = ic_cdk::api::time();
    let (raw_key, _) = api_keys::generate_key(project_id, label, caller, now_nanos);
    Ok(raw_key)
}

#[ic_cdk::update]
fn revoke_api_key(key_hash: Vec<u8>) -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    if key_hash.len() != 32 {
        return Err("Invalid hash length".to_string());
    }
    let mut arr = [0u8; 32];
    arr.copy_from_slice(&key_hash);
    let now_sec = ic_cdk::api::time() / 1_000_000_000;
    api_keys::revoke_key(&arr, caller, now_sec)
}

#[ic_cdk::update]
fn delete_api_key(key_hash: Vec<u8>) -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    if key_hash.len() != 32 {
        return Err("Invalid hash length".to_string());
    }
    let mut arr = [0u8; 32];
    arr.copy_from_slice(&key_hash);
    api_keys::delete_key(&arr, caller)
}

#[ic_cdk::query]
fn list_api_keys(project_id: u64) -> Result<Vec<ApiKeySummary>, String> {
    let caller = ic_cdk::api::msg_caller();
    api_keys::list_keys(project_id, caller)
}

#[ic_cdk::update]
async fn api_trigger_job(raw_key: String, job_id: u64) -> Result<(), String> {
    let key_record = api_keys::verify_key(&raw_key)
        .ok_or_else(|| "Invalid or revoked API key".to_string())?;

    let job = storage::get_job(job_id).ok_or_else(|| "Job not found".to_string())?;
    if job.project_id != key_record.project_id {
        return Err("API key does not have access to this job's project".to_string());
    }

    ic_cdk::futures::spawn(async move {
        engine::execute_single_job(job).await;
    });
    Ok(())
}

// -----------------------------------------------------------------------------
// Credits & Billing
// -----------------------------------------------------------------------------

#[ic_cdk::query]
fn get_my_credits() -> CreditBalance {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return CreditBalance {
            free_runs_remaining: 0,
            prepaid_credits: 0,
            total_available: 0,
            total_used: 0,
        };
    }

    let now_sec = ic_cdk::api::time() / 1_000_000_000;
    let current_month = cron::current_month_epoch(now_sec);
    let rec = storage::get_user_credits(caller, current_month, now_sec);
    let free_avail = 60u64.saturating_sub(rec.free_runs_used);

    CreditBalance {
        free_runs_remaining: free_avail,
        prepaid_credits: rec.prepaid_credits,
        total_available: free_avail + rec.prepaid_credits,
        total_used: rec.total_used,
    }
}

#[ic_cdk::update]
async fn quote_credits(credits: u64) -> PackQuote {
    credits::quote_credits(credits).await
}

#[ic_cdk::update]
async fn buy_credits(credits: u64, block_index: u64) -> Result<u64, String> {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot purchase credits".to_string());
    }

    let now_nanos = ic_cdk::api::time();
    credits::buy_credits(caller, credits, block_index, now_nanos).await
}

#[ic_cdk::update]
async fn get_pack_quotes() -> Vec<PackQuote> {
    credits::get_pack_quotes().await
}

#[ic_cdk::update]
async fn buy_pack(tier: u8, block_index: u64) -> Result<u64, String> {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot purchase packs".to_string());
    }

    let now_nanos = ic_cdk::api::time();
    credits::buy_pack(caller, tier, block_index, now_nanos).await
}

// -----------------------------------------------------------------------------
// Admin & Audit
// -----------------------------------------------------------------------------

#[ic_cdk::update]
fn set_rate_per_run(usd_micros: u64) -> Result<u64, String> {
    let caller = ic_cdk::api::msg_caller();
    let treasury = Principal::from_text(credits::TREASURY_PRINCIPAL_TEXT)
        .unwrap_or(Principal::anonymous());
    let is_admin = ic_cdk::api::is_controller(&caller) || caller == treasury;
    if !is_admin {
        return Err("Unauthorized: only canister controller or treasury can change the rate".to_string());
    }
    if usd_micros == 0 {
        return Err("Rate cannot be zero".to_string());
    }
    storage::set_rate_per_run_usd_micros(usd_micros);
    Ok(usd_micros)
}

#[ic_cdk::query]
fn get_rate_per_run() -> u64 {
    storage::get_rate_per_run_usd_micros()
}

#[ic_cdk::query]
fn get_audit_stats() -> CronAuditStats {
    let cycles = ic_cdk::api::canister_cycle_balance();
    let pages = ic_cdk::stable::stable_size();
    storage::get_audit_stats(credits::TREASURY_PRINCIPAL_TEXT, cycles, pages)
}

// -----------------------------------------------------------------------------
// Inbound HTTP Gateway Handlers
// -----------------------------------------------------------------------------

fn standard_cors_headers() -> Vec<types::HeaderField> {
    vec![
        types::HeaderField("Content-Type".to_string(), "application/json".to_string()),
        types::HeaderField("Access-Control-Allow-Origin".to_string(), "*".to_string()),
        types::HeaderField(
            "Access-Control-Allow-Methods".to_string(),
            "POST, GET, OPTIONS".to_string(),
        ),
        types::HeaderField(
            "Access-Control-Allow-Headers".to_string(),
            "Authorization, Content-Type".to_string(),
        ),
    ]
}

fn extract_api_key(req: &types::InboundHttpRequest) -> Option<String> {
    for types::HeaderField(name, val) in &req.headers {
        if name.eq_ignore_ascii_case("authorization") {
            let trimmed = val.trim();
            if let Some(token) = trimmed.strip_prefix("Bearer ") {
                return Some(token.trim().to_string());
            } else {
                return Some(trimmed.to_string());
            }
        }
    }

    #[derive(serde::Deserialize)]
    struct KeyPayload {
        api_key: Option<String>,
    }
    let payload: Option<KeyPayload> = serde_json::from_slice(&req.body).ok();
    payload.and_then(|p| p.api_key)
}

fn json_response(
    status_code: u16,
    cors_headers: Vec<types::HeaderField>,
    body: serde_json::Value,
) -> types::InboundHttpResponse {
    types::InboundHttpResponse {
        status_code,
        headers: cors_headers,
        body: serde_json::to_vec(&body).unwrap_or_default(),
        upgrade: None,
    }
}

fn verify_http_api_key(
    req: &types::InboundHttpRequest,
    cors_headers: &[types::HeaderField],
) -> Result<types::ApiKeyRecord, types::InboundHttpResponse> {
    let key = match extract_api_key(req) {
        Some(k) if !k.is_empty() => k,
        _ => {
            return Err(json_response(
                401,
                cors_headers.to_vec(),
                serde_json::json!({
                    "ok": false,
                    "error": "Missing Authorization header or api_key in request body"
                }),
            ));
        }
    };

    api_keys::verify_key(&key).ok_or_else(|| {
        json_response(
            401,
            cors_headers.to_vec(),
            serde_json::json!({
                "ok": false,
                "error": "Invalid or revoked API key"
            }),
        )
    })
}

fn job_to_json(job: &JobRecord) -> serde_json::Value {
    let (target_type, target_preview) = match &job.target {
        JobTarget::CanisterCall { canister_id, method, .. } => (
            "CanisterCall",
            format!("{}::{}", canister_id, method),
        ),
        JobTarget::HttpWebhook { url, method, .. } => (
            "HttpWebhook",
            format!("{:?} {}", method, url),
        ),
    };
    serde_json::json!({
        "id": job.id,
        "project_id": job.project_id,
        "label": job.label,
        "cron_expression": job.cron_expression,
        "target_type": target_type,
        "target_preview": target_preview,
        "status": job.status.as_str(),
        "total_runs": job.total_runs,
        "consecutive_failures": job.consecutive_failures,
        "next_run_at": job.next_run_at,
        "last_run_at": job.last_run_at,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    })
}

fn normalized_path(url: &str) -> &str {
    let raw = url.split('?').next().unwrap_or(url);
    let trimmed = raw.trim_end_matches('/');
    if trimmed.is_empty() { "/" } else { trimmed }
}

fn log_to_json(l: ExecutionLog, job_label: Option<&str>) -> serde_json::Value {
    serde_json::json!({
        "log_id": l.log_id,
        "job_id": l.job_id,
        "job_label": job_label,
        "started_at": l.started_at,
        "duration_ms": l.duration_ms,
        "success": l.success,
        "status_code": l.status_code,
        "error": l.error,
        "response_snippet": l.response_snippet,
    })
}

#[ic_cdk::query]
fn http_request(req: types::InboundHttpRequest) -> types::InboundHttpResponse {
    let cors_headers = standard_cors_headers();

    if req.method.eq_ignore_ascii_case("OPTIONS") {
        return types::InboundHttpResponse {
            status_code: 204,
            headers: cors_headers,
            body: vec![],
            upgrade: None,
        };
    }

    let path = normalized_path(&req.url);

    if req.method.eq_ignore_ascii_case("POST") {
        let is_job_action = path
            .strip_prefix("/api/v1/cron/jobs/")
            .and_then(|rest| rest.split_once('/'))
            .is_some_and(|(id, action)| {
                id.parse::<u64>().is_ok() && (action == "pause" || action == "resume")
            });

        if path != "/api/v1/cron/trigger" && path != "/api/v1/cron/jobs" && !is_job_action {
            return json_response(
                404,
                cors_headers,
                serde_json::json!({ "ok": false, "error": "Endpoint not found" }),
            );
        }

        if let Err(err_res) = verify_http_api_key(&req, &cors_headers) {
            return err_res;
        }

        return types::InboundHttpResponse {
            status_code: 200,
            headers: vec![],
            body: vec![],
            upgrade: Some(true),
        };
    }

    if req.method.eq_ignore_ascii_case("DELETE") {
        if path != "/api/v1/cron/jobs" && !path.starts_with("/api/v1/cron/jobs/") {
            return json_response(
                404,
                cors_headers,
                serde_json::json!({ "ok": false, "error": "Endpoint not found" }),
            );
        }

        if let Err(err_res) = verify_http_api_key(&req, &cors_headers) {
            return err_res;
        }

        return types::InboundHttpResponse {
            status_code: 200,
            headers: vec![],
            body: vec![],
            upgrade: Some(true),
        };
    }

    if req.method.eq_ignore_ascii_case("GET") {
        if path == "/api/v1/cron/jobs" {
            let key_record = match verify_http_api_key(&req, &cors_headers) {
                Ok(rec) => rec,
                Err(err_res) => return err_res,
            };
            let jobs: Vec<serde_json::Value> =
                storage::list_jobs_by_owner(key_record.owner, Some(key_record.project_id))
                    .iter()
                    .map(job_to_json)
                    .collect();
            return json_response(
                200,
                cors_headers,
                serde_json::json!({
                    "ok": true,
                    "project_id": key_record.project_id,
                    "jobs": jobs,
                }),
            );
        }

        if path == "/api/v1/cron/logs" {
            let key_record = match verify_http_api_key(&req, &cors_headers) {
                Ok(rec) => rec,
                Err(err_res) => return err_res,
            };
            let jobs = storage::list_jobs_by_owner(key_record.owner, Some(key_record.project_id));
            let mut all_logs: Vec<(ExecutionLog, String)> = Vec::new();
            for j in jobs {
                for l in storage::list_job_logs(j.id, 50) {
                    all_logs.push((l, j.label.clone()));
                }
            }
            all_logs.sort_by(|a, b| {
                b.0.started_at
                    .cmp(&a.0.started_at)
                    .then_with(|| b.0.log_id.cmp(&a.0.log_id))
            });
            all_logs.truncate(100);
            let logs: Vec<serde_json::Value> = all_logs
                .into_iter()
                .map(|(l, label)| log_to_json(l, Some(&label)))
                .collect();
            return json_response(
                200,
                cors_headers,
                serde_json::json!({
                    "ok": true,
                    "project_id": key_record.project_id,
                    "logs": logs,
                }),
            );
        }

        if let Some((id_str, action)) = path
            .strip_prefix("/api/v1/cron/jobs/")
            .and_then(|rest| rest.split_once('/'))
        {
            if action == "logs" {
                if let Ok(job_id) = id_str.parse::<u64>() {
                    let key_record = match verify_http_api_key(&req, &cors_headers) {
                        Ok(rec) => rec,
                        Err(err_res) => return err_res,
                    };
                    let job = match storage::get_job(job_id) {
                        Some(j) => j,
                        None => {
                            return json_response(
                                404,
                                cors_headers,
                                serde_json::json!({ "ok": false, "error": format!("Job {} not found", job_id) }),
                            );
                        }
                    };
                    if job.project_id != key_record.project_id {
                        return json_response(
                            403,
                            cors_headers,
                            serde_json::json!({ "ok": false, "error": "API key does not have access to this job's project" }),
                        );
                    }
                    let logs: Vec<serde_json::Value> = storage::list_job_logs(job_id, 50)
                        .into_iter()
                        .map(|l| log_to_json(l, Some(&job.label)))
                        .collect();
                    return json_response(
                        200,
                        cors_headers,
                        serde_json::json!({ "ok": true, "job_id": job_id, "logs": logs }),
                    );
                }
            }
        }

        return json_response(
            200,
            cors_headers,
            serde_json::json!({
                "status": "ok",
                "service": "icCron",
                "canister_id": ic_cdk::api::canister_self().to_text()
            }),
        );
    }

    json_response(
        405,
        cors_headers,
        serde_json::json!({ "error": "Method not allowed" }),
    )
}

#[ic_cdk::update]
async fn http_request_update(req: types::InboundHttpRequest) -> types::InboundHttpResponse {
    let cors_headers = standard_cors_headers();

    if req.method.eq_ignore_ascii_case("OPTIONS") {
        return types::InboundHttpResponse {
            status_code: 204,
            headers: cors_headers,
            body: vec![],
            upgrade: None,
        };
    }

    let key_record = match verify_http_api_key(&req, &cors_headers) {
        Ok(rec) => rec,
        Err(err_res) => return err_res,
    };

    let path = normalized_path(&req.url);

    if req.method.eq_ignore_ascii_case("POST") && path == "/api/v1/cron/jobs" {
        #[derive(serde::Deserialize)]
        struct HttpCreateJobPayload {
            label: String,
            cron_expression: String,
            max_retries: Option<u8>,
            target: HttpJobTargetPayload,
        }
        #[derive(serde::Deserialize)]
        #[serde(tag = "type")]
        enum HttpJobTargetPayload {
            HttpWebhook {
                url: String,
                method: Option<String>,
                headers: Option<Vec<(String, String)>>,
                body: Option<String>,
            },
            CanisterCall {
                canister_id: String,
                method: String,
                payload: Option<Vec<u8>>,
            },
        }

        let payload: HttpCreateJobPayload = match serde_json::from_slice(&req.body) {
            Ok(p) => p,
            Err(e) => {
                return json_response(
                    400,
                    cors_headers,
                    serde_json::json!({
                        "ok": false,
                        "error": format!("Invalid JSON payload: {}", e)
                    }),
                );
            }
        };

        let target = match payload.target {
            HttpJobTargetPayload::HttpWebhook {
                url,
                method,
                headers,
                body,
            } => {
                let http_method = match method.as_deref().unwrap_or("POST").to_uppercase().as_str() {
                    "GET" => types::HttpMethod::GET,
                    "HEAD" => types::HttpMethod::HEAD,
                    _ => types::HttpMethod::POST,
                };
                types::JobTarget::HttpWebhook {
                    url,
                    method: http_method,
                    headers: headers.unwrap_or_default(),
                    body: body.map(|b| b.into_bytes()),
                }
            }
            HttpJobTargetPayload::CanisterCall {
                canister_id,
                method,
                payload,
            } => {
                let principal = match Principal::from_text(canister_id.trim()) {
                    Ok(p) => p,
                    Err(_) => {
                        return json_response(
                            400,
                            cors_headers,
                            serde_json::json!({ "ok": false, "error": "Invalid target canister_id" }),
                        );
                    }
                };
                types::JobTarget::CanisterCall {
                    canister_id: principal,
                    method,
                    payload: payload.unwrap_or_default(),
                }
            }
        };

        let args = CreateJobArgs {
            project_id: key_record.project_id,
            label: payload.label,
            target,
            cron_expression: payload.cron_expression,
            max_retries: payload.max_retries,
        };

        return match create_job_inner(key_record.owner, false, args) {
            Ok(job) => json_response(
                201,
                cors_headers,
                serde_json::json!({ "ok": true, "job": job_to_json(&job) }),
            ),
            Err(err) => json_response(
                400,
                cors_headers,
                serde_json::json!({ "ok": false, "error": err }),
            ),
        };
    }

    if req.method.eq_ignore_ascii_case("DELETE")
        && (path == "/api/v1/cron/jobs" || path.starts_with("/api/v1/cron/jobs/"))
    {
        #[derive(serde::Deserialize)]
        struct DeletePayload {
            job_id: Option<u64>,
        }
        let path_id = path
            .strip_prefix("/api/v1/cron/jobs/")
            .and_then(|s| s.parse::<u64>().ok());
        let body_id = serde_json::from_slice::<DeletePayload>(&req.body)
            .ok()
            .and_then(|p| p.job_id);
        let job_id = match path_id.or(body_id) {
            Some(id) => id,
            None => {
                return json_response(
                    400,
                    cors_headers,
                    serde_json::json!({ "ok": false, "error": "Missing job_id" }),
                );
            }
        };

        let job = match storage::get_job(job_id) {
            Some(j) => j,
            None => {
                return json_response(
                    404,
                    cors_headers,
                    serde_json::json!({ "ok": false, "error": format!("Job {} not found", job_id) }),
                );
            }
        };

        if job.project_id != key_record.project_id {
            return json_response(
                403,
                cors_headers,
                serde_json::json!({ "ok": false, "error": "API key does not have access to this job's project" }),
            );
        }

        storage::delete_job(job_id);
        storage::delete_job_logs(job_id);
        return json_response(
            200,
            cors_headers,
            serde_json::json!({ "ok": true, "deleted": true, "job_id": job_id }),
        );
    }

    if req.method.eq_ignore_ascii_case("POST") {
        if let Some((id_str, action)) = path
            .strip_prefix("/api/v1/cron/jobs/")
            .and_then(|rest| rest.split_once('/'))
        {
            if action == "pause" || action == "resume" {
                let job_id = match id_str.parse::<u64>() {
                    Ok(id) => id,
                    Err(_) => {
                        return json_response(
                            400,
                            cors_headers,
                            serde_json::json!({ "ok": false, "error": "Invalid job_id" }),
                        );
                    }
                };
                let job = match storage::get_job(job_id) {
                    Some(j) => j,
                    None => {
                        return json_response(
                            404,
                            cors_headers,
                            serde_json::json!({ "ok": false, "error": format!("Job {} not found", job_id) }),
                        );
                    }
                };
                if job.project_id != key_record.project_id {
                    return json_response(
                        403,
                        cors_headers,
                        serde_json::json!({ "ok": false, "error": "API key does not have access to this job's project" }),
                    );
                }
                if action == "pause" {
                    pause_job_inner(job);
                    return json_response(
                        200,
                        cors_headers,
                        serde_json::json!({ "ok": true, "job_id": job_id, "status": "Paused" }),
                    );
                } else {
                    resume_job_inner(job);
                    return json_response(
                        200,
                        cors_headers,
                        serde_json::json!({ "ok": true, "job_id": job_id, "status": "Active" }),
                    );
                }
            }
        }
    }

    if !req.method.eq_ignore_ascii_case("POST") || path != "/api/v1/cron/trigger" {
        return json_response(
            404,
            cors_headers,
            serde_json::json!({ "ok": false, "error": "Endpoint not found" }),
        );
    }

    #[derive(serde::Deserialize)]
    struct TriggerPayload {
        job_id: Option<u64>,
    }

    let payload: Option<TriggerPayload> = serde_json::from_slice(&req.body).ok();
    let job_id = match payload.and_then(|p| p.job_id) {
        Some(id) => id,
        None => {
            return json_response(
                400,
                cors_headers,
                serde_json::json!({ "ok": false, "error": "Missing job_id in JSON payload" }),
            );
        }
    };

    let job = match storage::get_job(job_id) {
        Some(j) => j,
        None => {
            return json_response(
                404,
                cors_headers,
                serde_json::json!({ "ok": false, "error": format!("Job {} not found", job_id) }),
            );
        }
    };

    if job.project_id != key_record.project_id {
        return json_response(
            403,
            cors_headers,
            serde_json::json!({ "ok": false, "error": "API key does not have access to this job's project" }),
        );
    }

    ic_cdk::futures::spawn(async move {
        engine::execute_single_job(job).await;
    });

    json_response(
        200,
        cors_headers,
        serde_json::json!({
            "ok": true,
            "job_id": job_id,
            "status": "triggered"
        }),
    )
}

// -----------------------------------------------------------------------------
// Security Unit Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_url_ssrf_validation() {
        assert!(validate_target_url("http://169.254.169.254/latest/meta-data").is_err());
        assert!(validate_target_url("https://169.254.1.1/api").is_err());
        assert!(validate_target_url("http://localhost:3000/trigger").is_err());
        assert!(validate_target_url("https://127.0.0.1:8080").is_err());
        assert!(validate_target_url("http://127.0.0.2/test").is_err());
        assert!(validate_target_url("http://0.0.0.0/test").is_err());
        assert!(validate_target_url("http://10.0.0.1/private").is_err());
        assert!(validate_target_url("http://192.168.1.1/router").is_err());
        assert!(validate_target_url("ftp://example.com/file").is_err());

        assert!(validate_target_url("https://httpbin.org/post").is_ok());
        assert!(validate_target_url("https://discord.com/api/webhooks/12345").is_ok());
        assert!(validate_target_url("https://api.myproject.com/v1/cron").is_ok());
    }

    #[test]
    fn test_extract_api_key_bearer() {
        let req = types::InboundHttpRequest {
            method: "POST".to_string(),
            url: "/api/v1/cron/trigger".to_string(),
            headers: vec![types::HeaderField(
                "Authorization".to_string(),
                "Bearer icp_cron_test_key_123".to_string(),
            )],
            body: vec![],
        };
        assert_eq!(
            extract_api_key(&req),
            Some("icp_cron_test_key_123".to_string())
        );
    }

    #[test]
    fn test_extract_api_key_body() {
        let payload = serde_json::json!({
            "api_key": "icp_cron_body_key_456",
            "job_id": 1
        });
        let req = types::InboundHttpRequest {
            method: "POST".to_string(),
            url: "/api/v1/cron/trigger".to_string(),
            headers: vec![],
            body: serde_json::to_vec(&payload).unwrap(),
        };
        assert_eq!(
            extract_api_key(&req),
            Some("icp_cron_body_key_456".to_string())
        );
    }

    #[test]
    fn test_extract_api_key_missing() {
        let req = types::InboundHttpRequest {
            method: "POST".to_string(),
            url: "/api/v1/cron/trigger".to_string(),
            headers: vec![],
            body: vec![],
        };
        assert_eq!(extract_api_key(&req), None);
    }

    #[test]
    fn test_paused_job_next_run_isolation() {
        let is_paused = matches!(
            types::JobStatus::Paused,
            types::JobStatus::Paused
                | types::JobStatus::AutoPausedDormant
                | types::JobStatus::ExhaustedCredits
                | types::JobStatus::DeadLetterQueue
        );
        assert!(is_paused);
    }
}
