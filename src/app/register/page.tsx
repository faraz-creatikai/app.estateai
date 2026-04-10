"use client";

import React, { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaUserAlt, FaLock, FaPhone, FaCog, FaGithub, FaGoogle } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { registerRequestUser } from "@/store/requestusers/requestusers";
import PopupMenu from "../component/popups/PopupMenu";
import RegisterPopup from "../component/popups/RegisterPopup";
import { passwordRules, ValidatePassword } from "../utils/ValidatePassword";
import { IoMdMail } from "react-icons/io";


type PasswordValidationResult = {
  messages: JSX.Element[]; // for inline display
  errorString: string | null; // for toast
};

const Register = () => {
  const router = useRouter();
  const { admin, isLoading, login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const togglePassword = () => {
    setShowPassword(!showPassword)
  };
  const [currentYear, setCurrentYear] = useState<number | null>(null);


  useEffect(() => {
    const date = new Date();
    setCurrentYear(date.getFullYear());
  }, [])

  /*   if (isLoading || loading) {
      return (
        <div className="grid place-items-center min-h-screen w-full text-lg text-gray-600">
          Loading...
        </div>
      );
    } */


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const PhoneValidationError = validatePhone(phone);
    const PasswordValidationError = ValidatePassword(password);
    // const PasswordValidationError = validatePassword(password)

    if (PasswordValidationError) {
      setPasswordError(PasswordValidationError);
      toast.error(PasswordValidationError);
      return;
    }
    if (PhoneValidationError) {
      setPhoneError(PhoneValidationError);
      toast.error(PhoneValidationError);
      return;
    }
    // if (PasswordValidationError) {
    //   // setPasswordError(PasswordValidationError)
    //   toast.error(PasswordValidationError);
    //   return;
    // }
    setLoading(true);

    const res = await registerRequestUser({ name, email, password, phone });
    if (res) {
      //router.push("/dashboard")
      setIsPopupOpen(true);
      setLoading(false);
      return;
    };
    setLoading(false);
    setIsPopupOpen(false);
    toast.error("Failed To Register")
  };

  //for phone number validation
  const validatePhone = (phone: string) => {
    if (!phone) return "Phone number is required";
    if (!/^(?:\+91|0)?[6-9]\d{9}$/.test(phone)) {
      return "Enter a valid Indian phone number";
    }
    return "";
  };
  // const validatePassword = (password: string) => {
  //   // Define rules
  //   const rules = [
  //     {
  //       test: /.{6,}/,
  //       message: "Password must be at least 6 characters long",
  //     },
  //     {
  //       test: /[A-Z]/,
  //       message: "Password must include at least one uppercase letter",
  //     },
  //     {
  //       test: /\d/,
  //       message: "Password must include at least one number",
  //     },
  //     {
  //       test: /[!@#$%^&*]/,
  //       message: "Password must include at least one special character",
  //     },
  //   ];

  //   // Map over rules and return <p> with conditional class
  //   return rules.map((rule, idx) => {
  //     const passed = rule.test.test(password);
  //     return (
  //       <p key={idx} className={passed ? "text-green-600" : "text-red-600"}>
  //         {rule.message}
  //       </p>
  //     );
  //   });
  // };





  return (
    <>
      {isPopupOpen && <RegisterPopup onClose={() => {
        setIsPopupOpen(false)
        setEmail("")
        setPassword("")
        setName("")
        setPhone("")
        setPasswordError("")
      }} />
      }
      <div
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative sm:bg-[url('https://res.cloudinary.com/djipgt6vc/image/upload/v1774335586/login-bg_myf3hh.png')] bg-[url('https://res.cloudinary.com/djipgt6vc/image/upload/v1774335568/login-bg1_tg2ma5.png')]"

      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />

        <Toaster position="top-right" />

        <Link href="https://estateai.in" className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
          <img
            src="/estateai.png"
            alt="EstateAI"
            className="w-58 sm:w-40 md:w-48 lg:w-52 h-auto"
          />
        </Link>
        <div className="flex items-center justify-center px-0  sm:px-6 lg:px-8 min-h-screen py-10 sm:py-24 lg:py-0">
          <div className=" w-full sm:max-w-5xl px-3  sm:max-w-5xl flex flex-col lg:flex-row items-center justify-center  lg:justify-between gap-0  lg:gap-12">
            {/* LOGO */}



            {/* FORM CARD */}
            <div
              className="max-sm:min-w-full w-full  min-h-[70vh] max-sm:mt-20 sm:min-h-0 max-w-sm sm:max-w-md lg:max-w-md text-white py-6 px-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl sm:ml-16 lg:ml-26 flex flex-col justify-center"
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

              <h1 className="text-2xl sm:text-3xl font-black mb-5 sm:mb-7">
                Join EstateAI Platform
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">

                {/* FULL NAME */}
                <div className="flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-blue-200/20">
                  <FaUserAlt className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    type="text"
                    id="name"
                    placeholder="Full Name"
                    required
                    className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-400"
                  />

                </div>

                {/* EMAIL */}
                <div className="flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-blue-200/20">
                  <IoMdMail className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    id="email"
                    required
                    placeholder="Email"
                    className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-400"
                  />
                </div>

                {/* PASSWORD */}
                <div className="flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-blue-200/20">
                  <FaLock className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    placeholder="Password"
                    className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-400"
                  />

                  <button
                    type="button"
                    onClick={togglePassword}
                    className="text-gray-400 hover:text-white transition flex-shrink-0"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* PASSWORD RULES */}

                {passwordRules.map((rule, idx) => {
                  const passed = rule.test.test(password);
                  return (
                    passwordError === rule.message && (
                      <div className="flex flex-col gap-1 text-sm font-extralight">
                        <p key={idx} className={passed ? "text-green-500" : "text-red-500"}>
                          {rule.message}
                        </p>
                      </div>
                    )
                  );
                })}


                {/* PHONE */}
                <div className="flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-blue-200/20">
                  <FaPhone className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      setPhone(value);
                      setPhoneError(validatePhone(value));
                    }}
                    value={phone}
                    type="text"
                    id="phone"
                    placeholder="Mobile Number"
                    className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-400"
                  />


                </div>
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}

                {/* SUBMIT */}
                <button
                  type={loading ? "button" : "submit"}
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-black uppercase hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 transition-all"
                  style={{
                    background: "linear-gradient(90deg, #1e88e5, #29b6f6)",
                    boxShadow: "0 0 24px rgba(30, 136, 229, 0.6), 0 4px 15px rgba(41, 182, 246, 0.4)",
                  }}
                >
                  {loading ? "Registering..." : "Register"}
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

              {/* FOOTER LINK */}
              <div className="text-center mt-4 sm:mt-6 text-gray-400 text-xs sm:text-sm">
                Already have an account?{" "}
                <Link href="/admin" className="text-white font-bold hover:underline">
                  Login
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

            <div className="text-[#0a2440] text-sm my-5 sm:hidden">
              &copy;{currentYear} ibigdata, all rights reserved
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Register;