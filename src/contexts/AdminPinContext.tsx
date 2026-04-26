// contexts/AdminPinContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface AdminPinContextType {
  showPinModal: boolean;
  pinModalSuccessCallback: (() => void) | null;
  openPinModal: (onSuccess: () => void) => void;
  closePinModal: () => void;
}

const AdminPinContext = createContext<AdminPinContextType | undefined>(undefined);

export const useAdminPin = () => {
  const context = useContext(AdminPinContext);
  if (!context) {
    throw new Error("useAdminPin must be used within AdminPinProvider");
  }
  return context;
};

export const AdminPinProvider = ({ children }: { children: ReactNode }) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalSuccessCallback, setPinModalSuccessCallback] = useState<(() => void) | null>(null);

  const openPinModal = (onSuccess: () => void) => {
    setPinModalSuccessCallback(() => onSuccess);
    setShowPinModal(true);
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setPinModalSuccessCallback(null);
  };

  return (
    <AdminPinContext.Provider
      value={{
        showPinModal,
        pinModalSuccessCallback,
        openPinModal,
        closePinModal,
      }}
    >
      {children}
    </AdminPinContext.Provider>
  );
};