// components/Signup.tsx
import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { BobaFooter } from "@/components/ui/BobaFooter";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "@/components/auth/AuthContext";
import * as React from "react";
import "../index.css";
import { Eye, EyeOff, Mail, Lock, UserRound, KeyRound } from "lucide-react";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);

  const { signUpNewUser } = UserAuth()!;
  const navigate = useNavigate();

  const handleSignUp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    if (!adminPin) {
      setError("Admin PIN is required.");
      setLoading(false);
      return;
    }

    if (adminPin.length < 4) {
      setError("Admin PIN must be at least 4 digits.");
      setLoading(false);
      return;
    }

    try {
      const result = await signUpNewUser(
        email,
        password,
        name,
        adminPin || undefined,
      );

      if (result.success) {
        navigate("/role-select", { replace: true });
      } else {
        setError(String(result.error || "An error occurred."));
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen w-full overflow-hidden flex flex-col relative">
      <div className="pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full bg-brown/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-16 h-72 w-72 rounded-full bg-dark-brown/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 right-1/4 h-44 w-44 rounded-full bg-brown-two/10 blur-2xl" />
      <div className="absolute top-0 left-0 z-20">
        <Header />
      </div>
      <main className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4 py-8">
        <form
          onSubmit={handleSignUp}
          className="max-w-md w-full p-8 rounded-3xl shadow-2xl bg-white/95 border border-white/70 backdrop-blur"
        >
          <h2 className="text-brown-two text-3xl font-bold font-fredoka pb-2 text-center tracking-tight">
            Get Started
          </h2>

          <div className="flex justify-center mb-6">
            <p className="text-center text-sm text-gray-500 font-quicksand flex items-center gap-2">
              Already have an account?{" "}
              <Link
                className="text-brown-two font-bold px-3 py-1 bg-cream border border-brown/30 rounded-full hover:bg-brown hover:text-white transition-colors duration-300"
                to="/signin"
              >
                Log In
              </Link>
            </p>
          </div>

          <div className="flex flex-col font-quicksand text-brown-two">
            <section className="space-y-4">
              <TextField
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Boba Lover"
                type="text"
                leftIcon={<UserRound size={18} />}
                required
              />

              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                type="email"
                leftIcon={<Mail size={18} />}
                required
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
                className="mb-4"
              />
              <TextField
                label="Admin PIN"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter admin PIN"
                type={showAdminPin ? "text" : "password"}
                leftIcon={<KeyRound size={18} />}
                required
                rightElement={
                  <IconButton
                    label={showAdminPin ? "Hide admin PIN" : "Show admin PIN"}
                    onClick={() => setShowAdminPin(!showAdminPin)}
                    className="h-auto w-auto p-0 text-gray-400 hover:bg-transparent hover:text-brown-two"
                  >
                    {showAdminPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                }
              />
            </section>

            <div className="flex flex-row gap-3 mt-8 items-center justify-center">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                loadingText="Creating..."
                className="uppercase"
              >
                Create Account
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

export default Signup;
