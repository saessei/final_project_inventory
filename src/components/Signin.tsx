import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { Header } from "./common/Header";
import { BobaFooter } from "./common/BobaFooter";
import * as React from "react";

export const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { session, signInUser } = UserAuth()!;
  const navigate = useNavigate();
  console.log(session);
  console.log(email, password);

  const handleSignIn = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await signInUser(email, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        if (result.error?.toLowerCase().includes("invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (result.error?.toLowerCase().includes("email not confirmed")) {
          setError("Please confirm your email before signing in.");
        } else {
          setError(result.error || "An error occurred.");
        }
      }
    } catch (error) {
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
            <label className="text-xs ml-2 uppercase font-semibold">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="p-3 mt-1 mb-4 rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all"
              type="email"
            />

            <label className="text-xs ml-2 uppercase font-semibold">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="p-3 mt-1 rounded-2xl bg-gray-100 border border-transparent focus:border-brown outline-none transition-all"
              type="password"
            />

            <div className="flex flex-row gap-3 mt-8 items-center justify-center">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl font-bold bg-gradient-to-r from-brown-two to-dark-brown px-4 py-3 text-white duration-300 hover:scale-[1.04] active:scale-95 shadow-md uppercase text-sm"
              >
                {loading ? "Logging in..." : "Sign In"}
              </button>

              <button
                type="button"
                className="flex-1 rounded-2xl font-bold border border-gray-200 px-4 py-3 text-gray-600 bg-white duration-300 hover:bg-gray-200 hover:scale-[1.04] active:scale-95 flex items-center justify-center gap-2 shadow-sm uppercase text-xs"
              >
                Continue With
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="w-5 h-5">
                  <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.3H272v95.4h146.9c-6.4 34.8-25.8 64.3-55 84.2v69.9h88.7c52.1-48 82-118.8 82-199.2z"/>
                  <path fill="#34A853" d="M272 544.3c74.7 0 137.4-24.7 183-66.9l-88.7-69.9c-24.6 16.5-56.5 26.2-94.3 26.2-72.5 0-134-48.9-155.9-114.9H23.8v72.1C69.6 487.6 165.2 544.3 272 544.3z"/>
                  <path fill="#FBBC05" d="M116.1 327.8c-10.5-31.5-10.5-65.5 0-97l-92.3-71.5C7.4 185.5 0 231.5 0 278.4s7.4 92.9 23.8 135.1l92.3-71.5z"/>
                  <path fill="#EA4335" d="M272 107.7c39.5 0 75 13.6 102.8 40.3l77.1-77.1C409.3 24.7 346.6 0 272 0 165.2 0 69.6 56.6 23.8 140.9l92.3 71.5C138 156.5 199.5 107.7 272 107.7z"/>
                </svg>
              </button>
            </div>

            {error && (
              <p className="text-red-500 pt-4 text-center text-sm font-bold animate-pulse">{error}</p>
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