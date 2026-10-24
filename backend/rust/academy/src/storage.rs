use candid::Principal;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap, StableCell,
};
use std::cell::RefCell;
use std::collections::HashSet;

use crate::types::{
    AcademyConfig, AcademyStats, AuditLogEntry, Certificate, Course, CourseModule,
    CourseModuleKey, CourseStats, EnrollmentTimeKey, Lesson, LessonKey, PaymentRecord,
    PrincipalKey, UserCourseKey, UserEnrollment, UserProgress,
};

pub type Memory = VirtualMemory<DefaultMemoryImpl>;

pub const CONFIG_MEM_ID: MemoryId = MemoryId::new(0);
pub const COURSES_MEM_ID: MemoryId = MemoryId::new(1);
pub const MODULES_MEM_ID: MemoryId = MemoryId::new(2);
pub const LESSONS_MEM_ID: MemoryId = MemoryId::new(3);
pub const ENROLLMENTS_MEM_ID: MemoryId = MemoryId::new(4);
pub const PROGRESS_MEM_ID: MemoryId = MemoryId::new(5);
pub const CERTIFICATES_MEM_ID: MemoryId = MemoryId::new(6);
pub const PAYMENTS_MEM_ID: MemoryId = MemoryId::new(7);
pub const ENROLLMENT_TIME_INDEX_MEM_ID: MemoryId = MemoryId::new(8);
pub const AUDIT_LOG_MEM_ID: MemoryId = MemoryId::new(9);
pub const ADMINS_MEM_ID: MemoryId = MemoryId::new(10);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static CONFIG: RefCell<StableCell<AcademyConfig, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(CONFIG_MEM_ID)),
            AcademyConfig::default(),
        )
    );

    static ADMINS: RefCell<StableBTreeMap<PrincipalKey, String, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(ADMINS_MEM_ID)))
    );

    static COURSES: RefCell<StableBTreeMap<String, Course, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(COURSES_MEM_ID)))
    );

    static MODULES: RefCell<StableBTreeMap<CourseModuleKey, CourseModule, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MODULES_MEM_ID)))
    );

    static LESSONS: RefCell<StableBTreeMap<LessonKey, Lesson, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(LESSONS_MEM_ID)))
    );

    static ENROLLMENTS: RefCell<StableBTreeMap<UserCourseKey, UserEnrollment, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(ENROLLMENTS_MEM_ID)))
    );

    static PROGRESS: RefCell<StableBTreeMap<UserCourseKey, UserProgress, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(PROGRESS_MEM_ID)))
    );

    static CERTIFICATES: RefCell<StableBTreeMap<String, Certificate, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(CERTIFICATES_MEM_ID)))
    );

    static PAYMENTS: RefCell<StableBTreeMap<u64, PaymentRecord, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(PAYMENTS_MEM_ID)))
    );

    static ENROLLMENT_TIME_INDEX: RefCell<StableBTreeMap<EnrollmentTimeKey, (), Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(ENROLLMENT_TIME_INDEX_MEM_ID)))
    );

    static AUDIT_LOG: RefCell<StableBTreeMap<u64, AuditLogEntry, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(AUDIT_LOG_MEM_ID)))
    );
}

// Config & Admin
pub fn get_config() -> AcademyConfig {
    CONFIG.with(|c| c.borrow().get().clone())
}

pub fn update_config(cfg: AcademyConfig) {
    CONFIG.with(|c| {
        c.borrow_mut().set(cfg);
    });
}

pub fn is_admin(caller: Principal) -> bool {
    let cfg = get_config();
    if caller == cfg.owner && caller != Principal::anonymous() {
        return true;
    }
    if ic_cdk::api::is_controller(&caller) {
        return true;
    }
    ADMINS.with(|m| m.borrow().contains_key(&PrincipalKey(caller)))
}

pub fn add_admin(admin: Principal, role: String) {
    ADMINS.with(|m| {
        m.borrow_mut().insert(PrincipalKey(admin), role);
    });
}

pub fn remove_admin(admin: Principal) -> Result<(), String> {
    ADMINS.with(|m| {
        if m.borrow_mut().remove(&PrincipalKey(admin)).is_none() {
            Err("Admin not found".to_string())
        } else {
            Ok(())
        }
    })
}

pub fn list_admins() -> Vec<(Principal, String)> {
    ADMINS.with(|m| {
        m.borrow()
            .iter()
            .map(|entry| (entry.key().0, entry.value()))
            .collect()
    })
}

// Audit Logging
pub fn log_audit(action: &str, admin: Principal, target_id: &str, details: &str, now_nanos: u64) {
    let mut cfg = get_config();
    let audit_id = cfg.next_audit_id;
    cfg.next_audit_id = audit_id.saturating_add(1);
    update_config(cfg);

    let entry = AuditLogEntry {
        id: audit_id,
        timestamp: now_nanos,
        action: action.to_string(),
        admin,
        target_id: target_id.to_string(),
        details: details.to_string(),
    };

    AUDIT_LOG.with(|m| {
        m.borrow_mut().insert(audit_id, entry);
    });
}

pub fn get_recent_audit_logs(limit: usize) -> Vec<AuditLogEntry> {
    AUDIT_LOG.with(|m| {
        let map = m.borrow();
        let total = map.len() as usize;
        let skip_count = total.saturating_sub(limit);
        map.iter().skip(skip_count).map(|e| e.value()).collect()
    })
}

// Course CRUD
pub fn get_course(id: &str) -> Option<Course> {
    COURSES.with(|m| m.borrow().get(&id.to_string()))
}

pub fn get_course_by_slug(slug: &str) -> Option<Course> {
    COURSES.with(|m| {
        m.borrow()
            .iter()
            .find(|e| e.value().slug == slug)
            .map(|e| e.value())
    })
}

pub fn list_courses(only_published: bool) -> Vec<Course> {
    COURSES.with(|m| {
        let mut courses: Vec<Course> = m
            .borrow()
            .iter()
            .filter(|e| !only_published || e.value().is_published)
            .map(|e| e.value())
            .collect();
        courses.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        courses
    })
}

pub fn save_course(course: Course) {
    COURSES.with(|m| {
        m.borrow_mut().insert(course.id.clone(), course);
    });
}

pub fn delete_course_cascade(course_id: &str) -> Result<(), String> {
    let exists = COURSES.with(|m| m.borrow().contains_key(&course_id.to_string()));
    if !exists {
        return Err("Course not found".to_string());
    }

    // Cascade remove lessons
    LESSONS.with(|m| {
        let mut map = m.borrow_mut();
        let lesson_keys: Vec<LessonKey> = map
            .iter()
            .filter(|e| e.key().course_id == course_id)
            .map(|e| e.key().clone())
            .collect();
        for key in lesson_keys {
            map.remove(&key);
        }
    });

    // Cascade remove modules
    MODULES.with(|m| {
        let mut map = m.borrow_mut();
        let module_keys: Vec<CourseModuleKey> = map
            .iter()
            .filter(|e| e.key().course_id == course_id)
            .map(|e| e.key().clone())
            .collect();
        for key in module_keys {
            map.remove(&key);
        }
    });

    // Remove course
    COURSES.with(|m| {
        m.borrow_mut().remove(&course_id.to_string());
    });

    Ok(())
}

pub fn duplicate_course(
    source_course_id: &str,
    new_id: &str,
    new_slug: &str,
    now: u64,
) -> Result<String, String> {
    let source = match get_course(source_course_id) {
        Some(c) => c,
        None => return Err("Source course not found".to_string()),
    };

    let mut cloned = source.clone();
    cloned.id = new_id.to_string();
    cloned.slug = new_slug.to_string();
    cloned.title = format!("{} (Copy)", source.title);
    cloned.is_published = false;
    cloned.created_at = now;
    cloned.updated_at = now;
    save_course(cloned);

    let modules = list_modules(source_course_id);
    for m in modules {
        let new_mod_id = format!("{}-clone", m.id);
        let mut cloned_mod = m.clone();
        cloned_mod.id = new_mod_id.clone();
        cloned_mod.course_id = new_id.to_string();
        cloned_mod.created_at = now;
        save_module(cloned_mod);

        let lessons = list_lessons(source_course_id, &m.id);
        for l in lessons {
            let mut cloned_l = l.clone();
            cloned_l.id = format!("{}-clone", l.id);
            cloned_l.course_id = new_id.to_string();
            cloned_l.module_id = new_mod_id.clone();
            cloned_l.created_at = now;
            save_lesson(cloned_l);
        }
    }

    Ok(new_id.to_string())
}

// Module CRUD
pub fn get_module(course_id: &str, module_id: &str) -> Option<CourseModule> {
    let key = CourseModuleKey {
        course_id: course_id.to_string(),
        module_id: module_id.to_string(),
    };
    MODULES.with(|m| m.borrow().get(&key))
}

pub fn list_modules(course_id: &str) -> Vec<CourseModule> {
    MODULES.with(|m| {
        let mut mods: Vec<CourseModule> = m
            .borrow()
            .iter()
            .filter(|e| e.key().course_id == course_id)
            .map(|e| e.value())
            .collect();
        mods.sort_by(|a, b| a.order.cmp(&b.order));
        mods
    })
}

pub fn save_module(module: CourseModule) {
    let key = CourseModuleKey {
        course_id: module.course_id.clone(),
        module_id: module.id.clone(),
    };
    MODULES.with(|m| {
        m.borrow_mut().insert(key, module);
    });
}

pub fn delete_module(course_id: &str, module_id: &str) -> Result<(), String> {
    let key = CourseModuleKey {
        course_id: course_id.to_string(),
        module_id: module_id.to_string(),
    };

    let removed = MODULES.with(|m| m.borrow_mut().remove(&key));
    if removed.is_none() {
        return Err("Module not found".to_string());
    }

    // Cascade delete lessons in this module
    LESSONS.with(|m| {
        let mut map = m.borrow_mut();
        let lesson_keys: Vec<LessonKey> = map
            .iter()
            .filter(|e| e.key().course_id == course_id && e.key().module_id == module_id)
            .map(|e| e.key().clone())
            .collect();
        for k in lesson_keys {
            map.remove(&k);
        }
    });

    recalculate_course_totals(course_id);
    Ok(())
}

// Lesson CRUD
pub fn get_lesson(course_id: &str, module_id: &str, lesson_id: &str) -> Option<Lesson> {
    let key = LessonKey {
        course_id: course_id.to_string(),
        module_id: module_id.to_string(),
        lesson_id: lesson_id.to_string(),
    };
    LESSONS.with(|m| m.borrow().get(&key))
}

pub fn list_lessons(course_id: &str, module_id: &str) -> Vec<Lesson> {
    LESSONS.with(|m| {
        let mut lessons: Vec<Lesson> = m
            .borrow()
            .iter()
            .filter(|e| e.key().course_id == course_id && e.key().module_id == module_id)
            .map(|e| e.value())
            .collect();
        lessons.sort_by(|a, b| a.order.cmp(&b.order));
        lessons
    })
}

pub fn list_all_lessons_for_course(course_id: &str) -> Vec<Lesson> {
    LESSONS.with(|m| {
        let mut lessons: Vec<Lesson> = m
            .borrow()
            .iter()
            .filter(|e| e.key().course_id == course_id)
            .map(|e| e.value())
            .collect();
        lessons.sort_by(|a, b| a.order.cmp(&b.order));
        lessons
    })
}

pub fn save_lesson(lesson: Lesson) {
    let key = LessonKey {
        course_id: lesson.course_id.clone(),
        module_id: lesson.module_id.clone(),
        lesson_id: lesson.id.clone(),
    };
    LESSONS.with(|m| {
        m.borrow_mut().insert(key, lesson);
    });
}

pub fn delete_lesson(course_id: &str, module_id: &str, lesson_id: &str) -> Result<(), String> {
    let key = LessonKey {
        course_id: course_id.to_string(),
        module_id: module_id.to_string(),
        lesson_id: lesson_id.to_string(),
    };
    let removed = LESSONS.with(|m| m.borrow_mut().remove(&key));
    if removed.is_none() {
        return Err("Lesson not found".to_string());
    }
    recalculate_course_totals(course_id);
    Ok(())
}

fn recalculate_course_totals(course_id: &str) {
    let mut course = match get_course(course_id) {
        Some(c) => c,
        None => return,
    };
    let all_lessons = list_all_lessons_for_course(course_id);
    course.total_lessons = all_lessons.len() as u32;
    let total_mins: u32 = all_lessons.iter().map(|l| l.duration_minutes).sum();
    course.total_hours = ((total_mins as f64) / 60.0).ceil() as u32;
    save_course(course);
}

// Enrollments & Payments
pub fn is_enrolled(user: Principal, course_id: &str) -> bool {
    let key = UserCourseKey {
        user,
        course_id: course_id.to_string(),
    };
    ENROLLMENTS.with(|m| m.borrow().contains_key(&key))
}

pub fn get_enrollment(user: Principal, course_id: &str) -> Option<UserEnrollment> {
    let key = UserCourseKey {
        user,
        course_id: course_id.to_string(),
    };
    ENROLLMENTS.with(|m| m.borrow().get(&key))
}

pub fn list_user_enrollments(user: Principal) -> Vec<UserEnrollment> {
    ENROLLMENTS.with(|m| {
        m.borrow()
            .iter()
            .filter(|e| e.key().user == user)
            .map(|e| e.value())
            .collect()
    })
}

pub fn record_enrollment(enrollment: UserEnrollment, now_nanos: u64) {
    let user_course_key = UserCourseKey {
        user: enrollment.user,
        course_id: enrollment.course_id.clone(),
    };

    ENROLLMENTS.with(|m| {
        m.borrow_mut().insert(user_course_key.clone(), enrollment.clone());
    });

    // Record in time-indexed BTreeMap for fast O(k) 24h stats
    let time_key = EnrollmentTimeKey {
        timestamp_nanos: now_nanos,
        user: enrollment.user,
        course_id: enrollment.course_id.clone(),
    };
    ENROLLMENT_TIME_INDEX.with(|m| {
        m.borrow_mut().insert(time_key, ());
    });

    // Initialize progress record if not exists
    PROGRESS.with(|m| {
        let mut map = m.borrow_mut();
        if !map.contains_key(&user_course_key) {
            let prog = UserProgress {
                user: enrollment.user,
                course_id: enrollment.course_id,
                completed_lesson_ids: vec![],
                percent_complete: 0,
                started_at: now_nanos,
                last_active_at: now_nanos,
                is_completed: false,
                certificate_id: None,
            };
            map.insert(user_course_key, prog);
        }
    });
}

pub fn has_payment(block_index: u64) -> bool {
    PAYMENTS.with(|m| m.borrow().contains_key(&block_index))
}

pub fn record_payment(payment: PaymentRecord) {
    PAYMENTS.with(|m| {
        m.borrow_mut().insert(payment.block_index, payment);
    });
}

// Student Progress & Certificates
pub fn get_progress(user: Principal, course_id: &str) -> Option<UserProgress> {
    let key = UserCourseKey {
        user,
        course_id: course_id.to_string(),
    };
    PROGRESS.with(|m| m.borrow().get(&key))
}

pub fn complete_lesson(
    user: Principal,
    course_id: &str,
    lesson_id: &str,
    now_nanos: u64,
) -> Result<UserProgress, String> {
    let key = UserCourseKey {
        user,
        course_id: course_id.to_string(),
    };

    PROGRESS.with(|m| {
        let mut map = m.borrow_mut();
        let mut prog = match map.get(&key) {
            Some(p) => p,
            None => {
                // Auto-create progress if enrolled
                if !is_enrolled(user, course_id) {
                    return Err("User is not enrolled in this course".to_string());
                }
                UserProgress {
                    user,
                    course_id: course_id.to_string(),
                    completed_lesson_ids: vec![],
                    percent_complete: 0,
                    started_at: now_nanos,
                    last_active_at: now_nanos,
                    is_completed: false,
                    certificate_id: None,
                }
            }
        };

        if !prog.completed_lesson_ids.iter().any(|id| id == lesson_id) {
            prog.completed_lesson_ids.push(lesson_id.to_string());
        }
        prog.last_active_at = now_nanos;

        let total_lessons = list_all_lessons_for_course(course_id).len() as u32;
        if total_lessons > 0 {
            let percent = ((prog.completed_lesson_ids.len() as f64 / total_lessons as f64) * 100.0) as u8;
            prog.percent_complete = percent.min(100);
            if prog.percent_complete >= 100 {
                prog.is_completed = true;
            }
        }

        map.insert(key, prog.clone());
        Ok(prog)
    })
}

pub fn save_certificate(cert: Certificate) {
    CERTIFICATES.with(|m| {
        m.borrow_mut().insert(cert.id.clone(), cert.clone());
    });
    // Link certificate to progress
    let key = UserCourseKey {
        user: cert.user,
        course_id: cert.course_id.clone(),
    };
    PROGRESS.with(|m| {
        let mut map = m.borrow_mut();
        if let Some(mut prog) = map.get(&key) {
            prog.certificate_id = Some(cert.id);
            map.insert(key, prog);
        }
    });
}

pub fn get_certificate(id: &str) -> Option<Certificate> {
    CERTIFICATES.with(|m| m.borrow().get(&id.to_string()))
}

// Analytics & Stats
pub fn get_academy_stats(now_nanos: u64) -> AcademyStats {
    let total_courses = COURSES.with(|m| {
        m.borrow()
            .iter()
            .filter(|e| e.value().is_published)
            .count() as u32
    });

    let total_modules = MODULES.with(|m| m.borrow().len() as u32);
    let total_lessons = LESSONS.with(|m| m.borrow().len() as u32);

    let mut unique_students = HashSet::new();
    let total_enrollments = ENROLLMENTS.with(|m| {
        let map = m.borrow();
        for entry in map.iter() {
            unique_students.insert(entry.key().user);
        }
        map.len() as u64
    });

    // 24 hours ago in nanoseconds
    let twenty_four_hours_ago = now_nanos.saturating_sub(24 * 60 * 60 * 1_000_000_000);
    let start_key = EnrollmentTimeKey {
        timestamp_nanos: twenty_four_hours_ago,
        user: Principal::anonymous(),
        course_id: String::new(),
    };
    let today_enrollments = ENROLLMENT_TIME_INDEX.with(|m| {
        m.borrow().range(start_key..).count() as u64
    });

    let total_completed_lessons: u64 = PROGRESS.with(|m| {
        m.borrow()
            .iter()
            .map(|e| e.value().completed_lesson_ids.len() as u64)
            .sum()
    });

    let total_certificates_issued = CERTIFICATES.with(|m| m.borrow().len() as u64);

    let total_revenue_e8s: u64 = PAYMENTS.with(|m| {
        m.borrow().iter().map(|e| e.value().amount_e8s).sum()
    });

    AcademyStats {
        total_courses,
        total_modules,
        total_lessons,
        total_students: unique_students.len() as u64,
        total_enrollments,
        today_enrollments,
        total_completed_lessons,
        total_certificates_issued,
        total_revenue_e8s,
    }
}

pub fn get_course_stats(course_id: &str, now_nanos: u64) -> CourseStats {
    let total_enrolled = ENROLLMENTS.with(|m| {
        m.borrow()
            .iter()
            .filter(|e| e.key().course_id == course_id)
            .count() as u64
    });

    let twenty_four_hours_ago = now_nanos.saturating_sub(24 * 60 * 60 * 1_000_000_000);
    let start_key = EnrollmentTimeKey {
        timestamp_nanos: twenty_four_hours_ago,
        user: Principal::anonymous(),
        course_id: String::new(),
    };
    let today_enrolled = ENROLLMENT_TIME_INDEX.with(|m| {
        m.borrow()
            .range(start_key..)
            .filter(|e| e.key().course_id == course_id)
            .count() as u64
    });

    let total_completed = PROGRESS.with(|m| {
        m.borrow()
            .iter()
            .filter(|e| e.key().course_id == course_id && e.value().is_completed)
            .count() as u64
    });

    let completion_rate_percent = if total_enrolled > 0 {
        ((total_completed as f64 / total_enrolled as f64) * 100.0) as u8
    } else {
        0
    };

    CourseStats {
        total_enrolled,
        today_enrolled,
        total_completed,
        completion_rate_percent,
    }
}
