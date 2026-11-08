use candid::{CandidType, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

macro_rules! impl_storable_cbor {
    ($type:ty) => {
        impl Storable for $type {
            const BOUND: Bound = Bound::Unbounded;

            fn to_bytes(&self) -> Cow<'_, [u8]> {
                let mut buf = vec![];
                ciborium::into_writer(self, &mut buf).expect("cbor encode");
                Cow::Owned(buf)
            }

            fn into_bytes(self) -> Vec<u8> {
                let mut buf = vec![];
                ciborium::into_writer(&self, &mut buf).expect("cbor encode");
                buf
            }

            fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
                ciborium::from_reader(bytes.as_ref()).expect("cbor decode")
            }
        }
    };
}

#[derive(CandidType, Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum HttpMethod {
    GET,
    POST,
    HEAD,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum JobTarget {
    CanisterCall {
        canister_id: Principal,
        method: String,
        payload: Vec<u8>,
    },
    HttpWebhook {
        url: String,
        method: HttpMethod,
        headers: Vec<(String, String)>,
        body: Option<Vec<u8>>,
    },
}

#[repr(C)]
#[derive(CandidType, Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Default)]
pub struct CompiledCron {
    pub minutes: u64,
    pub hours: u32,
    pub days: u32,
    pub months: u16,
    pub weekdays: u8,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum JobStatus {
    Active,
    Paused,
    Completed,
    ExhaustedCredits,
    DeadLetterQueue,
    AutoPausedDormant,
    TargetUnavailable,
}

impl JobStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Active => "Active",
            Self::Paused => "Paused",
            Self::Completed => "Completed",
            Self::ExhaustedCredits => "ExhaustedCredits",
            Self::DeadLetterQueue => "DeadLetterQueue",
            Self::AutoPausedDormant => "AutoPausedDormant",
            Self::TargetUnavailable => "TargetUnavailable",
        }
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct JobRecord {
    pub id: u64,
    pub project_id: u64,
    pub owner: Principal,
    pub label: String,
    pub target: JobTarget,
    pub cron_expression: String,
    pub compiled_cron: CompiledCron,
    pub status: JobStatus,
    pub max_retries: u8,
    pub consecutive_failures: u8,
    pub total_runs: u64,
    pub next_run_at: Option<u64>,
    pub last_run_at: Option<u64>,
    pub created_at: u64,
    pub updated_at: u64,
}

impl_storable_cbor!(JobRecord);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ProjectRecord {
    pub id: u64,
    pub owner: Principal,
    pub name: String,
    pub created_at: u64,
}

impl_storable_cbor!(ProjectRecord);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ApiKeyRecord {
    pub key_hash: [u8; 32],
    pub project_id: u64,
    pub owner: Principal,
    pub label: String,
    pub revoked: bool,
    pub created_at: u64,
    pub revoked_at: Option<u64>,
}

impl_storable_cbor!(ApiKeyRecord);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ExecutionLog {
    pub log_id: u64,
    pub job_id: u64,
    pub started_at: u64,
    pub duration_ms: u32,
    pub success: bool,
    pub status_code: Option<u16>,
    pub response_snippet: String,
    pub error: Option<String>,
}

impl_storable_cbor!(ExecutionLog);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UserCreditRecord {
    pub owner: Principal,
    pub current_month_epoch: u32,
    pub free_runs_used: u64,
    pub prepaid_credits: u64,
    pub total_purchased: u64,
    pub total_used: u64,
    pub updated_at: u64,
}

impl_storable_cbor!(UserCreditRecord);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ProcessedBlockRecord {
    pub block_index: u64,
    pub buyer: Principal,
    pub pack_tier: u8,
    pub amount_e8s: u64,
    pub claimed_at: u64,
}

impl_storable_cbor!(ProcessedBlockRecord);

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub struct ScheduleKey(pub [u8; 16]);

impl Storable for ScheduleKey {
    const BOUND: Bound = Bound::Bounded {
        max_size: 16,
        is_fixed_size: true,
    };

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Borrowed(&self.0)
    }

    fn into_bytes(self) -> Vec<u8> {
        self.0.to_vec()
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        let mut arr = [0u8; 16];
        arr.copy_from_slice(bytes.as_ref());
        Self(arr)
    }
}

impl ScheduleKey {
    pub fn new(next_run_ts: u64, job_id: u64) -> Self {
        let mut buf = [0u8; 16];
        buf[0..8].copy_from_slice(&next_run_ts.to_be_bytes());
        buf[8..16].copy_from_slice(&job_id.to_be_bytes());
        Self(buf)
    }

    pub fn timestamp(&self) -> u64 {
        u64::from_be_bytes(self.0[0..8].try_into().unwrap())
    }

    pub fn job_id(&self) -> u64 {
        u64::from_be_bytes(self.0[8..16].try_into().unwrap())
    }
}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub struct LogSlotKey(pub [u8; 9]);

impl Storable for LogSlotKey {
    const BOUND: Bound = Bound::Bounded {
        max_size: 9,
        is_fixed_size: true,
    };

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Borrowed(&self.0)
    }

    fn into_bytes(self) -> Vec<u8> {
        self.0.to_vec()
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        let mut arr = [0u8; 9];
        arr.copy_from_slice(bytes.as_ref());
        Self(arr)
    }
}

impl LogSlotKey {
    pub fn new(job_id: u64, slot: u8) -> Self {
        let mut buf = [0u8; 9];
        buf[0..8].copy_from_slice(&job_id.to_be_bytes());
        buf[8] = slot;
        Self(buf)
    }
}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub struct OwnerJobKey(pub [u8; 38]);

impl Storable for OwnerJobKey {
    const BOUND: Bound = Bound::Bounded {
        max_size: 38,
        is_fixed_size: true,
    };

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Borrowed(&self.0)
    }

    fn into_bytes(self) -> Vec<u8> {
        self.0.to_vec()
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        let mut arr = [0u8; 38];
        arr.copy_from_slice(bytes.as_ref());
        Self(arr)
    }
}

impl OwnerJobKey {
    pub fn new(owner: Principal, job_id: u64) -> Self {
        let mut buf = [0u8; 38];
        let slice = owner.as_slice();
        let len = slice.len().min(29);
        buf[0] = len as u8;
        buf[1..1 + len].copy_from_slice(&slice[..len]);
        buf[30..38].copy_from_slice(&job_id.to_be_bytes());
        Self(buf)
    }

    pub fn job_id(&self) -> u64 {
        u64::from_be_bytes(self.0[30..38].try_into().unwrap())
    }
}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub struct ApiKeyHash(pub [u8; 32]);

impl Storable for ApiKeyHash {
    const BOUND: Bound = Bound::Bounded {
        max_size: 32,
        is_fixed_size: true,
    };

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Borrowed(&self.0)
    }

    fn into_bytes(self) -> Vec<u8> {
        self.0.to_vec()
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        let mut arr = [0u8; 32];
        arr.copy_from_slice(bytes.as_ref());
        Self(arr)
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreateJobArgs {
    pub project_id: u64,
    pub label: String,
    pub target: JobTarget,
    pub cron_expression: String,
    pub max_retries: Option<u8>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UpdateJobArgs {
    pub job_id: u64,
    pub label: Option<String>,
    pub target: Option<JobTarget>,
    pub cron_expression: Option<String>,
    pub max_retries: Option<u8>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct JobSummary {
    pub id: u64,
    pub project_id: u64,
    pub label: String,
    pub cron_expression: String,
    pub target_type: String,
    pub target_preview: String,
    pub status: String,
    pub consecutive_failures: u8,
    pub total_runs: u64,
    pub next_run_at: Option<u64>,
    pub last_run_at: Option<u64>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ApiKeySummary {
    pub key_hash: [u8; 32],
    pub project_id: u64,
    pub label: String,
    pub revoked: bool,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreditBalance {
    pub free_runs_remaining: u64,
    pub prepaid_credits: u64,
    pub total_available: u64,
    pub total_used: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PackQuote {
    pub pack_tier: u8,
    pub credits: u64,
    pub usd_cents: u32,
    pub icp_e8s: u64,
    pub treasury_principal: String,
}
