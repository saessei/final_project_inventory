import { UserAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./common/Sidebar";

export const Dashboard = () => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userName = session?.user?.user_metadata?.display_name || session?.user?.email?.split("@")[0] || "Guest";

  return (
    <div className="bg-cream min-h-screen w-full flex font-quicksand">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold font-fredoka text-dark-brown">Hello, {userName}!</h1>
          <p className="text-sm text-gray-500">Get ready to take orders!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">Kiosk card placeholder</div>
          <div className="rounded-xl bg-white p-6 shadow-sm">Queued orders placeholder</div>
          <div className="rounded-xl bg-white p-6 shadow-sm">Cart / totals placeholder</div>
        </div>

      </main>
    </div>
  );
}
