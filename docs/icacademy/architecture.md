# ICAcademy System Architecture & Backend Contract

This document specifies the technical design, data schema, and canister integration model for **ICAcademy**, the on-chain developer education platform for ICPay.

---

## 1. Overview & High-Level Design

ICAcademy provides interactive courses, structured multi-tier modules, and video lessons for developers learning Motoko, Rust canister engineering, ICBucket decentralized storage, and Internet Computer authentication.

```
+-------------------------------------------------------------------+
| Next.js Frontend (app/(public)/academy)                           |
| - Course Catalog & Filtering                                      |
| - Interactive Module Accordion & Lesson View                      |
| - In-Browser Video Player (Static Preview -> Canister Stream)     |
| - Progress Tracking & Certification Verification                  |
+---------------------------------+---------------------------------+
                                  |
               Actor calls via agent-js / @dfinity/agent
                                  |
                                  v
+---------------------------------+---------------------------------+
| ic_academy Canister (Motoko / Orthogonal Persistence)             |
|                                                                   |
| 1. Course Registry (Stable RBTrees)                               |
|    - Courses, Modules, Lessons, Metadata                          |
|                                                                   |
| 2. User Enrollment & Progress Engine                              |
|    - Caller subaccount keyed progress maps                        |
|    - Completed lessons, quiz scores, timestamps                   |
|                                                                   |
| 3. Certification Minting                                          |
|    - On-chain soulbound NFT / verifiable credential               |
+-------------------------------------------------------------------+
```

---

## 2. Prospective Motoko Backend Candid Interface

The backend canister will expose the following interface to be implemented:

```candid
type LessonType = variant {
  video;
  code_lab;
  reading;
  quiz;
};

type Lesson = record {
  id : text;
  title : text;
  slug : text;
  description : text;
  durationMinutes : nat32;
  lessonType : LessonType;
  videoUrl : text;
  previewAvailable : bool;
  order : nat32;
  keyTakeaways : vec text;
};

type CourseModule = record {
  id : text;
  title : text;
  slug : text;
  description : text;
  order : nat32;
  estimatedHours : nat32;
  lessons : vec Lesson;
};

type Course = record {
  id : text;
  slug : text;
  title : text;
  headline : text;
  description : text;
  level : text;
  badge : text;
  totalHours : nat32;
  totalLessons : nat32;
  featuredYoutubeId : text;
  coverImage : text;
  authorName : text;
  authorRole : text;
  modules : vec CourseModule;
};

type UserProgress = record {
  courseId : text;
  completedLessonIds : vec text;
  percentComplete : nat8;
  startedAt : int;
  lastActiveAt : int;
};

service : {
  // Public Queries
  getCourses : () -> (vec Course) query;
  getCourseBySlug : (text) -> (opt Course) query;
  getLesson : (courseSlug : text, lessonSlug : text) -> (opt Lesson) query;

  // Authenticated Updates (Caller-based)
  enrollCourse : (courseId : text) -> (variant { ok : UserProgress; err : text });
  completeLesson : (courseId : text, lessonId : text) -> (variant { ok : UserProgress; err : text });
  getMyProgress : (courseId : text) -> (opt UserProgress) query;
};
```

---

## 3. Frontend Architecture

The frontend lives under:
- `frontend/app/(public)/academy/page.tsx`: Static server component, full SEO and structured data.
- `frontend/components/products/icacademy/`:
  - `course-curriculum-explorer.tsx`: Main interactive curriculum navigator.
  - `lesson-video-player.tsx`: In-frame video playback with responsive aspect ratio.
  - `academy-hero.tsx`: Landing hero with CTA and badge highlights.
  - `learning-paths-section.tsx`: Recommended developer tracks.
  - `academy-faq.tsx`: Curriculum and prerequisite FAQs.
  - `academy-cta.tsx`: Closing registration and developer onboarding trigger.
