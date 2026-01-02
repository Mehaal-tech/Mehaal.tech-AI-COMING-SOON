import { createSignal, JSX, onError } from "solid-js";

interface ErrorBoundaryProps {
  fallback?: (error: Error, reset: () => void) => JSX.Element;
  children: JSX.Element;
}

export default function ErrorBoundary(props: ErrorBoundaryProps) {
  const [error, setError] = createSignal<Error | null>(null);

  onError((err) => {
    console.error("ErrorBoundary caught an error:", err);
    setError(err as Error);
  });

  const reset = () => {
    setError(null);
  };

  const defaultFallback = (err: Error, resetFn: () => void) => (
    <div 
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        height: "100vh",
        background: "#000",
        color: "#00ffff",
        padding: "2rem",
        "text-align": "center"
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{
        "max-width": "600px",
        background: "rgba(0, 0, 0, 0.8)",
        border: "2px solid rgba(0, 255, 255, 0.3)",
        "border-radius": "1rem",
        padding: "2rem",
        "box-shadow": "0 0 30px rgba(0, 255, 255, 0.2)"
      }}>
        <h1 style={{
          "font-size": "2rem",
          "margin-bottom": "1rem",
          "font-family": "CabinetGrotesk-Variable, sans-serif"
        }}>
          Oops! Something went wrong
        </h1>
        <p style={{
          "margin-bottom": "1rem",
          opacity: 0.8,
          "line-height": "1.6"
        }}>
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>
        <details style={{
          "margin-top": "1rem",
          "margin-bottom": "1.5rem",
          "text-align": "left",
          background: "rgba(255, 0, 0, 0.1)",
          padding: "1rem",
          "border-radius": "0.5rem",
          "font-size": "0.875rem"
        }}>
          <summary style={{ cursor: "pointer", "margin-bottom": "0.5rem" }}>
            Technical Details
          </summary>
          <code style={{
            "white-space": "pre-wrap",
            "word-break": "break-word",
            display: "block",
            "font-family": "monospace"
          }}>
            {err.message}
            {"\n\n"}
            {err.stack}
          </code>
        </details>
        <button
          onClick={resetFn}
          style={{
            background: "linear-gradient(to bottom right, #06b6d4, #2563eb)",
            color: "white",
            padding: "0.75rem 2rem",
            "border-radius": "9999px",
            border: "none",
            cursor: "pointer",
            "font-size": "1rem",
            "font-weight": "600",
            transition: "transform 0.2s",
            "box-shadow": "0 0 20px rgba(0, 255, 255, 0.5)"
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <>
      {error() 
        ? (props.fallback || defaultFallback)(error()!, reset)
        : props.children
      }
    </>
  );
}
