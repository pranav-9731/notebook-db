// pages/api/notices/[id].ts
//
// WHAT THIS FILE DOES:
// Handles operations on a SINGLE notice by its ID.
// The [id] in the filename is a dynamic route — Next.js captures the value
// from the URL and puts it in req.query.id.
//
//   GET    /api/notices/5  → fetch notice with id=5
//   PUT    /api/notices/5  → replace all fields of notice with id=5
//   DELETE /api/notices/5  → delete notice with id=5

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import type { Category, Priority } from "../../../lib/types";

function isValidDate(str: string): boolean {
  const d = new Date(str);
  return !isNaN(d.getTime());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Parse and validate the ID from the URL
  const rawId = req.query.id;
  const id = parseInt(rawId as string, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid notice ID." });
  }

  // ─── GET /api/notices/:id ────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const notice = await prisma.notice.findUnique({ where: { id } });
      if (!notice) {
        return res.status(404).json({ message: "Notice not found." });
      }
      return res.status(200).json(notice);
    } catch (error) {
      console.error(`GET /api/notices/${id} error:`, error);
      return res.status(500).json({ message: "Failed to fetch notice." });
    }
  }

  // ─── PUT /api/notices/:id ────────────────────────────────────────────────────
  // Full update — all fields must be provided (same as POST validation)
  if (req.method === "PUT") {
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

    // ── Check notice exists ────────────────────────────────────────────────────
    try {
      const existing = await prisma.notice.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: "Notice not found." });
      }

      const updated = await prisma.notice.update({
        where: { id },
        data: {
          title: title.trim(),
          body: body.trim(),
          category: category as Category,
          priority: priority as Priority,
          publishDate: new Date(publishDate),
          imageUrl: imageUrl?.trim() || null,
        },
      });
      return res.status(200).json(updated);
    } catch (error) {
      console.error(`PUT /api/notices/${id} error:`, error);
      return res.status(500).json({ message: "Failed to update notice." });
    }
  }

  // ─── DELETE /api/notices/:id ─────────────────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const existing = await prisma.notice.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: "Notice not found." });
      }

      await prisma.notice.delete({ where: { id } });
      // 204 = No Content — success, but nothing to send back
      return res.status(204).end();
    } catch (error) {
      console.error(`DELETE /api/notices/${id} error:`, error);
      return res.status(500).json({ message: "Failed to delete notice." });
    }
  }

  // ─── Method not allowed ─────────────────────────────────────────────────────
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ message: `Method ${req.method} not allowed.` });
}
