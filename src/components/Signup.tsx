import { useState } from "react";
import { Header } from "./common/Header";
import { BobaFooter } from "./common/BobaFooter";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../auth/AuthContext";
import * as React from "react";
import "../index.css";
import { Eye, EyeOff, Store, Coffee } from "lucide-react";

type Role = "cashier" | "barista";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("cashier");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { session, signUpNewUser } = UserAuth()!;
  const navigate = useNavigate();
  console.log(session);
  console.log(email, name, password);

  const handleSignUp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUpNewUser(email, password, name, role);

      if (result.success) {
        navigate(role === "barista" ? "/queued-orders" : "/kiosk");
      } else {
        setError(String(result.error || "An error occurred."));
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // const isBarista = role === "barista";

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
          <label className="text-xs uppercase ml-2 font-semibold font-quicksand text-brown-two">I want to sign up as...</label>

          <div className="mt-2 mb-4 rounded-full border border-slate-300 bg-[#f3efe8] p-1">
            <div className="grid grid-cols-2 gap-1">
              {/* Cashier */}
              <button
                type="button"
                onClick={() => setRole("cashier")}
                className={`rounded-full px-4 py-2 font-fredoka text-md uppercase transition-colors flex items-center justify-center gap-2
        ${role === "cashier" ? "bg-brown-two text-white shadow-sm" : "bg-transparent text-brown-two"}
      `}
                aria-pressed={role === "cashier"}
              >
                <Store size={20} />
                Cashier
              </button>

              {/* Barista */}
              <button
                type="button"
                onClick={() => setRole("barista")}
                className={`rounded-full px-4 py-2 font-fredoka text-md uppercase transition-colors flex items-center justify-center gap-2
        ${role === "barista" ? "bg-brown-two text-white shadow-sm" : "bg-transparent text-brown-two"}
      `}
                aria-pressed={role === "barista"}
              >
                <Coffee size={20} />
                Barista
              </button>
            </div>
          </div>

          <div className="flex flex-col font-quicksand text-brown-two ">
            <label className="text-xs uppercase ml-2 font-semibold">
              Full Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="p-3 mt-1 mb-4 rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all"
              type="text"
            />
            <label className="text-xs ml-2 uppercase font-semibold">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="p-3 mt-1 mb-4 rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all"
              type="email"
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
