import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.tsx";
import "./index.css";
import { AuthContextProvider } from "./components/auth/AuthContext";
import { DashboardModeProvider } from "./components/contexts/DashboardModeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthContextProvider>
      <DashboardModeProvider>
        <RouterProvider router={router} />
      </DashboardModeProvider>
    </AuthContextProvider>
  </StrictMode>,
);
