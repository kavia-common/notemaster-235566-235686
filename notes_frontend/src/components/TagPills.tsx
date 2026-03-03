"use client";

import React from "react";
import type { Tag } from "@/lib/types";

type Props = {
  tags: Tag[];
};

// PUBLIC_INTERFACE
export function TagPills({ tags }: Props) {
  /** Render a compact list of tag pills. */
  if (!tags || tags.length === 0) return null;

  return (
    <div className="noteMeta" aria-label="Tags">
      {tags.map((t) => (
        <span key={t.id} className="pill pillMuted">
          #{t.name}
        </span>
      ))}
    </div>
  );
}
