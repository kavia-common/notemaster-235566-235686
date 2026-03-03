"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Note, Tag } from "@/lib/types";
import {
  createNote,
  deleteNote,
  listNotes,
  listTags,
  pinNote,
  searchNotes,
  unpinNote,
  updateNote,
} from "@/lib/notesApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { StateBlock } from "@/components/StateBlock";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditorModal } from "@/components/NoteEditorModal";

type LoadState = "idle" | "loading" | "loaded" | "error";

export default function HomePage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [pinnedOnly, setPinnedOnly] = useState(false);

  // Editor modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtersLabel = useMemo(() => {
    const bits: string[] = [];
    if (debouncedQuery.trim()) bits.push(`query="${debouncedQuery.trim()}"`);
    if (selectedTag) bits.push(`#${selectedTag}`);
    if (pinnedOnly) bits.push("pinned");
    return bits.length ? bits.join(" · ") : "none";
  }, [debouncedQuery, pinnedOnly, selectedTag]);

  const loadTags = useCallback(async () => {
    try {
      const t = await listTags();
      setTags(t);
    } catch {
      // Non-fatal; tag list can fail independently.
      setTags([]);
    }
  }, []);

  const loadNotes = useCallback(async () => {
    setState("loading");
    setError(null);

    try {
      const q = debouncedQuery.trim();
      if (q.length > 0) {
        const resp = await searchNotes({
          q,
          pinned: pinnedOnly ? true : undefined,
          tag: selectedTag || undefined,
          limit: 200,
        });
        setNotes(resp.results);
      } else {
        const items = await listNotes({
          pinned: pinnedOnly ? true : undefined,
          tag: selectedTag || undefined,
        });
        setNotes(items);
      }
      setState("loaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load notes.";
      setError(msg);
      setState("error");
    }
  }, [debouncedQuery, pinnedOnly, selectedTag]);

  useEffect(() => {
    // initial load
    void loadTags();
    void loadNotes();
  }, [loadNotes, loadTags]);

  useEffect(() => {
    // reload when filters change (debounced query triggers this too)
    void loadNotes();
  }, [debouncedQuery, pinnedOnly, selectedTag, loadNotes]);

  const onOpenCreate = () => {
    setEditorMode("create");
    setActiveNote(null);
    setSaveError(null);
    setEditorOpen(true);
  };

  const onOpenEdit = (note: Note) => {
    setEditorMode("edit");
    setActiveNote(note);
    setSaveError(null);
    setEditorOpen(true);
  };

  const onSubmitEditor = async (payload: {
    title: string;
    content: string;
    pinned: boolean;
    tags: string[];
  }) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (editorMode === "create") {
        await createNote(payload);
      } else if (editorMode === "edit" && activeNote) {
        await updateNote(activeNote.id, payload);
      }
      setEditorOpen(false);
      await loadTags();
      await loadNotes();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  const onTogglePin = async (note: Note) => {
    // optimistic UI: flip in-place, then confirm
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n))
    );
    try {
      if (note.pinned) {
        await unpinNote(note.id);
      } else {
        await pinNote(note.id);
      }
      await loadNotes();
    } catch (e) {
      // rollback by refreshing
      await loadNotes();
      setError(e instanceof Error ? e.message : "Failed to update pin.");
      setState("error");
    }
  };

  const onDelete = async (note: Note) => {
    setDeletingId(note.id);
    setError(null);
    try {
      await deleteNote(note.id);
      setDeletingId(null);
      await loadTags();
      await loadNotes();
    } catch (e) {
      setDeletingId(null);
      setError(e instanceof Error ? e.message : "Failed to delete note.");
      setState("error");
    }
  };

  const isEmpty = state === "loaded" && notes.length === 0;

  return (
    <main className="appShell">
      <header className="topBar">
        <div className="brand">
          <div className="brandTitle">Notemaster</div>
          <div className="brandTag">retro UI · FastAPI</div>
        </div>
        <div className="btnRow">
          <button className="btn btnPrimary" type="button" onClick={onOpenCreate}>
            + New note
          </button>
          <button className="btn btnGhost" type="button" onClick={() => void loadNotes()}>
            Refresh
          </button>
        </div>
      </header>

      <section className="mainGrid">
        {/* Sidebar */}
        <aside className="card" aria-label="Filters">
          <div className="cardHeader">
            <div className="cardTitleRow">
              <h2 className="cardTitle">Search & filters</h2>
              <span className="smallText">
                <span className="kbd">/</span> focuses search
              </span>
            </div>
          </div>
          <div className="cardBody">
            <div className="fieldGroup">
              <label className="label">
                Search
                <input
                  className="input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="title or content..."
                  onKeyDown={(e) => {
                    // convenience: '/' to focus from anywhere if already focused this is fine
                    if (e.key === "Escape") setQuery("");
                  }}
                />
              </label>

              <label className="label">
                Tag
                <select
                  className="select"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                >
                  <option value="">All tags</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.name}>
                      #{t.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="label">
                Pinned
                <select
                  className="select"
                  value={pinnedOnly ? "yes" : "no"}
                  onChange={(e) => setPinnedOnly(e.target.value === "yes")}
                >
                  <option value="no">All</option>
                  <option value="yes">Pinned only</option>
                </select>
              </label>

              <div className="stateBox" aria-label="Active filters">
                <p className="stateTitle">Active</p>
                <p className="stateText">{filtersLabel}</p>
                <div className="btnRow" style={{ marginTop: 10 }}>
                  <button
                    className="btn btnGhost"
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelectedTag("");
                      setPinnedOnly(false);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="stateBox" aria-label="Tips">
                <p className="stateTitle">Tip</p>
                <p className="stateText">
                  Search uses <span className="kbd">/search</span>. Empty query uses{" "}
                  <span className="kbd">/notes</span>.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="card" aria-label="Notes">
          <div className="cardHeader">
            <div className="notesHeader">
              <div>
                <h2 className="cardTitle">Notes</h2>
                <div className="smallText">
                  {state === "loaded" ? `${notes.length} shown` : "Loading..."}
                </div>
              </div>
              <div className="btnRow">
                <button className="btn btnGhost" type="button" onClick={onOpenCreate}>
                  New
                </button>
              </div>
            </div>
          </div>

          <div className="cardBody">
            {state === "loading" ? (
              <div className="stateBox" aria-label="Loading notes">
                <p className="stateTitle">Loading</p>
                <p className="stateText">Fetching notes from the server…</p>
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <div className="skeleton" style={{ width: "62%" }} />
                  <div className="skeleton" style={{ width: "84%" }} />
                  <div className="skeleton" style={{ width: "74%" }} />
                </div>
              </div>
            ) : null}

            {state === "error" && error ? (
              <StateBlock
                title="Error"
                message={error}
                variant="error"
              >
                <div className="btnRow">
                  <button className="btn btnGhost" type="button" onClick={() => void loadNotes()}>
                    Try again
                  </button>
                </div>
              </StateBlock>
            ) : null}

            {isEmpty ? (
              <StateBlock
                title="No notes"
                message="Nothing matched your filters. Create a note or clear filters."
              >
                <div className="btnRow">
                  <button className="btn btnPrimary" type="button" onClick={onOpenCreate}>
                    Create your first note
                  </button>
                  <button
                    className="btn btnGhost"
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelectedTag("");
                      setPinnedOnly(false);
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              </StateBlock>
            ) : null}

            {state === "loaded" && notes.length > 0 ? (
              <div className="notesGrid" aria-label="Notes list">
                {notes.map((n) => (
                  <div key={n.id} aria-busy={deletingId === n.id ? "true" : "false"}>
                    <NoteCard
                      note={n}
                      onEdit={onOpenEdit}
                      onDelete={(note) => void onDelete(note)}
                      onTogglePin={(note) => void onTogglePin(note)}
                    />
                    {deletingId === n.id ? (
                      <div className="smallText" style={{ marginTop: 6 }}>
                        Deleting…
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </section>

      <NoteEditorModal
        isOpen={editorOpen}
        mode={editorMode}
        note={activeNote}
        onClose={() => setEditorOpen(false)}
        onSubmit={onSubmitEditor}
        isSaving={saving}
        error={saveError}
      />
    </main>
  );
}
