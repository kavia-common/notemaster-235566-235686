"use client";

import React from "react";
import type { Note } from "@/lib/types";
import { TagPills } from "@/components/TagPills";

type Props = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (note: Note) => void;
};

// PUBLIC_INTERFACE
export function NoteCard({ note, onEdit, onDelete, onTogglePin }: Props) {
  /** Displays a single note and exposes actions via callbacks. */
  return (
    <article className="card" aria-label={`Note: ${note.title}`}>
      <header className="noteCardHeader">
        <div>
          <h3 className="noteTitle">
            {note.title}{" "}
            {note.pinned ? <span className="pill badgePinned">Pinned</span> : null}
          </h3>
          <TagPills tags={note.tags} />
        </div>
        <div className="btnRow">
          <button className="btn btnGhost" type="button" onClick={() => onTogglePin(note)}>
            {note.pinned ? "Unpin" : "Pin"}
          </button>
        </div>
      </header>

      <div className="noteContent">{note.content || <span className="smallText">No content.</span>}</div>

      <div className="noteActions">
        <button className="btn btnPrimary" type="button" onClick={() => onEdit(note)}>
          Edit
        </button>
        <button className="btn btnDanger" type="button" onClick={() => onDelete(note)}>
          Delete
        </button>
      </div>
    </article>
  );
}
