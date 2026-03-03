"use client";

import React, { useEffect } from "react";

type Props = {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

// PUBLIC_INTERFACE
export function Modal({ title, subtitle, isOpen, onClose, children }: Props) {
  /** A simple modal dialog with overlay; handles Escape and overlay click to close. */
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modalOverlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="cardHeader">
          <div className="modalHeaderRow">
            <div>
              <div className="cardTitle">{title}</div>
              {subtitle ? <div className="smallText">{subtitle}</div> : null}
            </div>
            <button className="btn btnGhost" type="button" onClick={onClose}>
              Close <span className="kbd">Esc</span>
            </button>
          </div>
        </div>
        <div className="cardBody">{children}</div>
      </div>
    </div>
  );
}
