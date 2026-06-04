// lib/types.ts
//
// Shared TypeScript types. By defining them once here, both the
// frontend components and API routes use exactly the same shape.

export type Category = "Exam" | "Event" | "General";
export type Priority = "Normal" | "Urgent";

export interface Notice {
  id: number;
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  publishDate: string; // ISO string when coming from JSON (Date serializes to string)
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeFormData {
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  publishDate: string; // "YYYY-MM-DD" for <input type="date">
  imageUrl: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}
