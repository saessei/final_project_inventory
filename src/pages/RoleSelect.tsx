import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useDashboardMode } from "@/components/contexts/DashboardModeContext";
import { useAdminPin } from "@/components/contexts/AdminPinContext";

export const RoleSelect = () => {
  const navigate = useNavigate();
  const { mode, setMode } = useDashboardMode();
  const { openPinModal } = useAdminPin();

  const handleSelect = (nextMode: "admin" | "staff") => {
    if (nextMode === "admin" && mode === "staff") {
      openPinModal(() => {
        setMode("admin");
        navigate("/kiosk", { replace: true });
      });
      return;
    }

    setMode(nextMode);
    navigate("/kiosk", { replace: true });
  };

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full p-8 rounded-3xl shadow-2xl bg-white/95 border border-white/70 backdrop-blur">
        <h1 className="text-brown-two text-3xl font-bold font-fredoka pb-2 text-center tracking-tight">
          Select Dashboard
        </h1>
        <p className="text-center text-sm text-gray-500 font-quicksand mb-8">
          Choose the role for this session.
        </p>

        <div className="space-y-4">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            className="uppercase"
            onClick={() => handleSelect("admin")}
          >
            Admin
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            className="uppercase"
            onClick={() => handleSelect("staff")}
          >
            Staff
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
