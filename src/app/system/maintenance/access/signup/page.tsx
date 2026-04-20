"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const { admin, isLoading, devlogin } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  useEffect(() => { if (admin) router.push("/dashboard"); }, [admin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await devlogin({ email, password });
    if (admin) router.push("/dashboard");
    setLoading(false);
  };

  if (isLoading) return (
    <div className="h-dvh bg-white grid place-items-center">
      <div className="size-5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .fit { font-family: 'Outfit', sans-serif; }

        @keyframes float-a {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-14px) rotate(1.5deg); }
        }
        @keyframes float-b {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes float-c {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-18px); }
        }
        .fa { animation: float-a 5s ease-in-out infinite; }
        .fb { animation: float-b 7s ease-in-out infinite; animation-delay: -2s; }
        .fc { animation: float-c 9s ease-in-out infinite; animation-delay: -4s; }

        @keyframes pulse-ring {
          0%,100% { transform: scale(1);   opacity: .15; }
          50%     { transform: scale(1.07); opacity: .07; }
        }
        .pr { animation: pulse-ring 4s ease-in-out infinite; }
        .pr2{ animation: pulse-ring 4s ease-in-out infinite; animation-delay:-2s; }

        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #f8fafc inset !important;
          -webkit-text-fill-color: #0f172a !important;
        }
      `}</style>

      <Toaster toastOptions={{
        style: {
          fontFamily: "'Outfit', sans-serif",
          fontSize: "13px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
        }
      }} />

      <div className="fit h-dvh flex overflow-hidden bg-white">

        {/* ─── LEFT PANEL ─── */}
        <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-12 overflow-hidden bg-[#0c0f1e]">

          {/* Background orbs */}
          <div className="absolute -top-32 -left-32 size-[480px] rounded-full bg-[#6366f1]/20 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-20 size-[400px] rounded-full bg-[#3b82f6]/15 blur-[80px] pointer-events-none" />
          <div className="absolute top-[40%] left-[55%] size-48 rounded-full bg-[#a78bfa]/10 blur-[60px] pointer-events-none" />

          {/* Subtle dot pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]
            bg-[radial-gradient(circle,_rgba(255,255,255,0.8)_1px,_transparent_1px)]
            bg-[size:28px_28px]" />

          {/* Top: wordmark */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#818cf8] to-[#6366f1] flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.4)]">
              <svg className="size-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">EstateAI</span>
          </div>

          {/* Center: illustration */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-8">

            {/* Concentric pulse rings */}
            <div className="relative flex items-center justify-center">
              <div className="pr absolute size-80 rounded-full border border-white/15" />
              <div className="pr2 absolute size-60 rounded-full border border-white/10" />

              {/* Central dashboard card */}
              <div className="fa relative z-10 w-56 bg-[#151929] rounded-2xl p-5 border border-white/[0.06] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="h-2 w-20 rounded-full bg-white/20 mb-1.5" />
                    <div className="h-1.5 w-14 rounded-full bg-white/10" />
                  </div>
                  <div className="size-8 rounded-lg bg-[#6366f1]/30 flex items-center justify-center">
                    <div className="size-3.5 rounded bg-[#818cf8]" />
                  </div>
                </div>

                {/* Chart bars */}
                <div className="flex items-end gap-1.5 h-12 mb-4">
                  {[55, 75, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm"
                      style={{ height: `${h}%`, background: i === 3 ? "#6366f1" : "rgba(255,255,255,0.1)" }} />
                  ))}
                </div>

                {/* Metric row */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div>
                    <div className="text-white text-sm font-bold">₹2.4L</div>
                    <div className="text-white/30 text-[9px] mt-0.5">Revenue</div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15">
                    <svg className="size-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                    <span className="text-emerald-400 text-[9px] font-semibold">+18.4%</span>
                  </div>
                </div>
              </div>

              {/* Floating badge top-right */}
              <div className="fb absolute top-4 -right-10 bg-[#151929] rounded-xl px-3 py-2.5 border border-white/[0.07] shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-[9px] font-semibold tracking-wide">LIVE</span>
                </div>
                <div className="text-white text-sm font-bold">128</div>
                <div className="text-white/30 text-[9px]">Active leads</div>
              </div>

              {/* Floating badge bottom-left */}
              <div className="fc absolute -bottom-4 -left-12 bg-[#151929] rounded-xl px-3 py-2.5 border border-white/[0.07] shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                <div className="text-[#818cf8] text-sm font-bold">99.9%</div>
                <div className="text-white/30 text-[9px] mt-0.5">Uptime SLA</div>
              </div>
            </div>

            {/* Copy */}
            <div className="text-center mt-14">
              <h1 className="text-[1.85rem] font-bold text-white leading-tight tracking-tight">
                Your real estate<br />command center
              </h1>
              <p className="text-white/35 text-sm leading-relaxed mt-3 max-w-[280px] mx-auto">
                Manage leads, automate campaigns, and close more deals from one intelligent workspace.
              </p>
            </div>
          </div>

          {/* Bottom: social proof */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              {[{ v: "10k+", l: "Leads" }, { v: "98%", l: "Retention" }, { v: "4.9★", l: "Rating" }].map(s => (
                <div key={s.l}>
                  <div className="text-white text-sm font-semibold">{s.v}</div>
                  <div className="text-white/25 text-[10px] mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="flex -space-x-2">
              {[
                { bg: "bg-violet-400", t: "A" },
                { bg: "bg-sky-400",    t: "M" },
                { bg: "bg-rose-400",   t: "S" },
              ].map((a, i) => (
                <div key={i} className={`size-7 rounded-full ${a.bg} border-2 border-[#0c0f1e] flex items-center justify-center text-white text-[9px] font-bold`}>
                  {a.t}
                </div>
              ))}
              <div className="size-7 rounded-full bg-white/10 border-2 border-[#0c0f1e] flex items-center justify-center text-white/40 text-[9px] font-semibold">
                +6
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: form ─── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white overflow-y-auto">
          <div className="w-full max-w-[360px] py-8">

            {/* Mobile wordmark */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <div className="size-8 rounded-lg bg-gradient-to-br from-[#818cf8] to-[#6366f1] flex items-center justify-center">
                <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                </svg>
              </div>
              <span className="text-[#0f172a] text-lg font-bold">EstateAI</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-[1.75rem] font-bold text-[#0f172a] tracking-tight leading-tight">
                Welcome back
              </h2>
              <p className="text-[#94a3b8] text-sm mt-1.5 font-normal">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-[#374151] text-[13px] font-medium mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@estateai.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg outline-none
                    placeholder:text-[#c7d2dc]
                    focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10
                    hover:border-[#c7d2dc]
                    transition-all duration-150"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[#374151] text-[13px] font-medium">
                    Password
                  </label>
                  <button type="button" className="text-[#6366f1] text-[12px] font-medium hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-10 text-sm text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg outline-none
                      placeholder:text-[#c7d2dc]
                      focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10
                      hover:border-[#c7d2dc]
                      transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                  >
                    {showPw ? (
                      <svg className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-1 text-sm font-semibold rounded-lg
                  bg-[#6366f1] hover:bg-[#5558ea]
                  text-white
                  shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_22px_rgba(99,102,241,0.42)]
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
                  hover:-translate-y-px active:translate-y-0 active:scale-[0.99]
                  transition-all duration-150"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <svg className="size-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign in"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#f1f5f9]" />
              <span className="text-[#cbd5e1] text-xs font-medium">or continue with</span>
              <div className="flex-1 h-px bg-[#f1f5f9]" />
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3">
              <button className="h-11 flex items-center justify-center gap-2 text-[13px] font-medium
                text-[#374151] bg-white border border-[#e2e8f0] rounded-lg
                hover:bg-[#f8fafc] hover:border-[#d1d5db]
                transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <button className="h-11 flex items-center justify-center gap-2 text-[13px] font-medium
                text-[#374151] bg-white border border-[#e2e8f0] rounded-lg
                hover:bg-[#f8fafc] hover:border-[#d1d5db]
                transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-[#94a3b8] text-[13px] mt-7">
              No account yet?{" "}
              <Link href="/register" className="text-[#6366f1] font-semibold hover:underline">
                Request access
              </Link>
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              {["Secure", "Private", "SOC 2"].map((t, i) => (
                <React.Fragment key={t}>
                  {i > 0 && <span className="size-0.5 rounded-full bg-[#e2e8f0]" />}
                  <span className="text-[#c7d2dc] text-[11px] font-medium">{t}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}