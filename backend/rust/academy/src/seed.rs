use crate::storage;
use crate::types::{Course, CourseModule, Lesson, LessonType};

pub fn seed_initial_courses_if_empty(now_nanos: u64) {
    if !storage::list_courses(false).is_empty() {
        return;
    }

    // Course 1: ICP Crash Course (2 ICP)
    let c1_id = "icp-crash-course".to_string();
    let course1 = Course {
        id: c1_id.clone(),
        slug: "icp-crash-course".to_string(),
        title: "ICP Crash Course".to_string(),
        headline: "Master Internet Computer architecture, canister smart contracts, and Web3 development from scratch.".to_string(),
        description: "Comprehensive developer masterclass covering the canister execution environment, orthogonal persistence, state management, and production dApp engineering.".to_string(),
        level: "Intermediate".to_string(),
        badge: "Flagship Masterclass".to_string(),
        price_e8s: 200_000_000, // 2 ICP
        total_hours: 6,
        total_lessons: 4,
        cover_image: "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png".to_string(),
        instructor_name: "ICPay Engineering Core".to_string(),
        instructor_role: "Core Protocol Engineers".to_string(),
        is_published: true,
        created_at: now_nanos,
        updated_at: now_nanos,
    };
    storage::save_course(course1);

    // Module 1
    let m1_id = "module-1-architecture".to_string();
    let mod1 = CourseModule {
        id: m1_id.clone(),
        course_id: c1_id.clone(),
        title: "Module 01: ICP Architecture & Actor Model".to_string(),
        slug: "icp-architecture".to_string(),
        description: "Foundational actor model, asynchronous messaging, and canister runtime execution.".to_string(),
        order: 1,
        estimated_hours: 3,
        created_at: now_nanos,
    };
    storage::save_module(mod1);

    storage::save_lesson(Lesson {
        id: "lesson-1-welcome".to_string(),
        course_id: c1_id.clone(),
        module_id: m1_id.clone(),
        title: "Welcome & Canister Execution Environment".to_string(),
        slug: "welcome-and-canister-environment".to_string(),
        description: "Introduction to WebAssembly canisters, boundaries, and how the Internet Computer executes code.".to_string(),
        duration_minutes: 24,
        lesson_type: LessonType::Video,
        video_url: "https://res.cloudinary.com/dn2ycbmrc/video/upload/v1792379282/howtocreatebucket_bdhzzv.mp4".to_string(),
        thumbnail_url: "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png".to_string(),
        preview_available: true,
        order: 1,
        key_takeaways: vec![
            "WebAssembly runtime vs traditional EVM".to_string(),
            "Query vs update call mechanics".to_string(),
            "Canister cycle model and reverse gas".to_string(),
        ],
        created_at: now_nanos,
    });

    storage::save_lesson(Lesson {
        id: "lesson-2-persistence".to_string(),
        course_id: c1_id.clone(),
        module_id: m1_id.clone(),
        title: "Orthogonal Persistence & Memory Layout".to_string(),
        slug: "orthogonal-persistence-and-memory".to_string(),
        description: "Understanding heap limits, 64-bit stable memory, and how data persists without databases.".to_string(),
        duration_minutes: 36,
        lesson_type: LessonType::Video,
        video_url: "https://res.cloudinary.com/dn2ycbmrc/video/upload/v1792379282/howtocreatebucket_bdhzzv.mp4".to_string(),
        thumbnail_url: "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png".to_string(),
        preview_available: false,
        order: 2,
        key_takeaways: vec![
            "Orthogonal persistence principles".to_string(),
            "Stable memory structures vs heap memory".to_string(),
            "Upgrade safety and memory high-water marks".to_string(),
        ],
        created_at: now_nanos,
    });

    // Module 2
    let m2_id = "module-2-financial-engineering".to_string();
    let mod2 = CourseModule {
        id: m2_id.clone(),
        course_id: c1_id.clone(),
        title: "Module 02: Ledger Standards & On-Chain Payments".to_string(),
        slug: "ledger-standards-and-payments".to_string(),
        description: "Integrating ICRC token standards, verifiable ledger transactions, and payment gates.".to_string(),
        order: 2,
        estimated_hours: 3,
        created_at: now_nanos,
    };
    storage::save_module(mod2);

    storage::save_lesson(Lesson {
        id: "lesson-3-icrc-tokens".to_string(),
        course_id: c1_id.clone(),
        module_id: m2_id.clone(),
        title: "ICRC-1 & ICRC-2 Token Implementation".to_string(),
        slug: "icrc1-and-icrc2-standards".to_string(),
        description: "Building interoperable multi-token architectures with native approval and transfer-from semantics.".to_string(),
        duration_minutes: 42,
        lesson_type: LessonType::Video,
        video_url: "https://res.cloudinary.com/dn2ycbmrc/video/upload/v1792379282/howtocreatebucket_bdhzzv.mp4".to_string(),
        thumbnail_url: "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png".to_string(),
        preview_available: false,
        order: 1,
        key_takeaways: vec![
            "ICRC-1 accounts, subaccounts, and transfers".to_string(),
            "ICRC-2 approval patterns for payments".to_string(),
        ],
        created_at: now_nanos,
    });

    storage::save_lesson(Lesson {
        id: "lesson-4-canister-security".to_string(),
        course_id: c1_id.clone(),
        module_id: m2_id.clone(),
        title: "Canister Security & Audit Readiness".to_string(),
        slug: "canister-security-and-audit".to_string(),
        description: "Preventing reentrancy, cycle exhaustion, ingress inspection, and caller spoofing.".to_string(),
        duration_minutes: 38,
        lesson_type: LessonType::Video,
        video_url: "https://res.cloudinary.com/dn2ycbmrc/video/upload/v1792379282/howtocreatebucket_bdhzzv.mp4".to_string(),
        thumbnail_url: "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png".to_string(),
        preview_available: false,
        order: 2,
        key_takeaways: vec![
            "Caller authorization guards".to_string(),
            "Asynchronous inter-canister security".to_string(),
        ],
        created_at: now_nanos,
    });

}
