// components/Signin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "@/components/auth/AuthContext";
import { Header } from "@/components/ui/Header";
import { BobaFooter } from "@/components/ui/BobaFooter";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import * as React from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signInUser } = UserAuth()!;
  const navigate = useNavigate();

  const handleSignIn = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await signInUser(email, password);

      if (result.success) {
        navigate("/role-select", { replace: true });
      } else {
        setError(result.error || "Invalid email or password.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen w-full overflow-hidden flex flex-col relative">
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brown/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-dark-brown/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-4 left-1/4 h-40 w-40 rounded-full bg-brown-two/10 blur-2xl" />
      <div className="absolute top-0 left-0 z-20">
        <Header />
      </div>

      <main className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4 py-8">
        <form
          onSubmit={handleSignIn}
          className="max-w-md w-full p-8 rounded-3xl shadow-2xl bg-white/95 border border-white/70 backdrop-blur"
        >
          <h2 className="text-brown-two text-3xl font-bold font-fredoka pb-2 text-center tracking-tight">
            Sign In
          </h2>

          <p className="text-center text-sm text-gray-500 font-quicksand mb-6">
            Use the store account provided by the admin.
          </p>

          <div className="flex flex-col font-quicksand text-brown-two">
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              type="email"
              leftIcon={<Mail size={18} />}
              required
              className="mb-4"
            />

            <TextField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              leftIcon={<Lock size={18} />}
              rightElement={
                <IconButton
                  label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-auto w-auto p-0 text-gray-400 hover:bg-transparent hover:text-brown-two"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              }
              required
            />

            <div className="flex flex-row gap-3 mt-8 items-center justify-center">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                loadingText="Logging in..."
                className="uppercase"
              >
                Sign In
              </Button>
            </div>

            {error && (
              <Alert variant="error" className="mt-4 text-center">
                {error}
              </Alert>
            )}
          </div>
        </form>
      </main>

      <div className="z-0">
        <BobaFooter />
      </div>
    </div>
  );
};

export default Signin;
