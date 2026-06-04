// components/NoticeForm.tsx
//
// WHAT THIS COMPONENT DOES:
// A single form that handles BOTH creating new notices AND editing existing ones.
// When `initialData` is passed, the form pre-fills those values (edit mode).
// When nothing is passed, all fields start empty (create mode).
//
// The parent decides what to do on submit — this component just collects data
// and calls the `onSubmit` callback with the form values.

import React, { useState, useEffect } from "react";
import type { NoticeFormData, Notice } from "../lib/types";

interface NoticeFormProps {
  initialData?: Notice;
  onSubmit: (data: NoticeFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EMPTY_FORM: NoticeFormData = {
  title: "",
  body: "",
  category: "General",
  priority: "Normal",
  publishDate: new Date().toISOString().split("T")[0], // today's date as YYYY-MM-DD
  imageUrl: "",
};

export default function NoticeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: NoticeFormProps) {
  const [form, setForm] = useState<NoticeFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // When initialData changes (opening edit for a different notice), reset form
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        body: initialData.body,
        category: initialData.category,
        priority: initialData.priority,
        // Convert ISO date to YYYY-MM-DD for the date input
        publishDate: new Date(initialData.publishDate).toISOString().split("T")[0],
        imageUrl: initialData.imageUrl ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  // Client-side validation (lightweight check before hitting the API)
  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.body.trim()) newErrors.body = "Body is required.";
    if (!form.publishDate) newErrors.publishDate = "Publish date is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  }

  const isEditing = Boolean(initialData);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-slate-900">
        {isEditing ? "Edit Notice" : "Add New Notice"}
      </h2>

      {/* Title */}
      <Field label="Title" error={errors.title} required>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Notice title"
          className={inputClass(errors.title)}
          maxLength={255}
        />
      </Field>

      {/* Body */}
      <Field label="Body" error={errors.body} required>
        <textarea
          name="body"
          value={form.body}
          onChange={handleChange}
          placeholder="Full notice text…"
          rows={5}
          className={inputClass(errors.body) + " resize-none"}
        />
      </Field>

      {/* Category & Priority in a 2-col grid */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category" error={errors.category}>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={inputClass(errors.category)}
          >
            <option value="General">General</option>
            <option value="Exam">Exam</option>
            <option value="Event">Event</option>
          </select>
        </Field>

        <Field label="Priority" error={errors.priority}>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className={inputClass(errors.priority)}
          >
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </select>
        </Field>
      </div>

      {/* Publish date */}
      <Field label="Publish Date" error={errors.publishDate} required>
        <input
          type="date"
          name="publishDate"
          value={form.publishDate}
          onChange={handleChange}
          className={inputClass(errors.publishDate)}
        />
      </Field>

      {/* Image URL (optional) */}
      <Field label="Image URL (optional)" error={errors.imageUrl}>
        <input
          type="url"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className={inputClass(errors.imageUrl)}
        />
      </Field>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isLoading
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
            ? "Save Changes"
            : "Create Notice"}
        </button>
      </div>
    </form>
  );
}

// ─── Small helper sub-components ────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(error?: string) {
  return [
    "w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900",
    "outline-none transition-colors",
    "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
    error
      ? "border-red-400 bg-red-50"
      : "border-slate-200 bg-white hover:border-slate-300",
  ].join(" ");
}
