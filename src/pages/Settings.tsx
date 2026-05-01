import { FormEvent, useState, useEffect } from "react";
import { UserAuth } from "@/components/auth/AuthContext";
import { profileService } from "@/services/ProfileService";
import { Sidebar } from "@/components/ui/Sidebar";
import supabase from "@/lib/supabaseClient";

export const Settings = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { session, refreshSession } = UserAuth();

  useEffect(() => {
    if (session?.user?.id) {
      profileService
        .getProfile(session.user.id)
        .then((data) => {
          if (data) {
            setName(data.full_name || "");
          } else {
            setName(""); //default if no profile exists
          }
          setLoading(false);
        })
        .catch((_err) => {
          console.error(_err);
          setLoading(false);
        });
    }
  }, [session]);

  const handleUpdateName = async () => {
    if (!session?.user?.id) return;

    setSavingName(true);
    try {
      await profileService.updateName(session.user.id, name);

      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: name },
      });

      if (authError) throw authError;

      await refreshSession();

      setStatusMessage("Name updated successfully.");
    } catch {
      setFormError("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setStatusMessage(null);
    setSavingPassword(true);

    if (!password || !confirmPassword) {
      setFormError("Both password fields are required.");
      setSavingPassword(false);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      setSavingPassword(false);
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      setSavingPassword(false);
      return;
    }

    try {
      await profileService.updatePassword(password);
      setStatusMessage("Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      console.error("Password update failed:");
      setFormError("Could not update password. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto p-4 lg:p-6 pt-16 lg:pt-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-black font-fredoka">
              Account Settings
            </h1>
            <p className="text-gray-500 mt-2">
              Edit your display name or choose a new account password.
            </p>
          </div>

          {(statusMessage || formError) && (
            <div className="mb-6 rounded-2xl px-4 py-3 text-sm font-medium">
              {statusMessage ? (
                <p className="text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-xl px-4 py-3">
                  {statusMessage}
                </p>
              ) : (
                <p className="text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-3">
                  {formError}
                </p>
              )}
            </div>
          )}

          {/* Name modal */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-dark-brown">
                Display Name
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                This name appears across your dashboard experience.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleUpdateName();
                }}
                className="mt-6 space-y-4"
              >
                <label className="text-xs uppercase ml-2 font-semibold text-brown-two">
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full p-3 rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all"
                  type="text"
                />
                <button
                  type="submit"
                  disabled={loading || savingName}
                  className="w-full rounded-2xl bg-gradient-to-r from-brown-two to-dark-brown px-4 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingName ? "Saving..." : "Save Name"}
                </button>
              </form>
            </section>

            {/* Password modal */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-dark-brown">
                Change Password
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Choose a new password to keep your account secure.
              </p>
              <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs uppercase ml-2 font-semibold text-brown-two">
                    New Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full p-3 rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all"
                    type="password"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase ml-2 font-semibold text-brown-two">
                    Confirm Password
                  </label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full p-3 rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all"
                    type="password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full rounded-2xl bg-gradient-to-r from-brown-two to-dark-brown px-4 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
