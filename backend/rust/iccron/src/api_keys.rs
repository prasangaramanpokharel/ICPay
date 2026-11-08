use candid::Principal;
use sha2::{Digest, Sha256};
use std::sync::atomic::{AtomicU64, Ordering};

use crate::storage;
use crate::types::{ApiKeyRecord, ApiKeySummary};

static KEY_COUNTER: AtomicU64 = AtomicU64::new(1);

pub fn hash_key(raw_key: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(raw_key.as_bytes());
    let res = hasher.finalize();
    let mut hash = [0u8; 32];
    hash.copy_from_slice(&res);
    hash
}

pub fn generate_key(
    project_id: u64,
    label: String,
    owner: Principal,
    now_nanos: u64,
) -> (String, ApiKeyRecord) {
    let count = KEY_COUNTER.fetch_add(1, Ordering::Relaxed);
    let mut hasher = Sha256::new();
    hasher.update(b"icpay_cron_api_key_v1:");
    hasher.update(owner.as_slice());
    hasher.update(&project_id.to_be_bytes());
    hasher.update(&now_nanos.to_be_bytes());
    hasher.update(&count.to_be_bytes());
    let digest = hasher.finalize();
    let raw_key = format!("icp_cron_{}", hex::encode(digest));

    let key_hash = hash_key(&raw_key);
    let now_sec = now_nanos / 1_000_000_000;

    let record = ApiKeyRecord {
        key_hash,
        project_id,
        owner,
        label,
        revoked: false,
        created_at: now_sec,
        revoked_at: None,
    };

    storage::insert_api_key(record.clone());

    (raw_key, record)
}

pub fn verify_key(raw_key: &str) -> Option<ApiKeyRecord> {
    let key_hash = hash_key(raw_key);
    match storage::get_api_key(&key_hash) {
        Some(record) if !record.revoked => Some(record),
        _ => None,
    }
}

pub fn revoke_key(hash: &[u8; 32], owner: Principal, now_sec: u64) -> Result<(), String> {
    let rec = storage::get_api_key(hash).ok_or_else(|| "API key not found".to_string())?;
    if rec.owner != owner {
        return Err("Unauthorized".to_string());
    }
    storage::revoke_api_key(hash, now_sec)
}

pub fn delete_key(hash: &[u8; 32], owner: Principal) -> Result<(), String> {
    let rec = storage::get_api_key(hash).ok_or_else(|| "API key not found".to_string())?;
    if rec.owner != owner {
        return Err("Unauthorized".to_string());
    }
    storage::delete_api_key(hash)
}

pub fn list_keys(project_id: u64, owner: Principal) -> Result<Vec<ApiKeySummary>, String> {
    let project = storage::get_project(project_id).ok_or_else(|| "Project not found".to_string())?;
    if project.owner != owner {
        return Err("Unauthorized".to_string());
    }
    let keys = storage::list_api_keys_by_project(project_id)
        .into_iter()
        .map(|k| ApiKeySummary {
            key_hash: k.key_hash,
            project_id: k.project_id,
            label: k.label,
            revoked: k.revoked,
            created_at: k.created_at,
        })
        .collect();
    Ok(keys)
}
