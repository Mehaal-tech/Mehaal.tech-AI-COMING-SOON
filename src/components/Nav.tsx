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
    <nav class="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <Show when={!isHomePage()}>
        <ul class="container flex items-center p-3 text-gray-200 bg-sky-800">
          <li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
            <a href="/">Home</a>
          </li>
          <li class={`border-b-2 ${active("/about")} mx-1.5 sm:mx-6`}>
            <a href="/about">About</a>
          </li>
        </ul>
      </Show>
      <Show when={isHomePage()}>
        {/* Empty nav placeholder for home page - "Launching Soon" will appear here later via animation */}
        <div class="h-20 flex items-center justify-center">
          <div id="nav-launching-soon-placeholder" class="text-transparent">
            {/* Placeholder for animated content */}
          </div>
        </div>
      </Show>
    </nav>
  );
}
