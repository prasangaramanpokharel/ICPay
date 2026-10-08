use candid::Principal;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use std::cell::RefCell;

use crate::types::{LinkCanisterArgs, LinkedCanister, LinkedCanisterKey};

pub type Memory = VirtualMemory<DefaultMemoryImpl>;

pub const LINKED_CANISTERS_MEM_ID: MemoryId = MemoryId::new(0);
pub const MAX_CANISTERS_PER_USER: usize = 128;

thread_local! {
    pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    pub static LINKED_CANISTERS: RefCell<StableBTreeMap<LinkedCanisterKey, LinkedCanister, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(LINKED_CANISTERS_MEM_ID))
        ));
}

pub fn list_for_owner(owner: Principal) -> Vec<LinkedCanister> {
    LINKED_CANISTERS.with(|m| {
        let mut list: Vec<LinkedCanister> = m
            .borrow()
            .iter()
            .filter(|entry| entry.key().owner == owner)
            .map(|entry| entry.value())
            .collect();
        // Sort descending by updated_at (most recently updated first)
        list.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        list
    })
}

pub fn link(
    owner: Principal,
    args: LinkCanisterArgs,
    now_nanos: u64,
) -> Result<LinkedCanister, String> {
    let key = LinkedCanisterKey {
        owner,
        canister_id: args.canister_id,
    };

    LINKED_CANISTERS.with(|m| {
        let mut map = m.borrow_mut();
        let existing = map.get(&key);

        if existing.is_none() {
            let user_count = map.iter().filter(|entry| entry.key().owner == owner).count();
            if user_count >= MAX_CANISTERS_PER_USER {
                return Err(format!(
                    "Maximum linked canisters ({}) reached for this account",
                    MAX_CANISTERS_PER_USER
                ));
            }
        }

        let linked_at = existing.as_ref().map(|e| e.linked_at).unwrap_or(now_nanos);
        let record = LinkedCanister {
            canister_id: args.canister_id,
            name: args.name.trim().to_string(),
            description: args.description.map(|d| d.trim().to_string()),
            linked_at,
            updated_at: now_nanos,
        };

        map.insert(key, record.clone());
        Ok(record)
    })
}

pub fn unlink(owner: Principal, canister_id: Principal) -> Result<(), String> {
    let key = LinkedCanisterKey { owner, canister_id };
    LINKED_CANISTERS.with(|m| {
        let mut map = m.borrow_mut();
        if map.remove(&key).is_none() {
            return Err("Canister is not linked to this account".to_string());
        }
        Ok(())
    })
}

pub fn update_name(
    owner: Principal,
    canister_id: Principal,
    name: String,
    now_nanos: u64,
) -> Result<(), String> {
    let key = LinkedCanisterKey { owner, canister_id };
    LINKED_CANISTERS.with(|m| {
        let mut map = m.borrow_mut();
        let mut existing = match map.get(&key) {
            Some(e) => e,
            None => return Err("Canister is not linked to this account".to_string()),
        };
        existing.name = name.trim().to_string();
        existing.updated_at = now_nanos;
        map.insert(key, existing);
        Ok(())
    })
}
