use candid::Principal;
use ic_cdk::{query, update};

pub mod storage;
pub mod types;

use types::{LinkCanisterArgs, LinkedCanister};

fn caller_or_trap() -> Principal {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous caller is not permitted");
    }
    caller
}

#[query]
fn get_linked_canisters() -> Vec<LinkedCanister> {
    let caller = caller_or_trap();
    storage::list_for_owner(caller)
}

#[update]
fn link_canister(args: LinkCanisterArgs) -> Result<LinkedCanister, String> {
    let caller = caller_or_trap();
    if args.canister_id == Principal::anonymous() {
        return Err("Cannot link anonymous canister".to_string());
    }
    let now = ic_cdk::api::time();
    storage::link(caller, args, now)
}

#[update]
fn unlink_canister(canister_id: Principal) -> Result<(), String> {
    let caller = caller_or_trap();
    storage::unlink(caller, canister_id)
}

#[update]
fn update_canister_name(canister_id: Principal, name: String) -> Result<(), String> {
    let caller = caller_or_trap();
    let now = ic_cdk::api::time();
    storage::update_name(caller, canister_id, name, now)
}

#[update]
fn batch_sync_canisters(entries: Vec<LinkCanisterArgs>) -> Result<Vec<LinkedCanister>, String> {
    let caller = caller_or_trap();
    let now = ic_cdk::api::time();
    for entry in entries {
        if entry.canister_id != Principal::anonymous() {
            let _ = storage::link(caller, entry, now);
        }
    }
    Ok(storage::list_for_owner(caller))
}

ic_cdk::export_candid!();
