// components/NoticeCard.tsx
//
// WHAT THIS COMPONENT DOES:
// Renders one notice as a card. Shows the badge, title, date, category tag,
// body text, optional image, and Edit / Delete buttons.
// The parent passes onEdit and onDelete as props (callback functions).

import React from "react";
import type { Notice } from "../lib/types";

interface NoticeCardProps {
  notice: Notice;
  onEdit: (notice: Notice) => void;
  onDelete: (id: number) => void;
}

// Format a date string like "June 4, 2026"
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  Exam: "bg-blue-100 text-blue-800",
  Event: "bg-emerald-100 text-emerald-800",
  General: "bg-slate-100 text-slate-700",
};

export default function NoticeCard({ notice, onEdit, onDelete }: NoticeCardProps) {
  const isUrgent = notice.priority === "Urgent";

  return (
    <article
      className={`
        relative flex flex-col rounded-2xl border bg-white shadow-sm
        transition-shadow hover:shadow-md overflow-hidden
        ${isUrgent ? "border-red-300" : "border-slate-200"}
      `}
    >
      {/* Urgent top stripe */}
      {isUrgent && <div className="h-1 w-full bg-red-500" />}

      {/* Optional image */}
      {notice.imageUrl && (
        <div className="h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={notice.imageUrl}
            alt={notice.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          {isUrgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              {/* Red dot */}
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Urgent
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              CATEGORY_COLORS[notice.category] ?? "bg-slate-100 text-slate-700"
            }`}
          >
            {notice.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold leading-snug text-slate-900">
          {notice.title}
        </h2>

        {/* Body */}
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
          {notice.body}
        </p>

        {/* Date */}
        <p className="text-xs text-slate-400">{formatDate(notice.publishDate)}</p>

        {/* Actions */}
        <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={() => onEdit(notice)}
            className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(notice.id)}
            className="flex-1 rounded-lg border border-red-200 bg-white py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-300"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
