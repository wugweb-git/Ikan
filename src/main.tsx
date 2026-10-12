
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./product/site/ui/styles/index.css";
  // The org portal's own rules. Loaded here rather than imported by a
  // component, because org/ may not import site/ and this must land after
  // iKAN 2's design system in the cascade.
  import "./product/org/styles/org.css";

  createRoot(document.getElementById("root")!).render(<App />);
  