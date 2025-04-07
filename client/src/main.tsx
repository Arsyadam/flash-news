import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Google Fonts
const fontImport1 = document.createElement("link");
fontImport1.rel = "preconnect";
fontImport1.href = "https://fonts.googleapis.com";

const fontImport2 = document.createElement("link");
fontImport2.rel = "preconnect";
fontImport2.href = "https://fonts.gstatic.com";
fontImport2.crossOrigin = "";

const fontStyle = document.createElement("link");
fontStyle.rel = "stylesheet";
fontStyle.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto+Serif:wght@300;400;700&display=swap";

document.head.appendChild(fontImport1);
document.head.appendChild(fontImport2);
document.head.appendChild(fontStyle);

// Set document title
document.title = "Instagram IT News Post Creator";

createRoot(document.getElementById("root")!).render(<App />);
