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
  const [step, setStep] = useState("form");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  const [regData, setRegData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);

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

  const input =
    "mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-base text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#2563EB] dark:border-dark-divider dark:bg-dark-raised dark:text-white";
  const label = "text-sm font-semibold text-[#0F172A] dark:text-gray-200";
  const submitBtn =
    "flex h-12 w-full items-center justify-center rounded-xl bg-[#2563EB] text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60";
  const tabClass = (active) =>
    `flex-1 py-2.5 text-sm font-semibold transition ${
      active
        ? "bg-[#2563EB] text-white"
        : "text-[#64748B] hover:text-[#0F172A] dark:text-gray-400 dark:hover:text-white"
    }`;

  return (
    <div className="marketing-ui flex min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <div className="relative hidden overflow-hidden lg:flex lg:w-[45%] xl:w-1/2">
        <Image
          src="/auth-bg.png"
          alt="Rafraf"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[#0F172A]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-[#0F172A]/20" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 py-10">
          <Link href="/" className="inline-flex items-center">
            <Image src="/logo-white.png" alt="Rafraf" width={150} height={40} className="h-10 w-auto" />
          </Link>

          <div className="max-w-lg pb-2">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#93C5FD]">
              {t("auth.leftPanel.trustedBy")}
            </p>
            <h2 className="font-display text-[2.6rem] font-bold leading-[1.1] text-white xl:text-[3.2rem]">
              {t("auth.leftPanel.findYour")}
              <br />
              Rafraf
              <br />
              {t("auth.leftPanel.companion")}
            </h2>
            <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-white/70">
              {t("auth.leftPanel.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center overflow-y-auto px-4 py-10 sm:px-8 lg:w-[55%] xl:w-1/2">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/">
              <Image src="/logo.png" alt="Rafraf" width={140} height={36} className="h-9 w-auto dark:hidden" />
              <Image src="/logo-white.png" alt="Rafraf" width={140} height={36} className="hidden h-9 w-auto dark:block" />
            </Link>
          </div>

          {step === "otp" ? (
            <div>
              <h1 className="font-display text-[1.85rem] font-bold leading-tight md:text-[2.2rem]">
                {t("auth.otp.checkEmail")}
              </h1>
              <p className="mt-2 text-[15px] text-[#64748B] dark:text-gray-400">
                {t("auth.otp.sentCode")}{" "}
                <span className="font-semibold text-[#0F172A] dark:text-white">{regData.email}</span>
              </p>
              <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
                <div className="flex justify-center gap-2">
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
                      className="h-12 w-11 rounded-xl border border-[#E2E8F0] bg-white text-center text-lg font-bold text-[#0F172A] outline-none focus:border-[#2563EB] dark:border-dark-divider dark:bg-dark-raised dark:text-white sm:h-14 sm:w-12"
                    />
                  ))}
                </div>
                <button type="submit" disabled={loading} className={submitBtn}>
                  {loading ? t("auth.otp.verifying") : t("auth.otp.verifyButton")}
                </button>
                <div className="space-y-2 text-center">
                  <button
                    type="button"
                    onClick={() => resendOTP(tempUserId).then(() => toast.success("Code resent!"))}
                    className="text-sm font-semibold text-[#2563EB]"
                  >
                    {t("auth.otp.resendCode")}
                  </button>
                  <div>
                    <button type="button" onClick={() => setStep("form")} className="text-sm text-[#64748B]">
                      {t("auth.otp.backToSignup")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h1 className="font-display text-[1.85rem] font-bold leading-tight md:text-[2.2rem]">
                {tab === "login" ? t("auth.login.title") : t("auth.register.title")}
              </h1>
              <p className="mt-2 text-[15px] text-[#64748B] dark:text-gray-400">
                {tab === "login" ? t("auth.login.subtitle") : t("auth.register.subtitle")}
              </p>

              <div className="mt-7 mb-6 flex overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-dark-divider">
                <button type="button" onClick={() => setTab("login")} className={tabClass(tab === "login")}>
                  {t("auth.tabs.login")}
                </button>
                <button type="button" onClick={() => setTab("register")} className={tabClass(tab === "register")}>
                  {t("auth.tabs.signUp")}
                </button>
              </div>

              {tab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={label}>{t("auth.login.email")}</label>
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className={input}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <div className="mb-0 flex items-center justify-between">
                      <label className={label}>{t("auth.login.password")}</label>
                      <Link href="/forgot-password" className="text-sm font-semibold text-[#2563EB]">
                        {t("auth.login.forgotPassword")}
                      </Link>
                    </div>
                    <input
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className={input}
                      placeholder="••••••••"
                    />
                  </div>
                  <button type="submit" disabled={loginLoading} className={`${submitBtn} mt-2`}>
                    {loginLoading ? t("auth.login.signingIn") : t("auth.login.signInButton")}
                  </button>
                  <p className="pt-1 text-center text-sm text-[#64748B]">
                    {t("auth.login.newToRafraf")}{" "}
                    <button type="button" onClick={() => setTab("register")} className="font-semibold text-[#2563EB]">
                      {t("auth.login.createAccount")}
                    </button>
                  </p>
                </form>
              )}

              {tab === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={label}>{t("auth.register.firstName")}</label>
                      <input
                        type="text"
                        required
                        value={regData.firstName}
                        onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                        className={input}
                        placeholder="Alex"
                      />
                    </div>
                    <div>
                      <label className={label}>{t("auth.register.lastName")}</label>
                      <input
                        type="text"
                        required
                        value={regData.lastName}
                        onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                        className={input}
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={label}>{t("auth.register.email")}</label>
                    <input
                      type="email"
                      required
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      className={input}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={label}>{t("auth.register.password")}</label>
                      <input
                        type="password"
                        required
                        minLength="6"
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        className={input}
                        placeholder={t("auth.register.minChars")}
                      />
                    </div>
                    <div>
                      <label className={label}>{t("auth.register.confirmPassword")}</label>
                      <input
                        type="password"
                        required
                        minLength="6"
                        value={regData.confirmPassword}
                        onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                        className={input}
                        placeholder={t("auth.register.repeat")}
                      />
                    </div>
                  </div>
                  <label htmlFor="terms" className="flex cursor-pointer items-start gap-2.5 select-none">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#2563EB] peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-[#212121] ${
                        termsAccepted
                          ? "border-[#2563EB] !bg-[#2563EB]"
                          : "border-[#CBD5E1] !bg-white dark:border-[#555555] dark:!bg-[#2a2a2a]"
                      }`}
                    >
                      {termsAccepted && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2.2 6.1L4.7 8.6L9.8 3.4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm leading-5 tracking-normal text-[#64748B] dark:text-gray-400">
                      {t("auth.register.terms")}
                      {" "}
                      <Link href="/terms" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">{t("auth.register.termsLink")}</Link>
                      {" "}
                      {t("auth.register.and")}
                      {" "}
                      <Link href="/privacy" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">{t("auth.register.privacyLink")}</Link>
                    </span>
                  </label>
                  <button type="submit" disabled={loading} className={submitBtn}>
                    {loading ? t("auth.register.creating") : t("auth.register.createButton")}
                  </button>
                  <p className="pt-1 text-center text-sm text-[#64748B]">
                    {t("auth.register.alreadyHaveAccount")}{" "}
                    <button type="button" onClick={() => setTab("login")} className="font-semibold text-[#2563EB]">
                      {t("auth.register.signIn")}
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
