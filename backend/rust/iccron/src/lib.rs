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

#[ic_cdk::update]
fn create_job(args: CreateJobArgs) -> Result<JobRecord, String> {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot create jobs".to_string());
    }

    let project = storage::get_project(args.project_id)
        .ok_or_else(|| "Project not found".to_string())?;
    if project.owner != caller {
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
            let u = url.trim();
            if !u.starts_with("https://") && !u.starts_with("http://") {
                return Err("Webhook URL must begin with https:// or http://".to_string());
            }
            if u.len() > 2048 {
                return Err("Webhook URL exceeds 2048 characters".to_string());
            }
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
        owner: caller,
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
                let u = url.trim();
                if !u.starts_with("https://") && !u.starts_with("http://") {
                    return Err("Webhook URL must begin with https:// or http://".to_string());
                }
                if u.len() > 2048 {
                    return Err("Webhook URL exceeds 2048 characters".to_string());
                }
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

#[ic_cdk::update]
fn pause_job(job_id: u64) -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    let mut job = storage::get_job(job_id).ok_or_else(|| "Job not found".to_string())?;
    if job.owner != caller {
        return Err("Unauthorized".to_string());
    }

    if let Some(ts) = job.next_run_at {
        storage::remove_from_schedule(ts, job_id);
    }
    let now_sec = ic_cdk::api::time() / 1_000_000_000;
    job.status = JobStatus::Paused;
    job.next_run_at = None;
    job.updated_at = now_sec;
    storage::update_job(job);
    engine::arm_next_timer();
    Ok(())
}

#[ic_cdk::update]
fn resume_job(job_id: u64) -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    let mut job = storage::get_job(job_id).ok_or_else(|| "Job not found".to_string())?;
    if job.owner != caller {
        return Err("Unauthorized".to_string());
    }

    let now_sec = ic_cdk::api::time() / 1_000_000_000;
    job.status = JobStatus::Active;
    job.consecutive_failures = 0;
    job.next_run_at = cron::next_run_timestamp(&job.compiled_cron, now_sec);
    job.updated_at = now_sec;

    storage::update_job(job);
    engine::arm_next_timer();
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
    if job.owner != caller {
        return Err("Unauthorized".to_string());
    }
    Ok(job)
}

#[ic_cdk::query]
fn get_job_logs(job_id: u64, limit: Option<u64>) -> Vec<ExecutionLog> {
    let caller = ic_cdk::api::msg_caller();
    if let Some(job) = storage::get_job(job_id) {
        if job.owner != caller {
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
