"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaUserAlt, FaLock, FaGoogle, FaGithub, FaCog } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { sidebarLogoPath } from "../data/PlatformData";
import BrandLogo from "../component/labels/BrandLogo";

const Login = () => {
  const router = useRouter();
  const { admin, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const togglePassword = () => {
    setShowPassword(!showPassword);
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

  return (
    <div className="min-h-screen w-full flex justify-center bg-center bg-cover">
      <Toaster position="top-right" />

      {/* LEFT PANEL (DESKTOP ONLY) */}
      <div className="relative w-full flex flex-col items-center justify-between bg-[var(--color-primary-lighter)] dark:bg-[var(--color-secondary-darker)] p-10 max-lg:hidden">
        <div className="self-start">
          <div className="relative">
            {/* 👇 DYNAMIC BRAND LOGO (DESKTOP) */}
            <BrandLogo
              variant="text"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>

        <div className="text-center max-w-[350px]">
          <img src="bglogo.png" className="w-full h-full" alt="Login Illustration" />
        </div>

        <div className="self-start text-gray-500">
          <h2 className="text-[var(--color-secondary)] text-2xl font-bold mb-1">
            Welcome Back
          </h2>
          <p>Log in to your admin dashboard and manage everything efficiently.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col lg:justify-between items-center w-full  max-lg:bg-cover max-lg:bg-center max-lg:bg-no-repeat min-h-full bg-white dark:bg-linear-to-b dark:from-[var(--color-primary)] dark:to-[var(--color-secondary)] px-1">
        {/* MOBILE HEADER */}
        <div className="self-start w-full px-5 py-5">
          <div className="lg:hidden">
            <div className="relative">
              {/* 👇 DYNAMIC BRAND LOGO (MOBILE) */}
              <BrandLogo
                variant="text"
                className="h-9 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="w-full max-w-[500px] max-lg:mt-20 flex flex-col justify-center items-center max-lg:-mt-10 p-4 lg:p-8 py-16 rounded-lg bg-white">
          <h3 className="text-2xl font-semibold text-[var(--color-primary)] text-center mb-6">
            Admin Login
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            <div className="relative mt-2">
              <FaUserAlt className="absolute left-3 top-3 text-gray-800" />
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                id="email"
                required
                className="peer w-full pl-10 pt-4 pb-2 border-b border-gray-300 text-gray-800 focus:border-purple-300 focus:outline-none transition bg-transparent"
              />
              <label
                htmlFor="email"
                className={`absolute left-10 text-gray-800 text-sm transition-all duration-200 ${
                  email
                    ? "-top-1.5 text-[var(--color-primary)] text-sm"
                    : "top-3 text-gray-800 text-base"
                } peer-focus:-top-1.5 peer-focus:text-[var(--color-primary)] peer-focus:text-sm`}
              >
                Email Address
              </label>
            </div>

            <div className="relative mt-4">
              <FaLock className="absolute left-3 top-3 text-gray-800" />
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                id="password"
                required
                className="peer w-full pl-10 pt-4 pb-2 border-b border-gray-300 text-gray-800 focus:border-purple-300 focus:outline-none transition bg-transparent"
              />
              <label
                htmlFor="password"
                className={`absolute left-10 text-gray-800 text-sm transition-all duration-200 ${
                  password
                    ? "-top-1.5 text-[var(--color-primary)] text-md"
                    : "top-3 text-gray-800 text-base"
                } peer-focus:-top-1.5 peer-focus:text-[var(--color-primary)] peer-focus:text-sm`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => togglePassword()}
                className="text-sm cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer py-3 mt-2 text-white text-lg font-medium rounded-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-secondary-dark)] hover:from-[var(--color-primary-darker)] hover:to-[var(--color-secondary-darker)] transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 flex justify-center gap-1 text-sm text-center text-gray-800">
            <p>Don't have an Account?</p>
            <Link href="/register" className="text-[var(--color-primary)] hover:underline">
              Register
            </Link>
          </div>
        </div>

        <div className="text-[var(--color-primary-light)] text-sm my-10 max-lg:absolute max-lg:bottom-0 max-lg:left-1/2 max-lg:-translate-x-1/2">
          &copy;{currentYear} all rights reserved
        </div>
      </div>
    </div>
  );
};

export default Login;