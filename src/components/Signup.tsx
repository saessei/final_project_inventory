// components/Signup.tsx
import { useState } from "react";
import { Header } from "./common/Header";
import { BobaFooter } from "./common/BobaFooter";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../auth/AuthContext";
import * as React from "react";
import "../index.css";
import { Eye, EyeOff } from "lucide-react";

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
        navigate("/signin");
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
    <div className="bg-cream h-screen w-full overflow-hidden flex flex-col relative">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-4 -mt-12">
        <form
          onSubmit={handleSignUp}
          className="max-w-md w-full p-8 rounded-2xl shadow-xl bg-white border border-gray-100"
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
            <label className="text-xs uppercase ml-2 font-semibold">
              Full Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="p-3 mt-1 mb-4 rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all"
              type="text"
              required
            />
            
            <label className="text-xs ml-2 uppercase font-semibold">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="p-3 mt-1 mb-4 rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all"
              type="email"
              required
            />

            <label className="text-xs ml-2 uppercase font-semibold">
              Password
            </label>
            <div className="relative flex items-center mb-4">
              <input
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="p-3 mt-1 w-full rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all pr-12"
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

            <label className="text-xs ml-2 uppercase font-semibold">
              Admin PIN (Optional - for admin access)
            </label>
            <div className="relative flex items-center mb-4">
              <input
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter admin PIN (4+ digits)"
                className="p-3 mt-1 w-full rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all pr-12"
                type={showAdminPin ? "text" : "password"}
              />
              <button
                type="button"
                onClick={() => setShowAdminPin(!showAdminPin)}
                className="absolute right-4 top-[55%] -translate-y-1/2 text-gray-400 hover:text-brown-two transition-colors"
              >
                {showAdminPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <label className="text-xs ml-2 uppercase font-semibold">
              Confirm Admin PIN
            </label>
            <div className="relative flex items-center">
              <input
                onChange={(e) => setConfirmAdminPin(e.target.value)}
                placeholder="Confirm admin PIN"
                className="p-3 mt-1 w-full rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all pr-12"
                type={showConfirmAdminPin ? "text" : "password"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmAdminPin(!showConfirmAdminPin)}
                className="absolute right-4 top-[55%] -translate-y-1/2 text-gray-400 hover:text-brown-two transition-colors"
              >
                {showConfirmAdminPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex flex-row gap-3 mt-8 items-center justify-center">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl font-bold bg-gradient-to-r from-brown-two to-dark-brown px-4 py-3 text-white duration-300 hover:scale-[1.04] active:scale-95 shadow-md uppercase text-sm"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 pt-4 text-center text-sm font-bold animate-pulse">
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