use candid::Principal;
use ic_cdk::{init, post_upgrade, query, update};
use sha2::{Digest, Sha256};

pub mod ledger;
pub mod seed;
pub mod storage;
pub mod types;

use types::{
    AcademyStats, AuditLogEntry, Certificate, Course, CourseDetail,
    CourseModule, CourseStats, CreateCourseArgs, CreateLessonArgs, CreateModuleArgs,
    Lesson, ModuleDetail, UpdateCourseArgs, UpdateLessonArgs, UpdateModuleArgs,
    UserEnrollment, UserProgress,
};

fn caller_or_trap() -> Principal {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous caller is not permitted for authenticated operations");
    }
    caller
}

fn admin_or_trap() -> Principal {
    let caller = caller_or_trap();
    if !storage::is_admin(caller) {
        ic_cdk::trap("Caller is not authorized as an academy administrator");
    }
    caller
}

#[init]
fn init(owner_opt: Option<Principal>) {
    let caller = ic_cdk::api::msg_caller();
    let owner = owner_opt.unwrap_or(caller);
    let mut cfg = storage::get_config();
    cfg.owner = owner;
    cfg.treasury = owner;
    cfg.is_initialized = true;
    storage::update_config(cfg);
    storage::add_admin(owner, "owner".to_string());

    let now = ic_cdk::api::time();
    seed::seed_initial_courses_if_empty(now);
    storage::log_audit("canister_init", owner, "academy", "Canister initialized", now);
}

#[post_upgrade]
fn post_upgrade() {
    let now = ic_cdk::api::time();
    seed::seed_initial_courses_if_empty(now);
}

// -----------------------------------------------------------------------------
// Public Queries
// -----------------------------------------------------------------------------

#[query]
fn get_academy_stats() -> AcademyStats {
    let now = ic_cdk::api::time();
    storage::get_academy_stats(now)
}

#[query]
fn get_course_stats(course_id: String) -> Option<CourseStats> {
    let now = ic_cdk::api::time();
    if storage::get_course(&course_id).is_none() {
        return None;
    }
    Some(storage::get_course_stats(&course_id, now))
}

#[query]
fn get_courses() -> Vec<Course> {
    storage::list_courses(true)
}

#[query]
fn get_course_by_slug(slug: String) -> Option<Course> {
    storage::get_course_by_slug(&slug)
}

#[query]
fn get_course_detail(course_id: String) -> Option<CourseDetail> {
    let course = storage::get_course(&course_id)?;
    let caller = ic_cdk::api::msg_caller();
    let enrolled = caller != Principal::anonymous() && storage::is_enrolled(caller, &course_id);

    let modules = storage::list_modules(&course_id);
    let mut module_details = Vec::with_capacity(modules.len());

    for m in modules {
        let lessons = storage::list_lessons(&course_id, &m.id);
        let sanitized_lessons: Vec<Lesson> = lessons
            .into_iter()
            .map(|mut l| {
                if !enrolled && !l.preview_available {
                    l.video_url = String::new();
                }
                l
            })
            .collect();

        module_details.push(ModuleDetail {
            id: m.id,
            title: m.title,
            slug: m.slug,
            description: m.description,
            order: m.order,
            estimated_hours: m.estimated_hours,
            lessons: sanitized_lessons,
        });
    }

    let user_progress = if enrolled {
        storage::get_progress(caller, &course_id)
    } else {
        None
    };

    Some(CourseDetail {
        course,
        modules: module_details,
        is_enrolled: enrolled,
        user_progress,
    })
}

#[query]
fn get_lesson_video(course_id: String, module_id: String, lesson_id: String) -> Result<String, String> {
    let lesson = storage::get_lesson(&course_id, &module_id, &lesson_id)
        .ok_or_else(|| "Lesson not found".to_string())?;

    if lesson.preview_available {
        return Ok(lesson.video_url);
    }

    let caller = caller_or_trap();
    if !storage::is_enrolled(caller, &course_id) && !storage::is_admin(caller) {
        return Err("Enrollment required to access this lesson video".to_string());
    }

    Ok(lesson.video_url)
}

#[query]
fn verify_certificate(certificate_id: String) -> Option<Certificate> {
    storage::get_certificate(&certificate_id)
}

// -----------------------------------------------------------------------------
// Student Authenticated Endpoints
// -----------------------------------------------------------------------------

#[update]
fn enroll_free(course_id: String) -> Result<UserProgress, String> {
    let caller = caller_or_trap();
    let course = storage::get_course(&course_id).ok_or_else(|| "Course not found".to_string())?;

    if course.price_e8s > 0 {
        return Err(format!(
            "Course requires payment of {} e8s ({} ICP)",
            course.price_e8s,
            course.price_e8s as f64 / 100_000_000.0
        ));
    }

    let now = ic_cdk::api::time();
    if storage::is_enrolled(caller, &course_id) {
        return storage::get_progress(caller, &course_id)
            .ok_or_else(|| "User enrolled but progress record missing".to_string());
    }

    let enrollment = UserEnrollment {
        user: caller,
        course_id: course_id.clone(),
        enrolled_at: now,
        payment_block_index: None,
        amount_paid_e8s: 0,
    };
    storage::record_enrollment(enrollment, now);

    storage::get_progress(caller, &course_id)
        .ok_or_else(|| "Failed to initialize student progress".to_string())
}

#[update]
async fn enroll_with_payment(course_id: String, block_index: u64) -> Result<UserProgress, String> {
    let caller = caller_or_trap();
    let course = storage::get_course(&course_id).ok_or_else(|| "Course not found".to_string())?;

    if course.price_e8s == 0 {
        return enroll_free(course_id);
    }

    let now = ic_cdk::api::time();
    if storage::is_enrolled(caller, &course_id) {
        return storage::get_progress(caller, &course_id)
            .ok_or_else(|| "User enrolled but progress record missing".to_string());
    }

    // Verify payment on ICP ledger
    ledger::verify_and_record_payment(caller, &course_id, block_index, course.price_e8s, now).await?;

    let enrollment = UserEnrollment {
        user: caller,
        course_id: course_id.clone(),
        enrolled_at: now,
        payment_block_index: Some(block_index),
        amount_paid_e8s: course.price_e8s,
    };
    storage::record_enrollment(enrollment, now);

    storage::get_progress(caller, &course_id)
        .ok_or_else(|| "Failed to initialize student progress".to_string())
}

#[query]
fn get_my_enrollments() -> Vec<UserEnrollment> {
    let caller = caller_or_trap();
    storage::list_user_enrollments(caller)
}

#[query]
fn get_my_progress(course_id: String) -> Option<UserProgress> {
    let caller = caller_or_trap();
    storage::get_progress(caller, &course_id)
}

#[update]
fn complete_lesson(course_id: String, lesson_id: String) -> Result<UserProgress, String> {
    let caller = caller_or_trap();
    let now = ic_cdk::api::time();
    storage::complete_lesson(caller, &course_id, &lesson_id, now)
}

#[update]
fn claim_certificate(course_id: String) -> Result<Certificate, String> {
    let caller = caller_or_trap();
    let course = storage::get_course(&course_id).ok_or_else(|| "Course not found".to_string())?;

    let progress = storage::get_progress(caller, &course_id)
        .ok_or_else(|| "No enrollment progress found for this course".to_string())?;

    let total_lessons = storage::list_all_lessons_for_course(&course_id).len();
    if progress.completed_lesson_ids.len() < total_lessons || total_lessons == 0 {
        return Err(format!(
            "Course incomplete. Completed {} of {} lessons",
            progress.completed_lesson_ids.len(),
            total_lessons
        ));
    }

    if let Some(existing_cert_id) = progress.certificate_id {
        if let Some(cert) = storage::get_certificate(&existing_cert_id) {
            return Ok(cert);
        }
    }

    let now = ic_cdk::api::time();
    let mut hasher = Sha256::new();
    hasher.update(caller.as_slice());
    hasher.update(course_id.as_bytes());
    hasher.update(&now.to_be_bytes());
    let verification_hash = hex::encode(hasher.finalize());
    let cert_id = format!("ICPAY-{}", &verification_hash[..12].to_uppercase());

    let certificate = Certificate {
        id: cert_id,
        user: caller,
        course_id,
        course_title: course.title,
        issued_at: now,
        verification_hash,
    };

    storage::save_certificate(certificate.clone());
    Ok(certificate)
}

// -----------------------------------------------------------------------------
// Admin Full CRUD Endpoints
// -----------------------------------------------------------------------------

#[update]
fn create_course(args: CreateCourseArgs) -> Result<String, String> {
    let admin = admin_or_trap();
    if storage::get_course(&args.id).is_some() {
        return Err("A course with this ID already exists".to_string());
    }

    let now = ic_cdk::api::time();
    let course = Course {
        id: args.id.clone(),
        slug: args.slug,
        title: args.title,
        headline: args.headline,
        description: args.description,
        level: args.level,
        badge: args.badge,
        price_e8s: args.price_e8s,
        total_hours: args.total_hours,
        total_lessons: 0,
        cover_image: args.cover_image,
        instructor_name: args.instructor_name,
        instructor_role: args.instructor_role,
        is_published: args.is_published,
        created_at: now,
        updated_at: now,
    };
    storage::save_course(course);
    storage::log_audit("create_course", admin, &args.id, "Course created", now);
    Ok(args.id)
}

#[update]
fn update_course(args: UpdateCourseArgs) -> Result<(), String> {
    let admin = admin_or_trap();
    let mut course = storage::get_course(&args.id).ok_or_else(|| "Course not found".to_string())?;

    if let Some(slug) = args.slug { course.slug = slug; }
    if let Some(title) = args.title { course.title = title; }
    if let Some(headline) = args.headline { course.headline = headline; }
    if let Some(description) = args.description { course.description = description; }
    if let Some(level) = args.level { course.level = level; }
    if let Some(badge) = args.badge { course.badge = badge; }
    if let Some(price_e8s) = args.price_e8s { course.price_e8s = price_e8s; }
    if let Some(total_hours) = args.total_hours { course.total_hours = total_hours; }
    if let Some(cover_image) = args.cover_image { course.cover_image = cover_image; }
    if let Some(name) = args.instructor_name { course.instructor_name = name; }
    if let Some(role) = args.instructor_role { course.instructor_role = role; }
    if let Some(published) = args.is_published { course.is_published = published; }

    let now = ic_cdk::api::time();
    course.updated_at = now;
    storage::save_course(course);
    storage::log_audit("update_course", admin, &args.id, "Course updated", now);
    Ok(())
}

#[update]
fn delete_course(course_id: String) -> Result<(), String> {
    let admin = admin_or_trap();
    storage::delete_course_cascade(&course_id)?;
    let now = ic_cdk::api::time();
    storage::log_audit("delete_course", admin, &course_id, "Course and modules deleted", now);
    Ok(())
}

#[update]
fn duplicate_course(course_id: String) -> Result<String, String> {
    let admin = admin_or_trap();
    let now = ic_cdk::api::time();
    let new_id = format!("{}-copy-{}", course_id, now / 1_000_000_000);
    let new_slug = format!("{}-copy", course_id);
    let cloned_id = storage::duplicate_course(&course_id, &new_id, &new_slug, now)?;
    storage::log_audit("duplicate_course", admin, &cloned_id, &format!("Cloned from {}", course_id), now);
    Ok(cloned_id)
}

#[update]
fn publish_course(course_id: String, is_published: bool) -> Result<(), String> {
    let admin = admin_or_trap();
    let mut course = storage::get_course(&course_id).ok_or_else(|| "Course not found".to_string())?;
    course.is_published = is_published;
    let now = ic_cdk::api::time();
    course.updated_at = now;
    storage::save_course(course);
    let action = if is_published { "publish_course" } else { "unpublish_course" };
    storage::log_audit(action, admin, &course_id, "Publish status changed", now);
    Ok(())
}

#[update]
fn set_course_price(course_id: String, price_e8s: u64) -> Result<(), String> {
    let admin = admin_or_trap();
    let mut course = storage::get_course(&course_id).ok_or_else(|| "Course not found".to_string())?;
    course.price_e8s = price_e8s;
    let now = ic_cdk::api::time();
    course.updated_at = now;
    storage::save_course(course);
    storage::log_audit("set_course_price", admin, &course_id, &format!("New price: {} e8s", price_e8s), now);
    Ok(())
}

#[update]
fn add_module(course_id: String, args: CreateModuleArgs) -> Result<String, String> {
    let admin = admin_or_trap();
    if storage::get_course(&course_id).is_none() {
        return Err("Course not found".to_string());
    }
    if storage::get_module(&course_id, &args.id).is_some() {
        return Err("A module with this ID already exists in this course".to_string());
    }

    let now = ic_cdk::api::time();
    let module = CourseModule {
        id: args.id.clone(),
        course_id: course_id.clone(),
        title: args.title,
        slug: args.slug,
        description: args.description,
        order: args.order,
        estimated_hours: args.estimated_hours,
        created_at: now,
    };
    storage::save_module(module);
    storage::log_audit("add_module", admin, &args.id, &format!("Module added to {}", course_id), now);
    Ok(args.id)
}

#[update]
fn update_module(course_id: String, module_id: String, args: UpdateModuleArgs) -> Result<(), String> {
    let admin = admin_or_trap();
    let mut module = storage::get_module(&course_id, &module_id)
        .ok_or_else(|| "Module not found".to_string())?;

    if let Some(title) = args.title { module.title = title; }
    if let Some(slug) = args.slug { module.slug = slug; }
    if let Some(description) = args.description { module.description = description; }
    if let Some(order) = args.order { module.order = order; }
    if let Some(estimated_hours) = args.estimated_hours { module.estimated_hours = estimated_hours; }

    storage::save_module(module);
    let now = ic_cdk::api::time();
    storage::log_audit("update_module", admin, &module_id, "Module updated", now);
    Ok(())
}

#[update]
fn delete_module(course_id: String, module_id: String) -> Result<(), String> {
    let admin = admin_or_trap();
    storage::delete_module(&course_id, &module_id)?;
    let now = ic_cdk::api::time();
    storage::log_audit("delete_module", admin, &module_id, "Module deleted", now);
    Ok(())
}

#[update]
fn add_lesson(course_id: String, module_id: String, args: CreateLessonArgs) -> Result<String, String> {
    let admin = admin_or_trap();
    if storage::get_module(&course_id, &module_id).is_none() {
        return Err("Parent module not found".to_string());
    }
    if storage::get_lesson(&course_id, &module_id, &args.id).is_some() {
        return Err("Lesson with this ID already exists".to_string());
    }

    let now = ic_cdk::api::time();
    let lesson = Lesson {
        id: args.id.clone(),
        course_id: course_id.clone(),
        module_id: module_id.clone(),
        title: args.title,
        slug: args.slug,
        description: args.description,
        duration_minutes: args.duration_minutes,
        lesson_type: args.lesson_type,
        video_url: args.video_url,
        thumbnail_url: args.thumbnail_url,
        preview_available: args.preview_available,
        order: args.order,
        key_takeaways: args.key_takeaways,
        created_at: now,
    };
    storage::save_lesson(lesson);

    // Refresh course counters
    let all_lessons = storage::list_all_lessons_for_course(&course_id);
    if let Some(mut course) = storage::get_course(&course_id) {
        course.total_lessons = all_lessons.len() as u32;
        let total_mins: u32 = all_lessons.iter().map(|l| l.duration_minutes).sum();
        course.total_hours = ((total_mins as f64) / 60.0).ceil() as u32;
        course.updated_at = now;
        storage::save_course(course);
    }

    storage::log_audit("add_lesson", admin, &args.id, &format!("Lesson added to module {}", module_id), now);
    Ok(args.id)
}

#[update]
fn update_lesson(
    course_id: String,
    module_id: String,
    lesson_id: String,
    args: UpdateLessonArgs,
) -> Result<(), String> {
    let admin = admin_or_trap();
    let mut lesson = storage::get_lesson(&course_id, &module_id, &lesson_id)
        .ok_or_else(|| "Lesson not found".to_string())?;

    if let Some(title) = args.title { lesson.title = title; }
    if let Some(slug) = args.slug { lesson.slug = slug; }
    if let Some(description) = args.description { lesson.description = description; }
    if let Some(duration) = args.duration_minutes { lesson.duration_minutes = duration; }
    if let Some(lesson_type) = args.lesson_type { lesson.lesson_type = lesson_type; }
    if let Some(video_url) = args.video_url { lesson.video_url = video_url; }
    if let Some(thumbnail_url) = args.thumbnail_url { lesson.thumbnail_url = thumbnail_url; }
    if let Some(preview_available) = args.preview_available { lesson.preview_available = preview_available; }
    if let Some(order) = args.order { lesson.order = order; }
    if let Some(takeaways) = args.key_takeaways { lesson.key_takeaways = takeaways; }

    storage::save_lesson(lesson);
    let now = ic_cdk::api::time();
    storage::log_audit("update_lesson", admin, &lesson_id, "Lesson updated", now);
    Ok(())
}

#[update]
fn delete_lesson(course_id: String, module_id: String, lesson_id: String) -> Result<(), String> {
    let admin = admin_or_trap();
    storage::delete_lesson(&course_id, &module_id, &lesson_id)?;
    let now = ic_cdk::api::time();
    storage::log_audit("delete_lesson", admin, &lesson_id, "Lesson deleted", now);
    Ok(())
}

#[update]
fn add_admin(admin_principal: Principal, role: String) -> Result<(), String> {
    let caller = admin_or_trap();
    let now = ic_cdk::api::time();
    storage::add_admin(admin_principal, role.clone());
    storage::log_audit("add_admin", caller, &admin_principal.to_text(), &format!("Role: {}", role), now);
    Ok(())
}

#[update]
fn remove_admin(admin_principal: Principal) -> Result<(), String> {
    let caller = admin_or_trap();
    let cfg = storage::get_config();
    if admin_principal == cfg.owner {
        return Err("Cannot remove canister owner from admins".to_string());
    }
    storage::remove_admin(admin_principal)?;
    let now = ic_cdk::api::time();
    storage::log_audit("remove_admin", caller, &admin_principal.to_text(), "Admin removed", now);
    Ok(())
}

#[query]
fn get_admins() -> Vec<(Principal, String)> {
    let _ = admin_or_trap();
    storage::list_admins()
}

#[query]
fn get_audit_log(limit: u32) -> Vec<AuditLogEntry> {
    let _ = admin_or_trap();
    storage::get_recent_audit_logs(limit as usize)
}

#[query]
fn get_all_courses_admin() -> Vec<Course> {
    let _ = admin_or_trap();
    storage::list_courses(false)
}

#[query]
fn is_caller_admin() -> bool {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return false;
    }
    storage::is_admin(caller)
}

#[query]
fn get_treasury_address() -> String {
    ic_cdk::api::canister_self().to_text()
}

#[update]
async fn get_treasury_balance() -> Result<u64, String> {
    ledger::get_treasury_balance().await
}

#[update]
async fn withdraw_treasury(to_account: String, amount_e8s: u64) -> Result<u64, String> {
    let admin = admin_or_trap();
    let recipient_principal = Principal::from_text(to_account.trim())
        .map_err(|e| format!("Invalid recipient principal: {e:?}"))?;

    let account = icrc_ledger_types::icrc1::account::Account {
        owner: recipient_principal,
        subaccount: None,
    };

    let block_index = ledger::withdraw_to_account(account, amount_e8s).await?;
    let now = ic_cdk::api::time();
    storage::log_audit(
        "treasury_withdraw",
        admin,
        &to_account,
        &format!("Withdrew {} e8s ({} ICP), block height {}", amount_e8s, amount_e8s as f64 / 100_000_000.0, block_index),
        now,
    );
    Ok(block_index)
}

ic_cdk::export_candid!();

