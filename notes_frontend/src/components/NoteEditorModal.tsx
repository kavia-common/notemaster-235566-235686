"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Note } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { parseTagInput } from "@/lib/utils";

type Mode = "create" | "edit";

type Props = {
  isOpen: boolean;
  mode: Mode;
  note?: Note | null;
  onClose: () => void;
  onSubmit: (payload: { title: string; content: string; pinned: boolean; tags: string[] }) => Promise<void>;
  isSaving: boolean;
  error?: string | null;
};

// PUBLIC_INTERFACE
export function NoteEditorModal({
  isOpen,
  mode,
  note,
  onClose,
  onSubmit,
  isSaving,
  error,
}: Props) {
  /** Modal for creating or editing a note. */
  const initial = useMemo(() => {
    if (mode === "edit" && note) {
      return {
        title: note.title ?? "",
        content: note.content ?? "",
        pinned: Boolean(note.pinned),
        tagsText: (note.tags || []).map((t) => t.name).join(", "),
      };
    }
    return { title: "", content: "", pinned: false, tagsText: "" };
  }, [mode, note]);

  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [pinned, setPinned] = useState(initial.pinned);
  const [tagsText, setTagsText] = useState(initial.tagsText);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initial.title);
    setContent(initial.content);
    setPinned(initial.pinned);
    setTagsText(initial.tagsText);
    setTouched(false);
  }, [isOpen, initial]);

  const titleError =
    touched && title.trim().length === 0 ? "Title is required." : null;

  return (
    <Modal
      title={mode === "create" ? "New note" : "Edit note"}
      subtitle="Write it like it’s 1999. Tags are comma-separated."
      isOpen={isOpen}
      onClose={() => {
        if (!isSaving) onClose();
      }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setTouched(true);
          if (title.trim().length === 0) return;

          await onSubmit({
            title: title.trim(),
            content,
            pinned,
            tags: parseTagInput(tagsText),
          });
        }}
      >
        <div className="fieldGroup">
          <label className="label">
            Title
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. VHS rental list"
              aria-invalid={Boolean(titleError)}
            />
          </label>

          <label className="label">
            Content
            <textarea
              className="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note..."
            />
          </label>

          <label className="label">
            Tags (comma-separated)
            <input
              className="input"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="work, ideas, chores"
            />
          </label>

          <label className="label" style={{ textTransform: "none", letterSpacing: 0 }}>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.6px" }}>Pinned</span>
            <select
              className="select"
              value={pinned ? "yes" : "no"}
              onChange={(e) => setPinned(e.target.value === "yes")}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>

          {titleError ? (
            <div className="stateBox errorBox" role="alert">
              <p className="stateTitle">Fix</p>
              <p className="stateText">{titleError}</p>
            </div>
          ) : null}

          {error ? (
            <div className="stateBox errorBox" role="alert">
              <p className="stateTitle">Could not save</p>
              <p className="stateText">{error}</p>
            </div>
          ) : null}

          <hr className="hr" />

          <div className="btnRow" style={{ justifyContent: "flex-end" }}>
            <button className="btn btnGhost" type="button" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button className="btn btnPrimary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
