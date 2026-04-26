// components/Signin.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../auth/AuthContext";
import { Header } from "./common/Header";
import { BobaFooter } from "./common/BobaFooter";
import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="bg-cream h-screen w-full overflow-hidden flex flex-col relative">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center relative z-10 pb-12">
        <form
          onSubmit={handleSignIn}
          className="max-w-md w-full p-8 rounded-2xl shadow-xl bg-white border border-gray-100"
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
            <div className="relative flex items-center">
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

            <div className="flex flex-row gap-3 mt-8 items-center justify-center">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl font-bold bg-gradient-to-r from-brown-two to-dark-brown px-4 py-3 text-white duration-300 hover:scale-[1.04] active:scale-95 shadow-md uppercase text-sm"
              >
                {loading ? "Logging in..." : "Sign In"}
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

export default Signin;