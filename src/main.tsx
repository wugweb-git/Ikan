
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./product/site/ui/styles/index.css";
  // The org portal's own rules. Loaded here rather than imported by a
  // component, because org/ may not import site/ and this must land after
  // iKAN 2's design system in the cascade.
  import "./product/org/styles/org.css";

  const root = document.getElementById("root")!;

  // The page scrolls inside #root, not the window, so its scrollbar narrows
  // the content but not the fixed nav band. Publish the width so the band can
  // end where the content area does (globals.css, "THE NAV'S WIDTH"). It is 0
  // with overlay scrollbars, and changes as pages grow past the screen.
  const publishScrollbar = () =>
    document.documentElement.style.setProperty("--root-scrollbar", `${root.offsetWidth - root.clientWidth}px`);
  const sizes = new ResizeObserver(publishScrollbar);
  sizes.observe(root);
  new MutationObserver(() => {
    if (root.firstElementChild) sizes.observe(root.firstElementChild);
    publishScrollbar();
  }).observe(root, { childList: true });

  createRoot(root).render(<App />);
  