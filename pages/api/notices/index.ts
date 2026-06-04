// pages/api/notices/index.ts
//
// WHAT THIS FILE DOES:
// Handles two HTTP methods on the /api/notices endpoint:
//   GET  → return all notices from the database (urgent first)
//   POST → validate input, then create a new notice
//
// Next.js automatically routes any file under pages/api/ as a serverless function.
// The 'req' object is the incoming request. The 'res' object is what you send back.

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import type { Category, Priority } from "../../../lib/types";

// Helper: check if a string is a valid date
function isValidDate(str: string): boolean {
  const d = new Date(str);
  return !isNaN(d.getTime());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ─── GET /api/notices ───────────────────────────────────────────────────────
  // Returns all notices, urgent ones first, then by publishDate descending.
  // Sorting is done in the DATABASE via Prisma's orderBy — not in JavaScript.
  if (req.method === "GET") {
    try {
      const notices = await prisma.notice.findMany({
        orderBy: [
          // Prisma sorts enums alphabetically. "Urgent" > "Normal" alphabetically,
          // but we want Urgent FIRST (ascending). Since U > N, we use 'asc'.
          // Actually: "Normal" < "Urgent" in alphabet, so asc puts Normal first.
          // We need desc to put Urgent first.
          { priority: "desc" },
          // Within each priority group, newest publishDate first
          { publishDate: "desc" },
        ],
      });
      return res.status(200).json(notices);
    } catch (error) {
      console.error("GET /api/notices error:", error);
      return res.status(500).json({ message: "Failed to fetch notices." });
    }
  }

  // ─── POST /api/notices ──────────────────────────────────────────────────────
  // Creates a new notice. Validates all required fields on the SERVER.
  if (req.method === "POST") {
    const { title, body, category, priority, publishDate, imageUrl } = req.body;

    // ── Server-side validation ─────────────────────────────────────────────────
    const errors: Record<string, string> = {};

    if (!title || typeof title !== "string" || title.trim() === "") {
      errors.title = "Title is required.";
    }
    if (!body || typeof body !== "string" || body.trim() === "") {
      errors.body = "Body is required.";
    }
    const validCategories: Category[] = ["Exam", "Event", "General"];
    if (!category || !validCategories.includes(category as Category)) {
      errors.category = "Category must be Exam, Event, or General.";
    }
    const validPriorities: Priority[] = ["Normal", "Urgent"];
    if (!priority || !validPriorities.includes(priority as Priority)) {
      errors.priority = "Priority must be Normal or Urgent.";
    }
    if (!publishDate || !isValidDate(publishDate)) {
      errors.publishDate = "A valid publish date is required.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: "Validation failed.", errors });
    }

    // ── Create in DB ───────────────────────────────────────────────────────────
    try {
      const notice = await prisma.notice.create({
        data: {
          title: title.trim(),
          body: body.trim(),
          category: category as Category,
          priority: priority as Priority,
          publishDate: new Date(publishDate),
          imageUrl: imageUrl?.trim() || null,
        },
      });
      return res.status(201).json(notice);
    } catch (error) {
      console.error("POST /api/notices error:", error);
      return res.status(500).json({ message: "Failed to create notice." });
    }
  }

  // ─── Method not allowed ─────────────────────────────────────────────────────
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: `Method ${req.method} not allowed.` });
}
