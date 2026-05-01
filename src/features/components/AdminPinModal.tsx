// src/components/AdminPinModal.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Key, Lock, X } from "lucide-react";
import supabase from "../../lib/supabaseClient";
import { UserAuth } from "../../auth/AuthContext";

interface AdminPinModalProps {
  onSuccess: () => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const AdminPinModal = ({ onSuccess, onClose, title, description }: AdminPinModalProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasExistingPin, setHasExistingPin] = useState<boolean | null>(null);
  const { session, refreshSession } = UserAuth();
  
  const hasVerifiedRef = useRef(false);
  const isVerifyingRef = useRef(false);

  const checkUserPinStatus = useCallback(async () => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("admin_pin")
        .eq("id", session?.user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setHasExistingPin(false);
      } else {
        console.log("Has existing PIN:", !!profile?.admin_pin);
        setHasExistingPin(!!profile?.admin_pin);
      }
    } catch (err) {
      console.error("Error checking PIN status:", err);
      setHasExistingPin(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    checkUserPinStatus();
  }, [checkUserPinStatus]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  const handleCreatePin = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError("");

    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      setLoading(false);
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ admin_pin: pin })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("Update error:", updateError);
      setError("Failed to set admin PIN");
      setLoading(false);
    } else {
      console.log("PIN created and saved successfully!");
      await refreshSession();
      setHasExistingPin(true);
      setPin("");
      setConfirmPin("");
      setError("");
      setLoading(false);
      onSuccess();
    }
  };

  const handleVerifyPin = async () => {
    if (hasVerifiedRef.current || isVerifyingRef.current) {
      console.log("Already verified or verifying, skipping...");
      return;
    }
    
    if (!session?.user?.id) return;
    
    isVerifyingRef.current = true;
    setLoading(true);
    setError("");

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("admin_pin")
      .eq("id", session.user.id)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      setError("Error verifying PIN");
      setLoading(false);
      isVerifyingRef.current = false;
      return;
    }

    console.log("Entered PIN:", pin);
    console.log("Saved PIN:", profile?.admin_pin);

    if (pin === profile?.admin_pin) {
      console.log("PIN verified, success!");
      hasVerifiedRef.current = true;
      await refreshSession();
      setLoading(false);
      isVerifyingRef.current = false;
      onSuccess();
    } else {
      setError("Invalid PIN. Please try again.");
      setLoading(false);
      isVerifyingRef.current = false;
    }
  };

  const handleSubmit = () => {
    if (hasExistingPin) {
      handleVerifyPin();
    } else {
      handleCreatePin();
    }
  };

  if (!session?.user?.id) {
    return null;
  }

  if (hasExistingPin === null) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-brown mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]">
      <div 
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-dark-brown rounded-full flex items-center justify-center shadow-lg">
            <Key size={40} className="text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 font-fredoka">
          {title || (hasExistingPin ? "Verify Admin PIN" : "Setup Admin PIN")}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {description || (hasExistingPin 
            ? "Enter your admin PIN to access this feature." 
            : "Create a PIN to access admin features.")}
        </p>

        {!hasExistingPin ? (
          <>
            <div className="mb-4">
              <label className="text-sm font-semibold text-dark-brown mb-2 block">
                Create Admin PIN
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-6 digit PIN"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-dark-brown focus:ring-2 focus:ring-dark-brown/20 transition-all"
                  autoFocus
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="text-sm font-semibold text-dark-brown mb-2 block">
                Confirm Admin PIN
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm your PIN"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-dark-brown focus:ring-2 focus:ring-dark-brown/20 transition-all"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="mb-6">
            <label className="text-sm font-semibold text-dark-brown mb-2 block">
              Enter Admin PIN
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-dark-brown focus:ring-2 focus:ring-dark-brown/20 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-dark-brown text-white rounded-xl font-semibold hover:bg-brown-dark transition-colors mb-3 disabled:opacity-50"
        >
          {loading ? "Processing..." : (!hasExistingPin ? "Create PIN & Save" : "Verify Access")}
        </button>

        <button
          onClick={onClose}
          className="w-full py-2 text-gray-500 hover:text-dark-brown transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};