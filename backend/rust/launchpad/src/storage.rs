use candid::Principal;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::{Bound, Storable},
    DefaultMemoryImpl, StableBTreeMap, StableCell,
};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::types::{Campaign, Commitment};

pub type Memory = VirtualMemory<DefaultMemoryImpl>;

pub const CONFIG_MEM_ID: MemoryId = MemoryId::new(0);
pub const COUNTER_MEM_ID: MemoryId = MemoryId::new(1);
pub const CAMPAIGNS_MEM_ID: MemoryId = MemoryId::new(2);
pub const COMMITMENTS_MEM_ID: MemoryId = MemoryId::new(3);

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CanisterConfig {
    pub wallet_canister: Principal,
    pub treasury: Principal,
    pub fee_e8s: u64, // 30 ICP default
}

impl Default for CanisterConfig {
    fn default() -> Self {
        Self {
            wallet_canister: Principal::anonymous(),
            treasury: Principal::anonymous(),
            fee_e8s: 199_000_000, // 1.99 ICP anti-spam listing fee
        }
    }
}

impl Storable for CanisterConfig {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode CanisterConfig");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode CanisterConfig");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode CanisterConfig")
    }
}

impl Storable for Campaign {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode Campaign");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode Campaign");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode Campaign")
    }
}

impl Storable for Commitment {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode Commitment");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode Commitment");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode Commitment")
    }
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct CommitmentKey {
    pub campaign_id: u64,
    pub participant: Principal,
}

impl Storable for CommitmentKey {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode CommitmentKey");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode CommitmentKey");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode CommitmentKey")
    }
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static CONFIG: RefCell<StableCell<CanisterConfig, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(CONFIG_MEM_ID)),
            CanisterConfig::default()
        )
    );

    static CAMPAIGN_COUNTER: RefCell<StableCell<u64, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(COUNTER_MEM_ID)),
            0
        )
    );

    static CAMPAIGNS: RefCell<StableBTreeMap<u64, Campaign, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(CAMPAIGNS_MEM_ID))
        )
    );

    static COMMITMENTS: RefCell<StableBTreeMap<CommitmentKey, Commitment, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(COMMITMENTS_MEM_ID))
        )
    );
}

pub fn get_config() -> CanisterConfig {
    CONFIG.with(|c| c.borrow().get().clone())
}

pub fn set_config(config: CanisterConfig) {
    CONFIG.with(|c| {
        let _ = c.borrow_mut().set(config);
    });
}

pub fn next_campaign_id() -> u64 {
    CAMPAIGN_COUNTER.with(|cnt| {
        let current = *cnt.borrow().get();
        let next = current + 1;
        let _ = cnt.borrow_mut().set(next);
        next
    })
}

pub fn get_campaign(id: u64) -> Option<Campaign> {
    CAMPAIGNS.with(|c| c.borrow().get(&id))
}

pub fn save_campaign(campaign: Campaign) {
    CAMPAIGNS.with(|c| {
        c.borrow_mut().insert(campaign.id, campaign);
    });
}

pub fn list_campaigns(limit: usize, offset: usize) -> Vec<Campaign> {
    CAMPAIGNS.with(|c| {
        c.borrow()
            .iter()
            .skip(offset)
            .take(limit)
            .map(|entry| entry.value())
            .collect()
    })
}

pub fn get_commitment(campaign_id: u64, user: Principal) -> Option<Commitment> {
    COMMITMENTS.with(|c| {
        let key = CommitmentKey { campaign_id, participant: user };
        c.borrow().get(&key)
    })
}

pub fn save_commitment(commitment: Commitment) {
    COMMITMENTS.with(|c| {
        let key = CommitmentKey {
            campaign_id: commitment.campaign_id,
            participant: commitment.participant,
        };
        c.borrow_mut().insert(key, commitment);
    });
}
