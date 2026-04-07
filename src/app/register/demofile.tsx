"use client";

import Link from "next/link";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FaUserAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
  FaCog,
} from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast.success("Account created 🚀");
      setLoading(false);
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('https://res.cloudinary.com/djipgt6vc/image/upload/v1774335586/login-bg_myf3hh.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />

      <div className="min-h-screen w-full relative overflow-hidden">

        {/* LOGO */}
        <Link href="/" className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
          <img 
            src="/assets/estateai.png" 
            alt="EstateAI"
            className="w-32 sm:w-40 md:w-48 lg:w-52 h-auto"
          />
        </Link>

        {/* MAIN */}
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-screen py-20 sm:py-24 lg:py-0">
          <Toaster />

          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-16">

            {/* LEFT CARD */}
            <div
              className="w-full max-w-sm sm:max-w-md lg:max-w-md text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl sm:ml-16 lg:ml-26"
              style={{
                background:
                  "linear-gradient(160deg, #0b2a4a 0%, #0d3561 60%, #0a2440 100%)",
                boxShadow:
                  "0 25px 60px rgba(13, 46, 94, 0.4), 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              <h2 className="text-xs sm:text-sm text-gray-300 mb-1 tracking-widest uppercase">
                CREATE YOUR ACCOUNT
              </h2>

              <h1 className="text-lg sm:text-xl font-black mb-5 sm:mb-7">
                Join EstateAI Platform
              </h1>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

                {/* Name */}
                <div className="flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-blue-200/20">
                  <FaUserAlt className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-blue-200/20">
                  <FaUserAlt className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-blue-200/20">
                  <FaLock className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-400"
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

                {/* Confirm Password */}
                <div className="flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-blue-200/20">
                  <FaLock className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-black uppercase hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 transition-all"
                  style={{
                    background: "linear-gradient(90deg, #1e88e5, #29b6f6)",
                    boxShadow: "0 0 24px rgba(30, 136, 229, 0.6), 0 4px 15px rgba(41, 182, 246, 0.4)",
                  }}
                >
                  {loading ? "Creating..." : "CREATE ACCOUNT"}
                </button>
              </form>

              {/* SOCIAL */}
              <div className="text-center mt-4 sm:mt-6 text-gray-400 text-xs sm:text-sm">
                Or sign up with:
              </div>

              <div className="flex justify-center gap-4 sm:gap-6 mt-3 sm:mt-4">
                <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 flex items-center justify-center hover:scale-110 transition border border-white/10">
                  <FaGoogle className="text-lg sm:text-xl" style={{ color: "#4285F4" }} />
                </button>
                <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 flex items-center justify-center hover:scale-110 transition border border-white/10">
                  <FaGithub className="text-lg sm:text-xl text-white" />
                </button>
                <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 flex items-center justify-center hover:scale-110 transition border border-white/10">
                  <FaCog className="text-lg sm:text-xl" style={{ color: "#90caf9" }} />
                </button>
              </div>

              <div className="text-center mt-4 sm:mt-6 text-gray-400 text-xs sm:text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-white font-bold hover:underline">
                  Sign In
                </Link>
              </div>
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

export default Register;