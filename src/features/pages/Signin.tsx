// components/Signin.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../../auth/AuthContext";
import { Header } from "../components/Header";
import { BobaFooter } from "../components/BobaFooter";
import * as React from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

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
        navigate("/kiosk");
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

          <div className="flex justify-center mb-6">
            <p className="text-center text-sm text-gray-500 font-quicksand flex items-center gap-2">
              Don't have an account?{" "}
              <Link
                className="text-brown-two font-bold px-3 py-1 bg-cream border border-brown/30 rounded-full hover:bg-brown hover:text-white transition-colors duration-300"
                to="/signup"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <div className="flex flex-col font-quicksand text-brown-two">
            <label className="text-xs ml-2 uppercase font-semibold">
              Email
            </label>
            <div className="relative mb-4 mt-1">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-two/60" />
              <input
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-3 pl-10 rounded-2xl bg-gray-100/85 border border-transparent focus:border-brown focus:ring-2 focus:ring-brown/20 outline-none transition-all"
                type="email"
                required
              />
            </div>

            <label className="text-xs ml-2 uppercase font-semibold">
              Password
            </label>
            <div className="relative flex items-center mt-1">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-two/60" />
              <input
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="p-3 pl-10 w-full rounded-2xl bg-gray-100/85 border border-transparent focus:border-brown focus:ring-2 focus:ring-brown/20 outline-none transition-all pr-12"
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[55%] -translate-y-1/2 text-gray-400 hover:text-brown-two transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex flex-row gap-3 mt-8 items-center justify-center">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl font-bold bg-gradient-to-r from-brown-two to-dark-brown px-4 py-3 text-white duration-300 hover:scale-[1.02] active:scale-95 shadow-md uppercase text-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Logging in..." : "Sign In"}
                </span>
              </button>
            </div>

            {error && (
              <p className="text-red-600 pt-4 text-center text-sm font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-4">
                {error}
              </p>
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