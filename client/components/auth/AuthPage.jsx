"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "../../lib/auth/AuthContext";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function AuthPage({ defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab);
  const [step, setStep] = useState("form"); // "form" | "otp"

  // Login
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  // Register
  const [regData, setRegData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);

  // OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef(Array(6).fill(null).map(() => React.createRef()));

  const router = useRouter();
  const { signIn, signUp, verifyOTP, resendOTP, loading } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const result = await signIn({ email: loginData.email, password: loginData.password });
      if (result?.success) router.push("/dashboard/home");
    } catch { toast.error("Login failed"); }
    finally { setLoginLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) return toast.error("Passwords do not match");
    if (!termsAccepted) return toast.error("Please accept the Terms & Conditions");
    try {
      const result = await signUp({
        firstName: regData.firstName, lastName: regData.lastName,
        email: regData.email, password: regData.password,
        termsAccepted: true, termsVersion: "v1",
      });
      if (result?.success) {
        if (result.requiresOTP) { setTempUserId(result.userId); setStep("otp"); toast.success("Check your email for the OTP"); }
        else { toast.success("Account created!"); router.push("/onboarding/seller-details"); }
      } else toast.error(result?.error || "Registration failed");
    } catch { toast.error("Registration failed"); }
  };

  const handleOtpChange = (i, val) => {
    const v = val.replace(/[^0-9]/g, "");
    if (v.length > 1) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) setTimeout(() => otpRefs.current[i + 1]?.current?.focus(), 10);
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace") {
      if (!otp[i] && i > 0) setTimeout(() => otpRefs.current[i - 1]?.current?.focus(), 10);
      else { const n = [...otp]; n[i] = ""; setOtp(n); }
    }
  };
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await verifyOTP(tempUserId, otp.join(""));
      if (result?.success) { toast.success("Verified!"); router.push("/onboarding/seller-details"); }
      else toast.error(result?.error || "Invalid OTP");
    } catch { toast.error("Verification failed"); }
  };

  const input = "w-full px-4 py-3.5 bg-gray-50 dark:bg-dark-raised border border-gray-200 dark:border-dark-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all text-md";
  const label = "block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT: Image Panel ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col overflow-hidden">
        <Image
          src="/auth-bg.png"
          alt="Rafraf"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/90 via-blue-800/60 to-transparent" />

        {/* Content on image */}
        <div className="relative z-10 flex flex-col h-full p-10 justify-between">
          {/* Top: Logo */}
          <Link href="/" className="inline-flex items-center">
            <Image src="/logo-white.png" alt="Rafraf" width={130} height={36} className="h-10 w-auto" />
          </Link>

          {/* Bottom: Tagline */}
          <div className="pb-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="text-lg">🐾</span>
              <span className="text-white/80 text-md font-semibold">{t('auth.leftPanel.trustedBy')}</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
              {t('auth.leftPanel.findYour')}<br />
              <span className="text-blue-300">Rafraf</span><br />
              {t('auth.leftPanel.companion')}
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-sm">
              {t('auth.leftPanel.description')}
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ───────────────────────────────────── */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center bg-white dark:bg-dark-main p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link href="/">
              <Image src="/logo.png" alt="Rafraf" width={120} height={30} className="h-9 w-auto dark:hidden" />
              <Image src="/logo-white.png" alt="Rafraf" width={120} height={30} className="h-9 w-auto hidden dark:block" />
            </Link>
          </div>

          {step === "otp" ? (
            /* ── OTP Step ──────────────────────────────── */
            <div>
              <div className="mb-8">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{t('auth.otp.checkEmail')}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-md">
                  {t('auth.otp.sentCode')} <span className="font-bold text-gray-700 dark:text-gray-300">{regData.email}</span>
                </p>
              </div>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex gap-2.5 justify-center">
                  {otp.map((val, i) => (
                    <input
                      key={i}
                      ref={otpRefs.current[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={val}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      className="w-12 h-14 text-center text-xl font-black border-2 border-gray-200 dark:border-dark-divider rounded-xl bg-gray-50 dark:bg-dark-raised text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  ))}
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-blue-600 text-white font-black text-base hover:bg-blue-700 transition-all disabled:opacity-60 shadow-lg shadow-blue-500/25">
                  {loading ? t('auth.otp.verifying') : t('auth.otp.verifyButton')}
                </button>
                <div className="text-center space-y-2">
                  <button type="button" onClick={() => resendOTP(tempUserId).then(() => toast.success("Code resent!"))} className="text-blue-600 hover:text-blue-700 text-md font-semibold">
                    {t('auth.otp.resendCode')}
                  </button>
                  <div>
                    <button type="button" onClick={() => setStep("form")} className="text-gray-400 hover:text-gray-600 text-sm">{t('auth.otp.backToSignup')}</button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* ── Auth Forms ────────────────────────────── */
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                  {tab === "login" ? t('auth.login.title') : t('auth.register.title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-md">
                  {tab === "login"
                    ? t('auth.login.subtitle')
                    : t('auth.register.subtitle')}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex bg-gray-100 dark:bg-dark-raised rounded-xl p-1 mb-7">
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className={`flex-1 py-2.5 rounded-lg text-md font-bold transition-all ${tab === "login"
                    ? "bg-white dark:bg-dark-card text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                >
                  {t('auth.tabs.login')}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className={`flex-1 py-2.5 rounded-lg text-md font-bold transition-all ${tab === "register"
                    ? "bg-white dark:bg-dark-card text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                >
                  {t('auth.tabs.signUp')}
                </button>
              </div>

              {/* LOGIN */}
              {tab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={label}>{t('auth.login.email')}</label>
                    <input type="email" required value={loginData.email}
                      onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                      className={input} placeholder="you@example.com" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={label} style={{ marginBottom: 0 }}>{t('auth.login.password')}</label>
                      <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                        {t('auth.login.forgotPassword')}
                      </Link>
                    </div>
                    <input type="password" required value={loginData.password}
                      onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                      className={input} placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={loginLoading}
                    className="w-full py-4 mt-2 rounded-xl bg-blue-600 text-white font-black text-md hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-blue-500/25">
                    {loginLoading ? t('auth.login.signingIn') : t('auth.login.signInButton')}
                  </button>
                  <p className="text-center text-gray-500 text-md pt-1">
                    {t('auth.login.newToRafraf')}{" "}
                    <button type="button" onClick={() => setTab("register")} className="text-blue-600 font-bold hover:underline">
                      {t('auth.login.createAccount')}
                    </button>
                  </p>
                </form>
              )}

              {/* REGISTER */}
              {tab === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={label}>{t('auth.register.firstName')}</label>
                      <input type="text" required value={regData.firstName}
                        onChange={e => setRegData({ ...regData, firstName: e.target.value })}
                        className={input} placeholder="Alex" />
                    </div>
                    <div>
                      <label className={label}>{t('auth.register.lastName')}</label>
                      <input type="text" required value={regData.lastName}
                        onChange={e => setRegData({ ...regData, lastName: e.target.value })}
                        className={input} placeholder="Smith" />
                    </div>
                  </div>
                  <div>
                    <label className={label}>{t('auth.register.email')}</label>
                    <input type="email" required value={regData.email}
                      onChange={e => setRegData({ ...regData, email: e.target.value })}
                      className={input} placeholder="you@example.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={label}>{t('auth.register.password')}</label>
                      <input type="password" required minLength="6" value={regData.password}
                        onChange={e => setRegData({ ...regData, password: e.target.value })}
                        className={input} placeholder={t('auth.register.minChars')} />
                    </div>
                    <div>
                      <label className={label}>{t('auth.register.confirmPassword')}</label>
                      <input type="password" required minLength="6" value={regData.confirmPassword}
                        onChange={e => setRegData({ ...regData, confirmPassword: e.target.value })}
                        className={input} placeholder={t('auth.register.repeat')} />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <input id="terms" type="checkbox" checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-blue-600 flex-shrink-0" />
                    <label htmlFor="terms" className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t('auth.register.terms')}{" "}
                      <Link href="/terms" className="text-blue-600 font-semibold hover:underline">{t('auth.register.termsLink')}</Link>
                      {" "}{t('auth.register.and')}{" "}
                      <Link href="/privacy" className="text-blue-600 font-semibold hover:underline">{t('auth.register.privacyLink')}</Link>
                    </label>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-4 rounded-xl bg-blue-600 text-white font-black text-md hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-blue-500/25">
                    {loading ? t('auth.register.creating') : t('auth.register.createButton')}
                  </button>
                  <p className="text-center text-gray-500 text-md pt-1">
                    {t('auth.register.alreadyHaveAccount')}{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-blue-600 font-bold hover:underline">
                      {t('auth.register.signIn')}
                    </button>
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
