/** Mirrors `models.CourseStatus`. Only `published` courses reach the public
 *  catalog. */
export type CourseStatus = "draft" | "published" | "archived";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  category: string;
  status: CourseStatus;
  lesson_count: number;
  duration_min: number;
  created_at: string;
  updated_at: string;
  /** Admin listings only. */
  enrollment_count?: number;
  /** Present for a signed-in learner. */
  progress?: number;
}

export interface Attachment {
  id: string;
  lesson_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  /** Raw markdown. Absent on public outlines, which carry titles only. */
  content?: string;
  video_url?: string | null;
  duration_min: number;
  sort_order: number;
  /** Present for a signed-in learner. */
  completed?: boolean;
  attachments?: Attachment[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: Lesson[];
}

export interface CourseDetail extends Course {
  modules: Module[];
}

export interface Progress {
  total_lessons: number;
  completed_lessons: number;
  percentage: number;
}

export interface Enrollment {
  id: string;
  course: Course;
  enrolled_at: string;
  completed_at: string | null;
  progress: Progress;
}

export interface Certificate {
  id: string;
  cert_number: string;
  course_id: string;
  course_title: string;
  user_name: string;
  pdf_url: string | null;
  issued_at: string;
}

export interface AnalyticsOverview {
  total_users: number;
  total_learners: number;
  total_admins: number;
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  archived_courses: number;
  total_enrollments: number;
  total_completions: number;
}

export interface CourseAnalytics {
  course_id: string;
  course_title: string;
  enrollment_count: number;
  completion_count: number;
  completion_rate: number;
  average_progress: number;
}

export interface LearnerProgress {
  user_id: string;
  name: string;
  email: string;
  percentage: number;
  is_completed: boolean;
}
