import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { DataProvider } from "./context/data-server/DataProvider.tsx";
import { DnDProvider } from "./context/dnd/DnDProvider.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataProvider>
        <DnDProvider>
          <App />
        </DnDProvider>
    </DataProvider>
  </StrictMode>
);
