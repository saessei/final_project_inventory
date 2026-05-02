import { FormEvent, useState, useEffect } from "react";
import { UserAuth } from "@/components/auth/AuthContext";
import { profileService } from "@/services/profileService";
import { Sidebar } from "@/components/ui/Sidebar";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SettingsSkeleton } from "@/components/ui/LoadingSkeletons";
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

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-16 lg:pt-10">
        <div className="mb-6">
          <h1 className="text-4xl font-black font-fredoka">
            Account Settings
          </h1>
          <p className="text-gray-500 mt-2">
            Edit your display name or choose a new account password.
          </p>
        </div>

        <SettingsSkeleton loading={loading}>
          <div>
            {(statusMessage || formError) && (
              <div className="mb-6 rounded-2xl px-4 py-3 text-sm font-medium">
                {statusMessage ? (
                  <Alert variant="success">{statusMessage}</Alert>
                ) : (
                  <Alert variant="error">{formError}</Alert>
                )}
              </div>
            )}

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
                  <TextField
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    type="text"
                  />
                  <Button
                    type="submit"
                    disabled={loading || savingName}
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={savingName}
                    loadingText="Saving..."
                  >
                    Save Name
                  </Button>
                </form>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-dark-brown">
                  Change Password
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Choose a new password to keep your account secure.
                </p>
                <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
                  <TextField
                    label="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    type="password"
                  />
                  <TextField
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    type="password"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={savingPassword}
                    loadingText="Updating..."
                  >
                    Update Password
                  </Button>
                </form>
              </section>
            </div>
          </div>
        </SettingsSkeleton>
      </main>
    </div>
  );
};
