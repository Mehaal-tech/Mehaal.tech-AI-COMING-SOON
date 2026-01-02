import "virtual:uno.css";
import "~/styles/global.css";

import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import ErrorBoundary from "~/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Router
        root={(props) => (
          <>
            <Nav />
            <Suspense fallback={
              <div style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                height: "100vh",
                background: "#000",
                color: "#00ffff"
              }}>
                <div style={{
                  "text-align": "center"
                }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    border: "4px solid rgba(0, 255, 255, 0.3)",
                    "border-top-color": "#00ffff",
                    "border-radius": "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 1rem"
                  }} />
                  <p style={{
                    "font-family": "CabinetGrotesk-Variable, sans-serif",
                    "font-size": "1.25rem"
                  }}>
                    Loading...
                  </p>
                </div>
              </div>
            }>
              {props.children}
            </Suspense>
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </ErrorBoundary>
  );
}
