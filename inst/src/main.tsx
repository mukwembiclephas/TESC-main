// main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "@/context/AuthContext";
import { BrowserRouter } from "react-router-dom"; // if using react-router
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
