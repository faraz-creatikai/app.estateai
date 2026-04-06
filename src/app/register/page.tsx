"use client";

import React, { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaUserAlt, FaLock, FaPhone } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { registerRequestUser } from "@/store/requestusers/requestusers";
import PopupMenu from "../component/popups/PopupMenu";
import RegisterPopup from "../component/popups/RegisterPopup";
import { passwordRules, ValidatePassword } from "../utils/ValidatePassword";


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
      <div className="min-h-screen w-full flex justify-center bg-center bg-cover">
        <Toaster position="top-right" />

        {/* LEFT PANEL (DESKTOP ONLY) */}
        <div className="relative w-full flex flex-col items-center justify-between bg-[var(--color-primary-lighter)] dark:bg-[var(--color-secondary-darker)] p-10 max-lg:hidden">
          <div className="self-start">
            <div className=" relative">
              <h2 className="font-bold text-2xl">
                i<span className="text-[var(--color-secondary)]">big</span>data
              </h2>
              <p className=" absolute top-0  right-12 text-[8px] rounded-xl text-[var(--color-secondary)] font-normal border border-[var(--color-secondary)] px-[5px] py-[1px]">Domain</p>
            </div>
            <p className="text-gray-400 text-sm font-light mt-1">
              Domain Insights, Made Easy
            </p>
          </div>

          <div className="text-center max-w-[350px]">
            <img src="logo-register.png" className="w-full h-full" />
          </div>

          <div className="self-start text-gray-500">
            <h2 className="text-[var(--color-secondary)] text-2xl font-bold mb-1">
              Create Account
            </h2>
            <p>Register to manage everything efficiently.</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col justify-between items-center w-full max-lg:bg-[url('/loginbg.png')] max-lg:bg-cover max-lg:bg-center max-lg:bg-no-repeat min-h-full bg-white 
    max-lg:text-white dark:bg-linear-to-b dark:from-[var(--color-primary)] dark:to-[var(--color-secondary)] max-lg:text-white max-lg:bg-linear-to-b max-lg:from-[var(--color-primary)]  max-lg:bg-linear-to-b 
    max-lg:from-[var(--color-primary)] max-lg:to-fuchsia-900 px-1">

          {/* MOBILE HEADER */}
          <div className="self-start w-full px-5 py-5">
            <div className="lg:hidden">
              <div className=" relative">
                <h2 className="font-bold text-2xl">
                  i<span className="text-[var(--color-primary-lighter)]">big</span>data
                </h2>
                <p className=" absolute top-0  left-[90px] text-[8px] rounded-xl text-[var(--color-primary-lighter)] font-normal border border-[var(--color-primary-lighter)] px-[5px] py-[1px]">Domain</p>
              </div>
              <p className="text-[var(--color-primary-light)] text-sm font-light mt-1">
                Domain Insights, Made Easy
              </p>
            </div>
          </div>

          {/* FORM CARD */}
          <div className="w-full max-w-[500px] flex flex-col justify-center items-center 
      p-4 lg:p-8 py-8 rounded-lg bg-white">

            <h3 className="text-2xl font-semibold text-[var(--color-primary)] text-center ">
              Register Account
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">

              {/* FULL NAME */}
              <div className="relative mt-2">
                <FaUserAlt className="absolute left-3 top-3 text-gray-800" />
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  id="name"
                  required
                  className="peer w-full pl-10 pt-4 pb-2 border-b border-gray-300 
              text-gray-800 focus:border-purple-300 focus:outline-none bg-transparent"
                />
                <label
                  htmlFor="name"
                  className={`absolute left-10 transition-all duration-200 ${name
                    ? "-top-1.5 text-[var(--color-primary)] text-sm"
                    : "top-3 text-gray-800 text-base"
                    } peer-focus:-top-1.5 peer-focus:text-[var(--color-primary)] peer-focus:text-sm`}
                >
                  Full Name
                </label>
              </div>

              {/* EMAIL */}
              <div className="relative mt-2">
                <FaUserAlt className="absolute left-3 top-3 text-gray-800" />
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  id="email"
                  required
                  className="peer w-full pl-10 pt-4 pb-2 border-b border-gray-300 
              text-gray-800 focus:border-purple-300 focus:outline-none bg-transparent"
                />
                <label
                  htmlFor="email"
                  className={`absolute left-10 transition-all duration-200 ${email
                    ? "-top-1.5 text-[var(--color-primary)] text-sm"
                    : "top-3 text-gray-800 text-base"
                    } peer-focus:-top-1.5 peer-focus:text-[var(--color-primary)] peer-focus:text-sm`}
                >
                  Email Address
                </label>
              </div>

              {/* PASSWORD */}
              <div className="relative mt-4">
                <FaLock className="absolute left-3 top-3 text-gray-800" />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  className="peer w-full pl-10 pt-4 pb-2 border-b border-gray-300 
              text-gray-800 focus:border-purple-300 focus:outline-none bg-transparent"
                />
                <label
                  htmlFor="password"
                  className={`absolute left-10 transition-all duration-200 ${password
                    ? "-top-1.5 text-[var(--color-primary)] text-sm"
                    : "top-3 text-gray-800 text-base"
                    } peer-focus:-top-1.5 peer-focus:text-[var(--color-primary)] peer-focus:text-sm`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* PASSWORD RULES */}
              <div className="flex flex-col gap-1 text-sm font-extralight">
                {passwordRules.map((rule, idx) => {
                  const passed = rule.test.test(password);
                  return (
                    passwordError === rule.message && (
                      <p key={idx} className={passed ? "text-green-500" : "text-red-500"}>
                        {rule.message}
                      </p>
                    )
                  );
                })}
              </div>

              {/* PHONE */}
              <div className="relative ">
                <FaPhone className="absolute left-3 top-3 text-gray-800 rotate-[100deg]" />
                <input
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    setPhone(value);
                    setPhoneError(validatePhone(value));
                  }}
                  value={phone}
                  type="text"
                  id="phone"
                  className="peer w-full pl-10 pt-4 pb-2 border-b border-gray-300 
              text-gray-800 focus:border-purple-300 focus:outline-none bg-transparent"
                />
                <label
                  htmlFor="phone"
                  className={`absolute left-10 transition-all duration-200 ${phone
                    ? "-top-1.5 text-[var(--color-primary)] text-sm"
                    : "top-3 text-gray-800 text-base"
                    } peer-focus:-top-1.5 peer-focus:text-[var(--color-primary)] peer-focus:text-sm`}
                >
                  Phone Number
                </label>
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type={loading ? "button" : "submit"}
                disabled={loading}
                className="w-full py-3 mt-2 text-white text-lg font-medium rounded-full 
            bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-darker)]
            hover:from-[var(--color-primary-dark)] hover:to-[var(--color-secondary-darker)]
            transition disabled:opacity-60"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            {/* FOOTER LINK */}
            <div className="mt-6 flex justify-center gap-1 text-sm text-gray-800">
              <p>Already have an account?</p>
              <Link href="/admin" className="text-[var(--color-primary)] hover:underline">
                Login
              </Link>
            </div>
          </div>

          <div className="text-[var(--color-primary-light)] text-sm my-5">
            &copy;{currentYear} ibigdata, all rights reserved
          </div>
        </div>
      </div>

    </>
  );
};

export default Register;