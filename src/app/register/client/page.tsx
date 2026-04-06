"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";
import { createAdmin } from "@/store/auth";
import { CreateAdminData } from "@/store/auth.interface";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getCity } from "@/store/masters/city/city";
import SingleSelect from "@/app/component/SingleSelect";

/* ─────────────────────────────────────────── */
/*  Types                                       */
/* ─────────────────────────────────────────── */
interface ErrorInterface {
  [key: string]: string;
}

interface UserData {
  Role: string;
  FirstName: string;
  Email: string;
  MobileNumber: string;
  City: string;
  Company: string;
  Password: string;
  AddressLine1: string;
  AddressLine2: string;
}

const INITIAL_DATA: UserData = {
  Role: "client_admin",
  FirstName: "",
  Email: "",
  MobileNumber: "",
  City: "",
  Company: "",
  Password: "",
  AddressLine1: "",
  AddressLine2: "",
};

/* ─────────────────────────────────────────── */
/*  Feature bullets for the left panel         */
/* ─────────────────────────────────────────── */
const FEATURES = [
  { icon: ShieldCheck, text: "Enterprise-grade security & data privacy" },
  { icon: Zap, text: "Instant access to your CRM dashboard" },
  { icon: Globe, text: "Manage customers across multiple cities" },
];

/* ─────────────────────────────────────────── */
/*  Main Page                                   */
/* ─────────────────────────────────────────── */
export default function ClientRegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [userData, setUserData] = useState<UserData>(INITIAL_DATA);
  const [errors, setErrors] = useState<ErrorInterface>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const router = useRouter();

  /* load city options */
  useEffect(() => {
    handleFieldOptions([{ key: "City", fetchFn: getCity }], setFieldOptions);
  }, []);

  /* ── handlers ── */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setUserData((p) => ({ ...p, [name]: value }));
      setErrors((p) => ({ ...p, [name]: "" }));
    },
    []
  );

  const handleSelectChange = useCallback((label: string, selected: string) => {
    setUserData((p) => ({ ...p, [label]: selected }));
    setErrors((p) => ({ ...p, [label]: "" }));
  }, []);

  /* ── validation per step ── */
  const validateStep1 = (): ErrorInterface => {
    const e: ErrorInterface = {};
    if (!userData.FirstName.trim()) e.FirstName = "Full name is required";
    if (!userData.Email.trim()) e.Email = "Email is required";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userData.Email))
      e.Email = "Invalid email format";
    if (!userData.Password.trim()) e.Password = "Password is required";
    else if (userData.Password.length < 6) e.Password = "Minimum 6 characters";
    if (!userData.MobileNumber.trim()) e.MobileNumber = "Mobile number is required";
    return e;
  };

  const validateStep2 = (): ErrorInterface => {
    const e: ErrorInterface = {};
    if (!userData.Company.trim()) e.Company = "Company name is required";
    if (!userData.AddressLine1.trim()) e.AddressLine1 = "Address line 1 is required";
    return e;
  };

  /* ── step navigation ── */
  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setErrors({});
    setStep(1);
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const payload: CreateAdminData = {
      name: userData.FirstName.trim(),
      email: userData.Email,
      password: userData.Password,
      role: userData.Role === "client_admin" ? "client_admin" : "user",
      city: userData.City,
      phone: userData.MobileNumber,
      company: userData.Company,
      AddressLine1: userData.AddressLine1,
      AddressLine2: userData.AddressLine2,
    };

    try {
      const res = await createAdmin(payload);
      if (res.success) {
        setSuccess(true);
        toast.success(res.message || "Client registered successfully!");
        setTimeout(() => router.push("/admin"), 2500);
      } else {
        toast.error(res.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────── */
  /*  Render                                      */
  /* ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <Toaster position="top-right" />

      {/* ════════════════════════════════════════
          LEFT PANEL — brand / marketing
          ════════════════════════════════════════ */}
      <aside className="relative lg:w-[46%] flex flex-col justify-between overflow-hidden px-10 py-12 max-lg:py-10 max-lg:px-6 max-lg:hidden"
        style={{ background: "linear-gradient(155deg, var(--color-secondary-darker) 0%, var(--color-secondary) 45%, var(--color-primary) 100%)" }}
      >
        {/* Decorative rings */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full border border-white/10 translate-x-1/3 translate-y-1/3" />
        <div className="absolute bottom-20 right-12 w-40 h-40 rounded-full border border-white/10" />

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16 max-lg:mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ClientPortal</span>
          </div>

          {/* Headline */}
          <div className="max-lg:hidden">
            <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-4">
              Start your journey
            </p>
            <h1 className="text-white text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Build Your<br />
              <span className="text-white/50">Business</span><br />
              Dashboard
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-sm mb-12">
              Join thousands of clients managing their real estate
              portfolio with our powerful CRM platform.
            </p>

            {/* Feature list */}
            <ul className="space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-white" />
                  </div>
                  <span className="text-white/75 text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom testimonial card */}
        <div className="relative z-10 max-lg:hidden">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              "Setting up our client account took under 5 minutes. The platform
              is incredibly intuitive and powerful."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-sm">
                R
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Sharan</p>
                <p className="text-white/50 text-xs">CEO, Creatik Ai</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          RIGHT PANEL — form
          ════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:overflow-y-auto">
        <div className="w-full max-w-[500px]">

          {/* ── Success screen ── */}
          {success ? (
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
              >
                <CheckCircle2 size={44} className="text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">
                You're all set!
              </h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                Your client account has been created. Redirecting you to the dashboard…
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-gray-400" />
                <span className="text-xs text-gray-400">Redirecting…</span>
              </div>
            </div>
          ) : (
            <>
              {/* Top label */}
              <div className="mb-8">
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  Step {step} of 2
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">
                  {step === 1 ? "Create your account" : "Company details"}
                </h2>
                <p className="text-gray-400 text-sm mt-1.5 font-light">
                  {step === 1
                    ? "Set up your login credentials and basic profile."
                    : "Tell us about your business and location."}
                </p>
              </div>

              {/* ── Step progress bar ── */}
              <div className="flex items-center gap-3 mb-8">
                {[1, 2].map((n) => (
                  <div key={n} className="flex items-center gap-3 flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0"
                      style={
                        step > n
                          ? { background: "var(--color-primary)", color: "white" }
                          : step === n
                            ? { background: "var(--color-primary)", color: "white", boxShadow: "0 0 0 4px color-mix(in srgb, var(--color-primary) 18%, transparent)" }
                            : { background: "#e5e7eb", color: "#9ca3af" }
                      }
                    >
                      {step > n ? <CheckCircle2 size={16} /> : n}
                    </div>
                    {n < 2 && (
                      <div className="flex-1 h-0.5 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: step > 1 ? "100%" : "0%",
                            background: "var(--color-primary)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

                  {/* Role — fixed to client_admin, shown as read-only badge */}
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3 border"
                    style={{
                      background: "color-mix(in srgb, var(--color-primary) 7%, transparent)",
                      borderColor: "color-mix(in srgb, var(--color-primary) 25%, transparent)",
                    }}
                  >
                    <ShieldCheck size={18} style={{ color: "var(--color-primary)" }} />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Account Role</p>
                      <p className="text-sm font-semibold text-gray-700">Client Admin</p>
                    </div>
                    <input type="hidden" name="Role" value="client_admin" />
                  </div>

                  {/* Full Name */}
                  <FloatingInput
                    icon={<User size={16} />}
                    label="Full Name"
                    name="FirstName"
                    value={userData.FirstName}
                    onChange={handleInputChange}
                    error={errors.FirstName}
                    placeholder="e.g. Rajesh Mehta"
                  />

                  {/* Email */}
                  <FloatingInput
                    icon={<Mail size={16} />}
                    label="Email Address"
                    name="Email"
                    type="email"
                    value={userData.Email}
                    onChange={handleInputChange}
                    error={errors.Email}
                    placeholder="you@company.com"
                  />

                  {/* Mobile */}
                  <FloatingInput
                    icon={<Phone size={16} />}
                    label="Mobile Number"
                    name="MobileNumber"
                    type="tel"
                    value={userData.MobileNumber}
                    onChange={handleInputChange}
                    error={errors.MobileNumber}
                    placeholder="10-digit number"
                    prefix="+91"
                  />

                  {/* Password */}
                  <FloatingInput
                    icon={<Lock size={16} />}
                    label="Password"
                    name="Password"
                    type={showPass ? "text" : "password"}
                    value={userData.Password}
                    onChange={handleInputChange}
                    error={errors.Password}
                    placeholder="Minimum 6 characters"
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />

                  {/* Password strength bar */}
                  {userData.Password && (
                    <PasswordStrength password={userData.Password} />
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-2"
                    style={{
                      background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                    }}
                  >
                    Continue to Company Details
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

                  {/* Company */}
                  <FloatingInput
                    icon={<Building2 size={16} />}
                    label="Company Name"
                    name="Company"
                    value={userData.Company}
                    onChange={handleInputChange}
                    error={errors.Company}
                    placeholder="Your real estate company"
                  />

                  {/* City dropdown using SingleSelect from admin page */}
                  <div className="flex flex-col gap-1">
                    <div
                      className="flex items-center gap-3 rounded-xl border px-4 py-0.5 bg-white focus-within:ring-2 transition-all"
                      style={{
                        borderColor: errors.City ? "#f87171" : "#e5e7eb",
                        "--tw-ring-color": "color-mix(in srgb, var(--color-primary) 20%, transparent)",
                      } as React.CSSProperties}
                    >
                      <MapPin size={16} className="text-gray-400 shrink-0" />
                      <div className="flex-1">
                        <SingleSelect
                          options={
                            Array.isArray(fieldOptions?.City) ? fieldOptions.City : []
                          }
                          label="City"
                          value={userData.City}
                          onChange={(selected: any) => handleSelectChange("City", selected)}
                        />
                      </div>
                    </div>
                    {errors.City && (
                      <p className="text-xs text-red-500 pl-1">{errors.City}</p>
                    )}
                  </div>

                  {/* Address Line 1 */}
                  <FloatingInput
                    icon={<MapPin size={16} />}
                    label="Address Line 1"
                    name="AddressLine1"
                    value={userData.AddressLine1}
                    onChange={handleInputChange}
                    error={errors.AddressLine1}
                    placeholder="Building, Street, Area"
                  />

                  {/* Address Line 2 */}
                  <FloatingInput
                    icon={<MapPin size={16} />}
                    label="Address Line 2 (optional)"
                    name="AddressLine2"
                    value={userData.AddressLine2}
                    onChange={handleInputChange}
                    placeholder="Landmark, Pincode"
                  />

                  {/* Summary pill */}
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center gap-3 mt-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm"
                      style={{ background: "var(--color-primary)" }}
                    >
                      {userData.FirstName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {userData.FirstName || "—"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{userData.Email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBack}
                      className="ml-auto text-xs font-semibold transition-colors"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Edit
                    </button>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Creating Account…
                        </>
                      ) : (
                        <>
                          Create Client Account
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Already have account */}
              <p className="text-center text-xs text-gray-400 mt-8">
                Already registered?{" "}
                <a
                  href="/admin"
                  className="font-semibold underline underline-offset-2 transition-colors"
                  style={{ color: "var(--color-primary)" }}
                >
                  Sign in here
                </a>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  FloatingInput                              */
/* ─────────────────────────────────────────── */
interface FloatingInputProps {
  icon?: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  prefix?: string;
  suffix?: React.ReactNode;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  icon,
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  prefix,
  suffix,
}) => {
  const hasError = !!error;
  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex items-center gap-3 rounded-xl border bg-white px-4 py-0.5 focus-within:ring-2 transition-all duration-200"
        style={{
          borderColor: hasError ? "#f87171" : "#e5e7eb",
          "--tw-ring-color": hasError
            ? "rgba(248,113,113,0.2)"
            : "color-mix(in srgb, var(--color-primary) 18%, transparent)",
        } as React.CSSProperties}
      >
        {icon && (
          <span className={hasError ? "text-red-400" : "text-gray-400"}>
            {icon}
          </span>
        )}
        {prefix && (
          <span
            className="text-sm font-semibold pr-1 border-r border-gray-200 mr-1"
            style={{ color: "var(--color-primary)" }}
          >
            {prefix}
          </span>
        )}
        <div className="relative flex-1 py-3">
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder=" "
            id={`field-${name}`}
            className="peer w-full bg-transparent text-sm text-gray-800 outline-none placeholder-transparent"
          />
          <label
            htmlFor={`field-${name}`}
            className="absolute left-0 text-gray-400 text-sm transition-all duration-200 pointer-events-none
              top-1/2 -translate-y-1/2
              peer-focus:top-1 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:translate-y-0
              peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:translate-y-0"
            style={{
              color:
                value || document?.activeElement?.id === `field-${name}`
                  ? "var(--color-primary)"
                  : undefined,
            }}
          >
            {label}
          </label>
        </div>
        {suffix && <span className="pl-1">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────── */
/*  PasswordStrength                           */
/* ─────────────────────────────────────────── */
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: n <= score ? colors[score - 1] : "#e5e7eb" }}
          />
        ))}
      </div>
      {score > 0 && (
        <span
          className="text-xs font-semibold"
          style={{ color: colors[score - 1] }}
        >
          {labels[score - 1]}
        </span>
      )}
    </div>
  );
};