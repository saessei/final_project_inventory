// components/Signup.tsx
import { useState } from "react";
import { Header } from "./common/Header";
import { BobaFooter } from "./common/BobaFooter";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../auth/AuthContext";
import * as React from "react";
import "../index.css";
import { Eye, EyeOff, Mail, Lock, UserRound, KeyRound, Loader2 } from "lucide-react";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [confirmAdminPin, setConfirmAdminPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showConfirmAdminPin, setShowConfirmAdminPin] = useState(false);

  const { signUpNewUser } = UserAuth()!;
  const navigate = useNavigate();

  const handleSignUp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    if (adminPin !== confirmAdminPin) {
      setError("Admin PINs do not match.");
      setLoading(false);
      return;
    }

    if (adminPin && adminPin.length < 4) {
      setError("Admin PIN must be at least 4 digits.");
      setLoading(false);
      return;
    }

    try {
      const result = await signUpNewUser(email, password, name, adminPin || undefined);

      if (result.success) {
        navigate("/kiosk");
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
          className="max-w-4xl w-full p-6 md:p-8 rounded-3xl shadow-2xl bg-white/95 border border-white/70 backdrop-blur"
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
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 font-quicksand text-brown-two items-start">
            <section className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase ml-2 font-semibold">
                  Full Name
                </label>
                <div className="relative">
                  <UserRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-two/60" />
                  <input
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full p-3 pl-10 rounded-2xl bg-gray-100/85 border border-transparent focus:border-brown focus:ring-2 focus:ring-brown/20 outline-none transition-all"
                    type="text"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs ml-2 uppercase font-semibold">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-two/60" />
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full p-3 pl-10 rounded-2xl bg-gray-100/85 border border-transparent focus:border-brown focus:ring-2 focus:ring-brown/20 outline-none transition-all"
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs ml-2 uppercase font-semibold">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-two/60" />
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="p-3 w-full pl-10 rounded-2xl bg-gray-100/85 border border-transparent focus:border-brown focus:ring-2 focus:ring-brown/20 outline-none transition-all pr-12"
                     type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brown-two transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs ml-2 uppercase font-semibold">
                  Admin PIN
                </label>
                <div className="relative flex items-center">
                  <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-two/60" />
                  <input
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter admin PIN (4+ digits)"
                    className="p-3 w-full pl-10 rounded-2xl bg-gray-100/85 border border-transparent focus:border-brown focus:ring-2 focus:ring-brown/20 outline-none transition-all pr-12"
                    type={showAdminPin ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPin(!showAdminPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brown-two transition-colors"
                  >
                    {showAdminPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs ml-2 uppercase font-semibold">
                  Confirm Admin PIN
                </label>
                <div className="relative flex items-center">
                  <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-two/60" />
                  <input
                    onChange={(e) => setConfirmAdminPin(e.target.value)}
                    placeholder="Confirm admin PIN"
                    className="p-3 w-full pl-10 rounded-2xl bg-gray-100/85 border border-transparent focus:border-brown focus:ring-2 focus:ring-brown/20 outline-none transition-all pr-12"
                    type={showConfirmAdminPin ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmAdminPin(!showConfirmAdminPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brown-two transition-colors"
                  >
                    {showConfirmAdminPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-text-gray bg-cream/70 border border-brown/15 rounded-xl px-3 py-2 mt-2">
                Add an admin PIN only if you need Menu Manager access.
              </p>
            </section>

            <div className="md:col-span-2 flex flex-row gap-3 mt-2 items-center justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:max-w-md rounded-2xl font-bold bg-gradient-to-r from-brown-two to-dark-brown px-4 py-3 text-white duration-300 hover:scale-[1.02] active:scale-95 shadow-md uppercase text-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Creating..." : "Create Account"}
                </span>
              </button>
            </div>
            
            {error && (
              <p className="md:col-span-2 text-red-600 text-center text-sm font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-2">
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

export default Signup;