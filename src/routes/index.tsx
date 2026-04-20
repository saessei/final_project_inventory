import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Signup } from "../components/Signup";
import { Signin } from "../components/Signin";
import { Kiosk } from "../components/Kiosk";
import { QueuedOrders } from "../components/QueuedOrders";
import { Settings } from "../components/Settings";
import { RequireRole } from "../auth/RequireRole";


export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },

  {
    path: "/kiosk",
    element: (
      <RequireRole allow={["cashier"]}>
        <Kiosk />
      </RequireRole>
    ),
  },
  {
    path: "/queued-orders",
    element: (
      <RequireRole allow={["barista"]}>
        <QueuedOrders />
      </RequireRole>
    ),
  },

  {
    path: "/settings",
    element: (
      <RequireRole allow={["cashier", "barista"]}>
        <Settings />
      </RequireRole>
    ),
  },
]);