import { RouterProvider } from "react-router-dom";
import { AdminPinModal } from "@/components/admin/AdminPinModal";
import { useAdminPin } from "@/components/contexts/AdminPinContext";
import { router } from "@/routes";

export const AppShell = () => {
  const { showPinModal, pinModalSuccessCallback, closePinModal } =
    useAdminPin();

  const handlePinSuccess = () => {
    const callback = pinModalSuccessCallback;
    closePinModal();
    callback?.();
  };

  return (
    <>
      <RouterProvider router={router} />
      {showPinModal && (
        <AdminPinModal
          title="Admin Unlock"
          description="Enter the admin PIN to leave Staff Mode."
          onSuccess={handlePinSuccess}
          onClose={closePinModal}
        />
      )}
    </>
  );
};
