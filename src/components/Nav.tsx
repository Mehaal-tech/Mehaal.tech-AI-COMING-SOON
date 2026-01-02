import { useLocation } from "@solidjs/router";
import { Show } from "solid-js";

export default function Nav() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  
  const isHomePage = () => location.pathname === "/";

  return (
    <Show when={!isHomePage()}>
      <nav style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        "z-index": "50",
        background: "rgb(7 89 133)"
      }}>
        <ul style={{
          display: "flex",
          "align-items": "center",
          padding: "0.75rem",
          color: "rgb(229 231 235)",
          "max-width": "1280px",
          margin: "0 auto"
        }}>
          <li style={{
            "border-bottom": location.pathname === "/" ? "2px solid rgb(2 132 199)" : "2px solid transparent",
            margin: "0 1.5rem"
          }}>
            <a href="/">Home</a>
          </li>
          <li style={{
            "border-bottom": location.pathname === "/about" ? "2px solid rgb(2 132 199)" : "2px solid transparent",
            margin: "0 1.5rem"
          }}>
            <a href="/about">About</a>
          </li>
        </ul>
      </nav>
    </Show>
  );
}
