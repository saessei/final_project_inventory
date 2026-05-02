import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthContextProvider } from "./components/auth/AuthContext";
import { DashboardModeProvider } from "./components/contexts/DashboardModeContext";
import { AdminPinProvider } from "./components/contexts/AdminPinContext";
import { AppShell } from "./AppShell";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthContextProvider>
      <DashboardModeProvider>
        <AdminPinProvider>
          <AppShell />
        </AdminPinProvider>
      </DashboardModeProvider>
    </AuthContextProvider>
  </StrictMode>,
);
