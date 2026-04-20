"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaUserAlt, FaLock, FaGoogle, FaGithub, FaCog } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";


const Login = () => {
  const router = useRouter();
  const { admin, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const togglePassword = () => {
    setShowPassword(!showPassword)
  };


  // Redirect if already logged in
  useEffect(() => {
    const date = new Date();
    setCurrentYear(date.getFullYear());
    if (admin) {
      router.push("/dashboard");
    }
  }, [admin]);

  if (isLoading || loading) {
    return (
      <div className="grid place-items-center min-h-screen w-full text-lg text-gray-600">
        Loading...
      </div>
    );
  }



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    await login({ email, password });
    if (admin) router.push("/dashboard");
    setLoading(false);
  };

  //bg-[url('/bgimage.webp')]
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat sm:bg-[url('https://res.cloudinary.com/djipgt6vc/image/upload/v1774335586/login-bg_myf3hh.png')] bg-[url('https://res.cloudinary.com/djipgt6vc/image/upload/v1774335568/login-bg1_tg2ma5.png')] relative"

    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />

      <div className="min-h-screen w-full relative overflow-hidden">

        {/* LOGO */}
        <Link href="https://estateai.in" className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
          <img
            src="/estateai.png"
            alt="EstateAI"
            className="w-58 sm:w-40 md:w-48 lg:w-52 h-auto"
          />
        </Link>

        {/* MAIN */}
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-screen py-20 sm:py-24 lg:py-0">
          <Toaster />

          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-16">

            {/* LEFT CARD - Full screen on mobile */}
            <div
              className="w-full min-h-[50vh] sm:min-h-0 py-0 px-6 sm:max-w-md lg:max-w-md text-white sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl sm:ml-16 lg:ml-26"
              style={{
                background: "linear-gradient(160deg, #0b2a4a 0%, #0d3561 60%, #0a2440 100%)",
                boxShadow: "0 25px 60px rgba(13, 46, 94, 0.4), 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              {/* Spacer for logo on mobile */}
              <div className="h-10 sm:hidden" />

              <h2 className="text-xs sm:text-sm text-gray-300 mb-1 tracking-widest uppercase">
                WELCOME,
              </h2>

              <h1 className="text-2xl sm:text-2xl font-black mb-5 sm:mb-7">
                Access Your<br />Secure Admin Panel
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4 my-6 sm:my-10">

                {/* Email */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 sm:py-3 bg-white/10 border border-blue-200/20">
                  <FaUserAlt className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="bg-transparent outline-none w-full text-white text-base placeholder-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 sm:py-3 bg-white/10 border border-blue-200/20">
                  <FaLock className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-transparent outline-none w-full text-white text-base placeholder-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition flex-shrink-0"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 sm:py-3 rounded-full text-base font-black uppercase hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 transition-all mt-2"
                  style={{
                    background: "linear-gradient(90deg, #1e88e5, #29b6f6)",
                    boxShadow: "0 0 24px rgba(30, 136, 229, 0.6), 0 4px 15px rgba(41, 182, 246, 0.4)",
                  }}
                >
                  {loading ? "Signing in..." : "SIGN IN"}
                </button>
              </form>

              {/* SOCIAL */}
              <div className="text-center text-gray-400 text-sm">
                Or sign up with:
              </div>

              <div className="flex justify-center gap-6 mt-4">
                <button className="w-12 h-12 sm:w-11 sm:h-11 rounded-full bg-white/10 flex items-center justify-center hover:scale-110 transition border border-white/10">
                  <FaGoogle className="text-xl" style={{ color: "#4285F4" }} />
                </button>
                <button className="w-12 h-12 sm:w-11 sm:h-11 rounded-full bg-white/10 flex items-center justify-center hover:scale-110 transition border border-white/10">
                  <FaGithub className="text-xl text-white" />
                </button>
                <button className="w-12 h-12 sm:w-11 sm:h-11 rounded-full bg-white/10 flex items-center justify-center hover:scale-110 transition border border-white/10">
                  <FaCog className="text-xl" style={{ color: "#90caf9" }} />
                </button>
              </div>

              <div className="text-center mt-5 sm:mt-6 text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link href="/register" className="text-white font-bold hover:underline">
                  Sign Up
                </Link>
              </div>

              {/* Bottom spacer on mobile */}
              <div className="h-12 sm:hidden" />
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden lg:flex flex-col items-center text-center max-w-md">
              <div className="w-56 h-56 xl:w-72 xl:h-72 rounded-full flex items-center justify-center mb-6 xl:mb-8">
                <img
                  src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335570/login-robo_y9a5vm.png"
                  className="w-48 h-48 xl:w-60 xl:h-60 object-contain"
                  alt="AI Robot"
                />
              </div>

              <p className="text-[#1a3a5c] text-base xl:text-lg max-w-sm px-4 leading-relaxed font-medium">
                Create your AI-powered real estate workspace and manage leads,
                automation, and deals smarter.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;