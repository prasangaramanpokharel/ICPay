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
                ciborium::into_writer(self, &mut buf).expect("cbor serialization failed");
                Cow::Owned(buf)
            }

            fn into_bytes(self) -> Vec<u8> {
                let mut buf = vec![];
                ciborium::into_writer(&self, &mut buf).expect("cbor serialization failed");
                buf
            }

            fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
                ciborium::from_reader(bytes.as_ref()).expect("cbor deserialization failed")
            }
        }
    };
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct PrincipalKey(pub Principal);
impl_storable_cbor!(PrincipalKey);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct AcademyConfig {
    pub owner: Principal,
    pub treasury: Principal,
    pub ledger_canister: Principal,
    pub next_audit_id: u64,
    pub is_initialized: bool,
}

impl Default for AcademyConfig {
    fn default() -> Self {
        Self {
            owner: Principal::anonymous(),
            treasury: Principal::anonymous(),
            ledger_canister: Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap(),
            next_audit_id: 1,
            is_initialized: false,
        }
    }
}
impl_storable_cbor!(AcademyConfig);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum LessonType {
    Video,
    CodeLab,
    Reading,
    Quiz,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Lesson {
    pub id: String,
    pub course_id: String,
    pub module_id: String,
    pub title: String,
    pub slug: String,
    pub description: String,
    pub duration_minutes: u32,
    pub lesson_type: LessonType,
    pub video_url: String,
    pub thumbnail_url: String,
    pub preview_available: bool,
    pub order: u32,
    pub key_takeaways: Vec<String>,
    pub created_at: u64,
}
impl_storable_cbor!(Lesson);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct CourseModule {
    pub id: String,
    pub course_id: String,
    pub title: String,
    pub slug: String,
    pub description: String,
    pub order: u32,
    pub estimated_hours: u32,
    pub created_at: u64,
}
impl_storable_cbor!(CourseModule);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Course {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub headline: String,
    pub description: String,
    pub level: String,
    pub badge: String,
    pub price_e8s: u64,
    pub total_hours: u32,
    pub total_lessons: u32,
    pub cover_image: String,
    pub instructor_name: String,
    pub instructor_role: String,
    pub is_published: bool,
    pub created_at: u64,
    pub updated_at: u64,
}
impl_storable_cbor!(Course);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct UserEnrollment {
    pub user: Principal,
    pub course_id: String,
    pub enrolled_at: u64,
    pub payment_block_index: Option<u64>,
    pub amount_paid_e8s: u64,
}
impl_storable_cbor!(UserEnrollment);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct UserProgress {
    pub user: Principal,
    pub course_id: String,
    pub completed_lesson_ids: Vec<String>,
    pub percent_complete: u8,
    pub started_at: u64,
    pub last_active_at: u64,
    pub is_completed: bool,
    pub certificate_id: Option<String>,
}
impl_storable_cbor!(UserProgress);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Certificate {
    pub id: String,
    pub user: Principal,
    pub course_id: String,
    pub course_title: String,
    pub issued_at: u64,
    pub verification_hash: String,
}
impl_storable_cbor!(Certificate);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct PaymentRecord {
    pub block_index: u64,
    pub payer: Principal,
    pub course_id: String,
    pub amount_e8s: u64,
    pub timestamp: u64,
}
impl_storable_cbor!(PaymentRecord);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct AuditLogEntry {
    pub id: u64,
    pub timestamp: u64,
    pub action: String,
    pub admin: Principal,
    pub target_id: String,
    pub details: String,
}
impl_storable_cbor!(AuditLogEntry);

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct AcademyStats {
    pub total_courses: u32,
    pub total_modules: u32,
    pub total_lessons: u32,
    pub total_students: u64,
    pub total_enrollments: u64,
    pub today_enrollments: u64,
    pub total_completed_lessons: u64,
    pub total_certificates_issued: u64,
    pub total_revenue_e8s: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct CourseStats {
    pub total_enrolled: u64,
    pub today_enrolled: u64,
    pub total_completed: u64,
    pub completion_rate_percent: u8,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct ModuleDetail {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub description: String,
    pub order: u32,
    pub estimated_hours: u32,
    pub lessons: Vec<Lesson>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct CourseDetail {
    pub course: Course,
    pub modules: Vec<ModuleDetail>,
    pub is_enrolled: bool,
    pub user_progress: Option<UserProgress>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct CourseModuleKey {
    pub course_id: String,
    pub module_id: String,
}
impl_storable_cbor!(CourseModuleKey);

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct LessonKey {
    pub course_id: String,
    pub module_id: String,
    pub lesson_id: String,
}
impl_storable_cbor!(LessonKey);

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct UserCourseKey {
    pub user: Principal,
    pub course_id: String,
}
impl_storable_cbor!(UserCourseKey);

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct EnrollmentTimeKey {
    pub timestamp_nanos: u64,
    pub user: Principal,
    pub course_id: String,
}
impl_storable_cbor!(EnrollmentTimeKey);

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateCourseArgs {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub headline: String,
    pub description: String,
    pub level: String,
    pub badge: String,
    pub price_e8s: u64,
    pub total_hours: u32,
    pub cover_image: String,
    pub instructor_name: String,
    pub instructor_role: String,
    pub is_published: bool,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UpdateCourseArgs {
    pub id: String,
    pub slug: Option<String>,
    pub title: Option<String>,
    pub headline: Option<String>,
    pub description: Option<String>,
    pub level: Option<String>,
    pub badge: Option<String>,
    pub price_e8s: Option<u64>,
    pub total_hours: Option<u32>,
    pub cover_image: Option<String>,
    pub instructor_name: Option<String>,
    pub instructor_role: Option<String>,
    pub is_published: Option<bool>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateModuleArgs {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub description: String,
    pub order: u32,
    pub estimated_hours: u32,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UpdateModuleArgs {
    pub title: Option<String>,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub order: Option<u32>,
    pub estimated_hours: Option<u32>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateLessonArgs {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub description: String,
    pub duration_minutes: u32,
    pub lesson_type: LessonType,
    pub video_url: String,
    pub thumbnail_url: String,
    pub preview_available: bool,
    pub order: u32,
    pub key_takeaways: Vec<String>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UpdateLessonArgs {
    pub title: Option<String>,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub duration_minutes: Option<u32>,
    pub lesson_type: Option<LessonType>,
    pub video_url: Option<String>,
    pub thumbnail_url: Option<String>,
    pub preview_available: Option<bool>,
    pub order: Option<u32>,
    pub key_takeaways: Option<Vec<String>>,
}
