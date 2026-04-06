"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaUserAlt, FaLock } from "react-icons/fa";
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
    <div className="min-h-screen w-full flex  justify-center  bg-center bg-cover">
      <Toaster position="top-right" />

      <div className="relative w-full  flex flex-col items-center justify-between bg-[var(--color-primary-lighter)] dark:bg-[var(--color-secondary-darker)]  p-10 max-lg:hidden">
        <div className=" self-start">
          <div className=" relative">
            <h2 className="  font-bold text-2xl">i<span className=" text-[var(--color-secondary)]">big</span>data</h2>
            <p className=" absolute top-0  right-12 text-[8px] rounded-xl text-[var(--color-secondary)] font-normal border border-[var(--color-secondary)] px-[5px] py-[1px]">Domain</p>
          </div>
          <p className=" text-gray-400 text-sm font-light mt-1">Domain Insights, Made Easy</p>
        </div>
        <div className="text-center bor max-w-[350px]">
          {/*  <h2 className="text-4xl text-blue-200 font-bold mb-4">
              Welcome Back 
            </h2>
            <p className="text-purple-300 text-lg">
              Log in to your admin dashboard and manage everything efficiently.
            </p> */}
          <img src="bglogo.png" className=" w-full h-full" />
        </div>
        <div className=" self-start text-gray-500">
          <h2 className=" text-[var(--color-secondary)] text-2xl font-bold mb-1">Welcome Back</h2>
          <p>Log in to your admin dashboard and manage everything efficiently.</p>
        </div>
        {/*  <div className="absolute right-[-60px] top-0 bottom-0 w-[120px]  rounded-full  opacity-30"></div> */}
      </div>

      <div className=" flex flex-col justify-between  items-center w-full max-lg:bg-[url('/loginbg.png')] max-lg:bg-cover max-lg:bg-center max-lg:bg-no-repeat min-h-full bg-white dark:bg-linear-to-b dark:from-[var(--color-primary)] dark:to-[var(--color-secondary)] max-lg:text-white max-lg:bg-linear-to-b max-lg:from-[var(--color-primary)] max-lg:to-fuchsia-900 px-1  ">
        <div className=" self-start  w-full px-5 py-5">
          <div className="  lg:hidden">
            <div className=" relative">
              <h2 className="  font-bold text-2xl">i<span className=" text-[var(--color-primary-lighter)]">big</span>data</h2>
              <p className=" absolute top-0  left-[90px] text-[8px] rounded-xl text-[var(--color-primary-lighter)] font-normal border border-[var(--color-primary-lighter)] px-[5px] py-[1px]">Domain</p>
            </div>
            <p className=" text-[var(--color-primary-light)] text-sm font-light mt-1">Domain Insights, Made Easy</p>
          </div>

        </div>
        <div className="w-full  max-w-[500px] flex flex-col justify-center items-center max-lg:-mt-10 p-4 lg:p-8 py-16 rounded-lg bg-white ">
          <h3 className="text-2xl font-semibold text-[var(--color-primary)] text-center mb-6">
            Admin Login
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full  ">
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
                className={`absolute left-10 text-gray-800 text-sm transition-all duration-200 ${email
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
                className={`absolute left-10 text-gray-800 text-sm transition-all duration-200 ${password
                  ? "-top-1.5 text-[var(--color-primary)] text-md"
                  : "top-3 text-gray-800 text-base"
                  } peer-focus:-top-1.5 peer-focus:text-[var(--color-primary)] peer-focus:text-sm`}
              >
                Password
              </label>
              <button type="button" onClick={() => togglePassword()} className="text-sm cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer py-3 mt-2 text-white text-lg font-medium rounded-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-secondary-dark)] hover:from-[var(--color-primary-darker)] hover:to-[var(--color-secondary-darker)]  transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-6 flex justify-center gap-1 text-sm text-center text-gray-800">
            <p>Don't have an Account?</p>
            <Link href="/register" className=" text-[var(--color-primary)] hover:underline">
              Register
            </Link>
          </div>
        </div>
        <div className=" text-[var(--color-primary-light)] text-sm my-10">&copy;{currentYear} ibigdata, all rights reserved </div>
      </div>

    </div>
  );
};

export default Login;