use candid::Principal;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use std::cell::RefCell;

use crate::types::{
    ApiKeyHash, ApiKeyRecord, ExecutionLog, JobRecord, LogSlotKey, OwnerJobKey,
    ProcessedBlockRecord, ProjectRecord, ScheduleKey, UserCreditRecord,
};

pub type Memory = VirtualMemory<DefaultMemoryImpl>;

pub const MEM_PROJECTS: MemoryId = MemoryId::new(0);
pub const MEM_CRON_JOBS: MemoryId = MemoryId::new(1);
pub const MEM_OWNER_JOBS_INDEX: MemoryId = MemoryId::new(2);
pub const MEM_SCHEDULE_INDEX: MemoryId = MemoryId::new(3);
pub const MEM_EXECUTION_LOGS: MemoryId = MemoryId::new(4);
pub const MEM_USER_CREDITS: MemoryId = MemoryId::new(5);
pub const MEM_API_KEYS: MemoryId = MemoryId::new(6);
pub const MEM_PROCESSED_BLOCKS: MemoryId = MemoryId::new(7);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static PROJECTS: RefCell<StableBTreeMap<u64, ProjectRecord, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MEM_PROJECTS))
        ));

    static CRON_JOBS: RefCell<StableBTreeMap<u64, JobRecord, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MEM_CRON_JOBS))
        ));

    static OWNER_JOBS_INDEX: RefCell<StableBTreeMap<OwnerJobKey, u64, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MEM_OWNER_JOBS_INDEX))
        ));

    static SCHEDULE_INDEX: RefCell<StableBTreeMap<ScheduleKey, u64, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MEM_SCHEDULE_INDEX))
        ));

    static EXECUTION_LOGS: RefCell<StableBTreeMap<LogSlotKey, ExecutionLog, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MEM_EXECUTION_LOGS))
        ));

    static USER_CREDITS: RefCell<StableBTreeMap<Principal, UserCreditRecord, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MEM_USER_CREDITS))
        ));

    static API_KEYS: RefCell<StableBTreeMap<ApiKeyHash, ApiKeyRecord, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MEM_API_KEYS))
        ));

    static PROCESSED_BLOCKS: RefCell<StableBTreeMap<u64, ProcessedBlockRecord, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MEM_PROCESSED_BLOCKS))
        ));
}

// -----------------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------------

pub fn next_project_id() -> u64 {
    PROJECTS.with(|m| {
        m.borrow()
            .last_key_value()
            .map(|(k, _)| k + 1)
            .unwrap_or(1)
    })
}

pub fn insert_project(project: ProjectRecord) {
    PROJECTS.with(|m| {
        m.borrow_mut().insert(project.id, project);
    });
}

pub fn get_project(id: u64) -> Option<ProjectRecord> {
    PROJECTS.with(|m| m.borrow().get(&id))
}

pub fn delete_project(id: u64) {
    PROJECTS.with(|m| {
        m.borrow_mut().remove(&id);
    });
}

pub fn list_projects_by_owner(owner: Principal) -> Vec<ProjectRecord> {
    PROJECTS.with(|m| {
        m.borrow()
            .iter()
            .filter(|e| e.value().owner == owner)
            .map(|e| e.value())
            .collect()
    })
}

// -----------------------------------------------------------------------------
// Jobs
// -----------------------------------------------------------------------------

pub fn next_job_id() -> u64 {
    CRON_JOBS.with(|m| {
        m.borrow()
            .last_key_value()
            .map(|(k, _)| k + 1)
            .unwrap_or(1)
    })
}

pub fn insert_job(job: JobRecord) {
    let job_id = job.id;
    let owner = job.owner;
    let next_run = job.next_run_at;

    CRON_JOBS.with(|m| {
        m.borrow_mut().insert(job_id, job);
    });

    OWNER_JOBS_INDEX.with(|m| {
        m.borrow_mut().insert(OwnerJobKey::new(owner, job_id), job_id);
    });

    if let Some(ts) = next_run {
        SCHEDULE_INDEX.with(|m| {
            m.borrow_mut().insert(ScheduleKey::new(ts, job_id), job_id);
        });
    }
}

pub fn get_job(id: u64) -> Option<JobRecord> {
    CRON_JOBS.with(|m| m.borrow().get(&id))
}

pub fn update_job(job: JobRecord) {
    let job_id = job.id;
    let next_run = job.next_run_at;

    CRON_JOBS.with(|m| {
        m.borrow_mut().insert(job_id, job);
    });

    if let Some(ts) = next_run {
        SCHEDULE_INDEX.with(|m| {
            m.borrow_mut().insert(ScheduleKey::new(ts, job_id), job_id);
        });
    }
}

pub fn delete_job_logs(job_id: u64) {
    EXECUTION_LOGS.with(|m| {
        let mut map = m.borrow_mut();
        for slot in 0u8..50 {
            map.remove(&LogSlotKey::new(job_id, slot));
        }
    });
}

pub fn delete_job(id: u64) -> Option<JobRecord> {
    let job_opt = CRON_JOBS.with(|m| m.borrow_mut().remove(&id));
    if let Some(ref job) = job_opt {
        OWNER_JOBS_INDEX.with(|m| {
            m.borrow_mut().remove(&OwnerJobKey::new(job.owner, id));
        });
        if let Some(ts) = job.next_run_at {
            SCHEDULE_INDEX.with(|m| {
                m.borrow_mut().remove(&ScheduleKey::new(ts, id));
            });
        }
        delete_job_logs(id);
    }
    job_opt
}

pub fn remove_from_schedule(ts: u64, job_id: u64) {
    SCHEDULE_INDEX.with(|m| {
        m.borrow_mut().remove(&ScheduleKey::new(ts, job_id));
    });
}

pub fn list_jobs_by_owner(owner: Principal, project_id: Option<u64>) -> Vec<JobRecord> {
    OWNER_JOBS_INDEX.with(|idx| {
        idx.borrow()
            .iter()
            .filter(|e| {
                let key = e.key();
                let slice = owner.as_slice();
                let len = slice.len().min(29);
                key.0[0] == len as u8 && &key.0[1..=len] == &slice[..len]
            })
            .filter_map(|e| get_job(e.value()))
            .filter(|job| {
                if let Some(pid) = project_id {
                    job.project_id == pid
                } else {
                    true
                }
            })
            .collect()
    })
}

pub fn count_jobs_in_project(project_id: u64) -> u64 {
    CRON_JOBS.with(|m| {
        m.borrow()
            .iter()
            .filter(|e| e.value().project_id == project_id)
            .count() as u64
    })
}

// -----------------------------------------------------------------------------
// Schedule Queue
// -----------------------------------------------------------------------------

pub fn get_earliest_scheduled_timestamp() -> Option<u64> {
    SCHEDULE_INDEX.with(|m| {
        m.borrow()
            .iter()
            .next()
            .map(|e| e.key().timestamp())
    })
}

pub fn pop_due_jobs(up_to_ts: u64, limit: usize) -> Vec<JobRecord> {
    SCHEDULE_INDEX.with(|m| {
        let mut map = m.borrow_mut();
        let due_keys: Vec<(ScheduleKey, u64)> = map
            .iter()
            .take_while(|e| e.key().timestamp() <= up_to_ts)
            .take(limit)
            .map(|e| (*e.key(), e.value()))
            .collect();

        let mut jobs = Vec::with_capacity(due_keys.len());
        for (key, job_id) in due_keys {
            map.remove(&key);
            if let Some(job) = get_job(job_id) {
                jobs.push(job);
            }
        }
        jobs
    })
}

// -----------------------------------------------------------------------------
// Logs (Modulo-50 Ring Buffer)
// -----------------------------------------------------------------------------

pub fn insert_execution_log(log: ExecutionLog, total_runs: u64) {
    let slot = (total_runs % 50) as u8;
    let key = LogSlotKey::new(log.job_id, slot);
    EXECUTION_LOGS.with(|m| {
        m.borrow_mut().insert(key, log);
    });
}

pub fn list_job_logs(job_id: u64, limit: usize) -> Vec<ExecutionLog> {
    EXECUTION_LOGS.with(|m| {
        let mut logs: Vec<ExecutionLog> = (0u8..50)
            .filter_map(|slot| m.borrow().get(&LogSlotKey::new(job_id, slot)))
            .collect();
        logs.sort_by(|a, b| b.started_at.cmp(&a.started_at));
        logs.truncate(limit);
        logs
    })
}

// -----------------------------------------------------------------------------
// Credits
// -----------------------------------------------------------------------------

pub fn get_user_credits(owner: Principal, current_month: u32, now_sec: u64) -> UserCreditRecord {
    USER_CREDITS.with(|m| {
        let mut map = m.borrow_mut();
        match map.get(&owner) {
            Some(mut creds) => {
                if creds.current_month_epoch != current_month {
                    creds.current_month_epoch = current_month;
                    creds.free_runs_used = 0;
                    creds.updated_at = now_sec;
                    map.insert(owner, creds.clone());
                }
                creds
            }
            None => {
                let creds = UserCreditRecord {
                    owner,
                    current_month_epoch: current_month,
                    free_runs_used: 0,
                    prepaid_credits: 0,
                    total_purchased: 0,
                    total_used: 0,
                    updated_at: now_sec,
                };
                map.insert(owner, creds.clone());
                creds
            }
        }
    })
}

pub fn deduct_credits(owner: Principal, cost: u64, current_month: u32, now_sec: u64) -> bool {
    USER_CREDITS.with(|m| {
        let mut map = m.borrow_mut();
        let mut creds = match map.get(&owner) {
            Some(mut c) => {
                if c.current_month_epoch != current_month {
                    c.current_month_epoch = current_month;
                    c.free_runs_used = 0;
                }
                c
            }
            None => UserCreditRecord {
                owner,
                current_month_epoch: current_month,
                free_runs_used: 0,
                prepaid_credits: 0,
                total_purchased: 0,
                total_used: 0,
                updated_at: now_sec,
            },
        };

        let free_avail = 60u64.saturating_sub(creds.free_runs_used);
        let total_avail = free_avail + creds.prepaid_credits;
        if total_avail < cost {
            return false;
        }

        let from_free = cost.min(free_avail);
        let from_paid = cost - from_free;

        creds.free_runs_used += from_free;
        creds.prepaid_credits = creds.prepaid_credits.saturating_sub(from_paid);
        creds.total_used += cost;
        creds.updated_at = now_sec;

        map.insert(owner, creds);
        true
    })
}

pub fn add_prepaid_credits(owner: Principal, credits: u64, current_month: u32, now_sec: u64) -> u64 {
    USER_CREDITS.with(|m| {
        let mut map = m.borrow_mut();
        let mut creds = match map.get(&owner) {
            Some(mut c) => {
                if c.current_month_epoch != current_month {
                    c.current_month_epoch = current_month;
                    c.free_runs_used = 0;
                }
                c
            }
            None => UserCreditRecord {
                owner,
                current_month_epoch: current_month,
                free_runs_used: 0,
                prepaid_credits: 0,
                total_purchased: 0,
                total_used: 0,
                updated_at: now_sec,
            },
        };

        creds.prepaid_credits += credits;
        creds.total_purchased += credits;
        creds.updated_at = now_sec;

        map.insert(owner, creds.clone());
        creds.prepaid_credits
    })
}

// -----------------------------------------------------------------------------
// Processed Blocks (Replay Protection)
// -----------------------------------------------------------------------------

pub fn has_processed_block(block_index: u64) -> bool {
    PROCESSED_BLOCKS.with(|m| m.borrow().contains_key(&block_index))
}

pub fn record_processed_block(record: ProcessedBlockRecord) {
    PROCESSED_BLOCKS.with(|m| {
        m.borrow_mut().insert(record.block_index, record);
    });
}

// -----------------------------------------------------------------------------
// API Keys
// -----------------------------------------------------------------------------

pub fn insert_api_key(key: ApiKeyRecord) {
    API_KEYS.with(|m| {
        m.borrow_mut().insert(ApiKeyHash(key.key_hash), key);
    });
}

pub fn get_api_key(hash: &[u8; 32]) -> Option<ApiKeyRecord> {
    API_KEYS.with(|m| m.borrow().get(&ApiKeyHash(*hash)))
}

pub fn revoke_api_key(hash: &[u8; 32], now_sec: u64) -> Result<(), String> {
    API_KEYS.with(|m| {
        let mut map = m.borrow_mut();
        let mut record = map
            .get(&ApiKeyHash(*hash))
            .ok_or_else(|| "API key not found".to_string())?;
        record.revoked = true;
        record.revoked_at = Some(now_sec);
        map.insert(ApiKeyHash(*hash), record);
        Ok(())
    })
}

pub fn delete_api_key(hash: &[u8; 32]) -> Result<(), String> {
    API_KEYS.with(|m| {
        m.borrow_mut()
            .remove(&ApiKeyHash(*hash))
            .map(|_| ())
            .ok_or_else(|| "API key not found".to_string())
    })
}

pub fn list_api_keys_by_project(project_id: u64) -> Vec<ApiKeyRecord> {
    API_KEYS.with(|m| {
        m.borrow()
            .iter()
            .filter(|e| e.value().project_id == project_id)
            .map(|e| e.value())
            .collect()
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{CompiledCron, ExecutionLog, HttpMethod, JobRecord, JobStatus, JobTarget};

    #[test]
    fn test_credits_lifecycle() {
        let user = Principal::from_slice(&[1, 2, 3, 4]);
        let month = 202611;
        let now = 1731000000;

        // Fresh user starts with 60 free runs
        let c = get_user_credits(user, month, now);
        assert_eq!(c.free_runs_used, 0);
        assert_eq!(c.prepaid_credits, 0);

        // Deduct 1 credit (uses free)
        assert!(deduct_credits(user, 1, month, now));
        let c = get_user_credits(user, month, now);
        assert_eq!(c.free_runs_used, 1);

        // Deduct 59 credits (exhausts free runs)
        assert!(deduct_credits(user, 59, month, now));
        let c = get_user_credits(user, month, now);
        assert_eq!(c.free_runs_used, 60);

        // Deduct 1 more without prepaid should fail
        assert!(!deduct_credits(user, 1, month, now));

        // Add 2,500 prepaid credits
        add_prepaid_credits(user, 2500, month, now);
        assert!(deduct_credits(user, 2, month, now));
        let c = get_user_credits(user, month, now);
        assert_eq!(c.prepaid_credits, 2498);
        assert_eq!(c.total_used, 62);

        // Next month rollover resets free runs
        let next_month = 202612;
        let c_next = get_user_credits(user, next_month, now + 86400 * 30);
        assert_eq!(c_next.free_runs_used, 0);
        assert_eq!(c_next.prepaid_credits, 2498);
    }

    #[test]
    fn test_ring_buffer_logs() {
        let job_id = 999;
        for i in 0..60 {
            insert_execution_log(
                ExecutionLog {
                    log_id: i,
                    job_id,
                    started_at: 1000 + i,
                    duration_ms: 10,
                    success: true,
                    status_code: Some(200),
                    response_snippet: format!("run {i}"),
                    error: None,
                },
                i,
            );
        }

        let logs = list_job_logs(job_id, 100);
        assert_eq!(logs.len(), 50);
        // Latest log should be 59
        assert_eq!(logs[0].log_id, 59);
    }

    #[test]
    fn test_schedule_queue_pop() {
        let job_id = 777;
        let owner = Principal::from_slice(&[9, 9, 9]);
        let job = JobRecord {
            id: job_id,
            project_id: 1,
            owner,
            label: "test".to_string(),
            target: JobTarget::HttpWebhook {
                url: "https://example.com".to_string(),
                method: HttpMethod::GET,
                headers: vec![],
                body: None,
            },
            cron_expression: "* * * * *".to_string(),
            compiled_cron: CompiledCron::default(),
            status: JobStatus::Active,
            max_retries: 3,
            consecutive_failures: 0,
            total_runs: 0,
            next_run_at: Some(500),
            last_run_at: None,
            created_at: 100,
            updated_at: 100,
        };

        insert_job(job);
        let due = pop_due_jobs(600, 10);
        assert_eq!(due.len(), 1);
        assert_eq!(due[0].id, job_id);

        // After pop, queue should be empty
        let due_empty = pop_due_jobs(600, 10);
        assert_eq!(due_empty.len(), 0);
    }
}
