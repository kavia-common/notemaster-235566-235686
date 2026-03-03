"use client";

import React from "react";

type Props = {
  title: string;
  message: string;
  variant?: "info" | "error";
  children?: React.ReactNode;
};

// PUBLIC_INTERFACE
export function StateBlock({ title, message, variant = "info", children }: Props) {
  /** Displays loading/empty/error information blocks with optional actions. */
  const className =
    variant === "error" ? "stateBox errorBox" : "stateBox";

  return (
    <div className={className} role={variant === "error" ? "alert" : "status"} aria-live="polite">
      <p className="stateTitle">{title}</p>
      <p className="stateText">{message}</p>
      {children ? <div style={{ marginTop: 10 }}>{children}</div> : null}
    </div>
  );
}
