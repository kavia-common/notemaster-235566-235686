import React from "react";

export default function NotFound() {
  return (
    <main className="appShell">
      <header className="topBar">
        <div className="brand">
          <div className="brandTitle">Notemaster</div>
          <div className="brandTag">retro UI · FastAPI</div>
        </div>
      </header>

      <section className="card" role="alert" aria-live="assertive" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="cardHeader">
          <h1 className="cardTitle">404 – Page Not Found</h1>
        </div>
        <div className="cardBody">
          <p className="stateText">The page you’re looking for doesn’t exist.</p>
        </div>
      </section>
    </main>
  );
}
