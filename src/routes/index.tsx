import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Signup } from "../components/Signup";
import { Signin } from "../components/Signin";
import { Kiosk } from "../components/Kiosk";
import { QueuedOrders } from "../components/QueuedOrders";
import { Settings } from "../components/Settings";
import { RequireAuth } from "../auth/RequireAuth";


export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },

  {
    path: "/kiosk",
    element: (
      <RequireAuth>
        <Kiosk />
      </RequireAuth>
    ),
  },
  {
    path: "/queued-orders",
    element: (
      <RequireAuth>
        <QueuedOrders />
      </RequireAuth>
    ),
  },

  {
    path: "/settings",
    element: (
      <RequireAuth>
        <Settings />
      </RequireAuth>
    ),
  },
]);