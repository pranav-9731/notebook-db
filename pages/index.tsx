// pages/index.tsx
//
// WHAT THIS PAGE DOES:
// This is the MAIN PAGE of the app — the notice board listing.
// It:
//   1. Fetches all notices from /api/notices on page load
//   2. Renders them as responsive cards
//   3. Opens a modal form when you click "Add Notice" or "Edit" on a card
//   4. Shows a confirmation dialog when you click "Delete"
//   5. After any CRUD action, re-fetches the list so it's always fresh

import React, { useState, useCallback, useEffect } from "react";
import Head from "next/head";
import NoticeCard from "../components/NoticeCard";
import NoticeForm from "../components/NoticeForm";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import type { Notice, NoticeFormData } from "../lib/types";

export default function Home() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modal / form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Fetch all notices ────────────────────────────────────────────────────────
  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/notices");
      if (!res.ok) throw new Error("Failed to load notices.");
      const data: Notice[] = await res.json();
      setNotices(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // ─── Open form for create ──────────────────────────────────────────────────────
  function openCreate() {
    setEditingNotice(undefined);
    setFormError(null);
    setIsFormOpen(true);
  }

  // ─── Open form for edit ────────────────────────────────────────────────────────
  function openEdit(notice: Notice) {
    setEditingNotice(notice);
    setFormError(null);
    setIsFormOpen(true);
  }

  // ─── Handle form submit (create or update) ────────────────────────────────────
  async function handleFormSubmit(data: NoticeFormData) {
    setFormLoading(true);
    setFormError(null);

    const isEditing = Boolean(editingNotice);
    const url = isEditing ? `/api/notices/${editingNotice!.id}` : "/api/notices";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        // Show the first validation error, or the generic message
        const firstError =
          body.errors ? Object.values(body.errors)[0] as string : body.message;
        setFormError(firstError ?? "Something went wrong.");
        return;
      }

      // Success — close modal and refresh list
      setIsFormOpen(false);
      await fetchNotices();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  }

  // ─── Handle delete ─────────────────────────────────────────────────────────────
  function requestDelete(id: number) {
    setDeletingId(id);
  }

  async function confirmDelete() {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/notices/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json();
        alert(body.message ?? "Failed to delete.");
        return;
      }
      setDeletingId(null);
      await fetchNotices();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  const urgentCount = notices.filter((n) => n.priority === "Urgent").length;

  return (
    <>
      <Head>
        <title>Notice Board</title>
        <meta name="description" content="Institutional Notice Board" />
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* ── Header ── */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Notice Board</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {notices.length} notice{notices.length !== 1 ? "s" : ""}
                {urgentCount > 0 && (
                  <span className="ml-2 text-red-600 font-medium">
                    · {urgentCount} urgent
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={openCreate}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              + Add Notice
            </button>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              <p className="font-medium">{fetchError}</p>
              <button
                onClick={fetchNotices}
                className="mt-3 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-24 text-center">
              <p className="text-lg font-medium text-slate-400">No notices yet.</p>
              <p className="mt-1 text-sm text-slate-400">
                Click &quot;Add Notice&quot; to create the first one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {notices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onEdit={openEdit}
                  onDelete={requestDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Add/Edit modal ── */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        <NoticeForm
          initialData={editingNotice}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={formLoading}
        />
      </Modal>

      {/* ── Delete confirmation ── */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete this notice?"
        message="This action cannot be undone. The notice will be permanently removed."
        confirmLabel="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
        isLoading={deleteLoading}
      />
    </>
  );
}
