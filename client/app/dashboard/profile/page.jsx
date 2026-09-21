"use client";

import { useState, useEffect } from "react";
import { User, Building2, Link2, Lock, X, Instagram, Facebook, Globe } from "lucide-react";
import { useAuth } from "../../../lib/auth/AuthContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getUserById, updateUser } from "../../../services/userService";
import Avatar from "../../../components/both/Avatar";
import { toast } from "react-hot-toast";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const labelClass =
  "mb-1.5 block text-sm font-semibold text-[#0F172A] dark:text-gray-200";
const inputClass =
  "h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-[15px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#494952] dark:bg-[#303030] dark:text-[#e2e7e3] dark:placeholder:text-white/40";
const sectionCard =
  "rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-6 dark:border-dark-divider dark:bg-dark-card";
const sectionTitle =
  "mb-5 flex items-center gap-2.5 font-display text-lg font-bold text-[#0F172A] dark:text-white";
const sectionIcon = "h-5 w-5 shrink-0 text-[#2563EB]";
const primaryBtn =
  "inline-flex h-11 items-center justify-center gap-2.5 bg-[#2563EB] px-6 text-sm font-bold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60";
const ghostBtn =
  "inline-flex h-11 items-center justify-center gap-2.5 border border-[#E2E8F0] px-5 text-sm font-semibold text-[#64748B] transition hover:border-[#CBD5E1] hover:text-[#0F172A] dark:border-dark-divider dark:hover:text-white";

const ProfileComponent = () => {
  const { t } = useLanguage();
  const { userId, updateUserState, changePassword, token } = useAuth();
  const [user, setUser] = useState(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const getToken = () => token || localStorage.getItem("token");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    description: "",
    companyName: "",
    email: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: "",
      website: "",
      linkedin: "",
    },
    sellerType: "private",
    phoneNumbers: [{ phone: "", countryCode: "pl" }],
    location: { type: "Point", coordinates: [51.5074, -0.1278] },
  });

  const [imageFile, setImageFile] = useState(null);
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [isCpOpen, setIsCpOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!cpCurrent || !cpNew || !cpConfirm) return;
    if (cpNew !== cpConfirm) {
      toast.error("New passwords do not match.");
      return;
    }
    setCpLoading(true);
    try {
      const res = await changePassword(cpCurrent, cpNew);
      if (res?.success) {
        setCpCurrent("");
        setCpNew("");
        setCpConfirm("");
        setIsCpOpen(false);
        toast.success("Password changed successfully.");
      } else {
        toast.error(res?.error || "Failed to change password.");
      }
    } finally {
      setCpLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      try {
        const userData = await getUserById(userId, getToken);
        setUser(userData);
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          description: userData.description || "",
          companyName: userData.companyName || "",
          email: userData.email || "",
          socialMedia: {
            instagram: userData.socialMedia?.instagram || "",
            facebook: userData.socialMedia?.facebook || "",
            twitter: userData.socialMedia?.twitter || "",
            website: userData.socialMedia?.website || "",
            linkedin: userData.socialMedia?.linkedin || "",
          },
          sellerType: userData.sellerType || "private",
          phoneNumbers: userData.phoneNumbers?.length
            ? userData.phoneNumbers.map((phone) => ({
                phone,
                countryCode: phone.startsWith("+48") ? "pl" : "us",
              }))
            : [{ phone: "", countryCode: "pl" }],
          location: {
            type: "Point",
            coordinates: userData.location?.coordinates || [51.5074, -0.1278],
          },
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    loadUser();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.socialMedia) {
      setFormData({
        ...formData,
        socialMedia: { ...formData.socialMedia, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        )
      ) {
        toast.error("Invalid file type. Please upload JPG, PNG, WebP, or GIF.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Max size is 5MB.");
        return;
      }
      setImageFile(file);
      setUser((prevUser) => ({
        ...prevUser,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const handlePhoneNumberChange = (index, value, country) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index] = {
      phone: value,
      countryCode: country.countryCode,
    };
    setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
  };

  const addPhoneNumber = () => {
    if (formData.phoneNumbers.length < 4) {
      setFormData({
        ...formData,
        phoneNumbers: [
          ...formData.phoneNumbers,
          { phone: "", countryCode: "pl" },
        ],
      });
    }
  };

  const removePhoneNumber = (index) => {
    if (formData.phoneNumbers.length > 1) {
      setFormData({
        ...formData,
        phoneNumbers: formData.phoneNumbers.filter((_, i) => i !== index),
      });
    }
  };

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (/^(https?:\/\/|blob:|cloudinary\.com)/.test(imagePath)) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    return `${(API_BASE || "").replace(/\/$/, "")}/${imagePath.replace(
      /^[/\\]+/,
      ""
    )}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        phoneNumbers: formData.phoneNumbers
          .map((item) => item.phone)
          .filter((phone) => phone.trim() !== ""),
      };
      if (data.sellerType && !["private", "company"].includes(data.sellerType)) {
        data.sellerType = "private";
      }
      if (imageFile) data.image = imageFile;

      const result = await updateUser(data, getToken);
      if (result.user) {
        setUser(result.user);
        updateUserState(result.user);
      }
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="marketing-ui flex min-h-[50vh] flex-col items-center justify-center p-8">
        <div className="mb-4 h-10 w-10 animate-spin border-2 border-[#E2E8F0] border-t-[#2563EB]" />
        <p className="text-sm font-medium text-[#64748B]">
          {t("dashboard:profile.loading", "Loading profile...")}
        </p>
      </div>
    );
  }

  return (
    <div className="marketing-ui mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5 dark:border-dark-divider sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white md:text-[1.85rem]">
              {t("dashboard:profile.yourProfile", "Your Profile")}
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[#64748B] dark:text-gray-400">
              {t(
                "dashboard:profile.subtitle",
                "Manage your personal details and account settings."
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCpOpen(true)}
              className={ghostBtn}
            >
              <Lock className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>
                {t("dashboard:profile.changePassword", "Change Password")}
              </span>
            </button>
            <button type="submit" disabled={saving} className={primaryBtn}>
              {saving
                ? t("dashboard:profile.saving", "Saving...")
                : t("dashboard:profile.saveChanges", "Save Changes")}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Identity + personal — one card so photo isn't an empty orphan */}
          <section className={sectionCard}>
            <h2 className={sectionTitle}>
              <User className={sectionIcon} />
              {t("dashboard:profile.personalDetails", "Personal Details")}
            </h2>

            <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
              <div className="flex shrink-0 flex-col items-center gap-3 sm:w-[200px]">
                <Avatar
                  src={formatImageUrl(user?.image || user?.profilePicture)}
                  alt="Profile"
                  size={128}
                  imgClassName="border border-[#E2E8F0] object-cover dark:border-dark-divider"
                />
                <label className="cursor-pointer text-center text-sm font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]">
                  {t("dashboard:profile.uploadNewPhoto", "Upload new photo")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="max-w-[180px] text-center text-[10px] font-medium leading-snug text-[#94A3B8]">
                  {t(
                    "dashboard:profile.photoRecommended",
                    "JPG, PNG, WebP · max 5MB"
                  )}
                </p>
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      {t("dashboard:profile.firstName", "First Name")}
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("dashboard:profile.lastName", "Last Name")}
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    {t("dashboard:profile.email", "Email")}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    {t("dashboard:profile.about", "About")}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`${inputClass} !h-auto min-h-[96px] py-3`}
                    placeholder={t(
                      "dashboard:profile.aboutPlaceholder",
                      "Write a few words about yourself or your shelter..."
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className={sectionCard}>
              <h2 className={sectionTitle}>
                <Building2 className={sectionIcon} />
                {t("dashboard:profile.contactBusiness", "Contact & Business")}
              </h2>
              <div className="space-y-3.5">
                <div>
                  <label className="mb-1.5 block text-base font-semibold text-[#0F172A] dark:text-gray-200">
                    {t("dashboard:profile.accountType", "Account Type")}
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, sellerType: "private" })
                      }
                      className={`flex h-12 items-center justify-center gap-2 border px-3 text-sm font-semibold transition sm:h-[50px] sm:text-xs ${
                        formData.sellerType === "private"
                          ? "border-[#2563EB] bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#93C5FD]"
                          : "border-[#E2E8F0] text-[#64748B] dark:border-[#494952] dark:text-gray-400"
                      }`}
                    >
                      <User className="h-4 w-4 shrink-0" />
                      {t("dashboard:profile.privateOwner", "Private Owner")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, sellerType: "company" })
                      }
                      className={`flex h-12 items-center justify-center gap-2 border px-3 text-sm font-semibold transition sm:h-[50px] sm:text-xs ${
                        formData.sellerType === "company"
                          ? "border-[#2563EB] bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#93C5FD]"
                          : "border-[#E2E8F0] text-[#64748B] dark:border-[#494952] dark:text-gray-400"
                      }`}
                    >
                      <Building2 className="h-4 w-4 shrink-0" />
                      {t("dashboard:profile.shelterRescue", "Shelter / Rescue")}
                    </button>
                  </div>
                </div>

                {formData.sellerType === "company" && (
                  <div>
                    <label className={labelClass}>
                      {t("dashboard:profile.shelterName", "Shelter Name")}
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>
                    {t("dashboard:profile.phoneNumbers", "Phone Numbers")}
                  </label>
                  <div className="space-y-2">
                    {formData.phoneNumbers.map((phone, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="min-w-0 flex-1">
                          <PhoneInput
                            country={phone.countryCode?.toLowerCase() || "pl"}
                            onlyCountries={["pl"]}
                            value={phone.phone}
                            onChange={(v, c) =>
                              handlePhoneNumberChange(index, v, c)
                            }
                            inputClass="!w-full !h-[50px] !rounded-xl !border !border-[#E2E8F0] !bg-white !pl-12 !text-[15px] !font-medium !text-[#0F172A] dark:!border-[#494952] dark:!bg-[#303030] dark:!text-[#e2e7e3]"
                            containerClass="!w-full"
                            buttonClass="!rounded-l-xl !border-0 !bg-transparent !pl-2"
                          />
                        </div>
                        {formData.phoneNumbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePhoneNumber(index)}
                            className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-[#494952]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.phoneNumbers.length < 4 && (
                      <button
                        type="button"
                        onClick={addPhoneNumber}
                        className="inline-flex h-10 items-center justify-center border border-dashed border-[#CBD5E1] px-4 text-sm font-semibold text-[#2563EB] transition hover:border-[#2563EB] hover:bg-[#EEF2FF] dark:border-[#494952] dark:hover:bg-[#2563EB]/10"
                      >
                        {t("dashboard:profile.addNumber", "+ Add Number")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className={sectionCard}>
              <h2 className={sectionTitle}>
                <Link2 className={sectionIcon} />
                {t("dashboard:profile.socialLinks", "Social Links")}
              </h2>
              <div className="space-y-3.5">
                {[
                  { key: "instagram", Icon: Instagram, label: "Instagram" },
                  { key: "facebook", Icon: Facebook, label: "Facebook" },
                  { key: "website", Icon: Globe, label: "Website" },
                ].map(({ key, Icon, label }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <input
                        type="url"
                        name={key}
                        value={formData.socialMedia[key]}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        className={`${inputClass} !pl-10`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </form>

      {isCpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0F172A]/60"
            onClick={() => setIsCpOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md border border-[#E2E8F0] bg-white p-6 dark:border-dark-divider dark:bg-dark-card sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-[#0F172A] dark:text-white">
                {t("dashboard:profile.changePassword", "Change Password")}
              </h3>
              <button
                type="button"
                onClick={() => setIsCpOpen(false)}
                className="flex h-9 w-9 items-center justify-center text-[#64748B] transition hover:text-[#0F172A] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className={labelClass}>
                  {t("dashboard:profile.currentPassword", "Current Password")}
                </label>
                <input
                  type="password"
                  value={cpCurrent}
                  onChange={(e) => setCpCurrent(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  {t("dashboard:profile.newPassword", "New Password")}
                </label>
                <input
                  type="password"
                  value={cpNew}
                  onChange={(e) => setCpNew(e.target.value)}
                  minLength={6}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  {t(
                    "dashboard:profile.confirmNewPassword",
                    "Confirm New Password"
                  )}
                </label>
                <input
                  type="password"
                  value={cpConfirm}
                  onChange={(e) => setCpConfirm(e.target.value)}
                  minLength={6}
                  className={inputClass}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCpOpen(false)}
                  className={ghostBtn}
                >
                  {t("dashboard:profile.cancel", "Cancel")}
                </button>
                <button type="submit" disabled={cpLoading} className={primaryBtn}>
                  {cpLoading
                    ? t("dashboard:profile.updating", "Updating...")
                    : t("dashboard:profile.updatePassword", "Update Password")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileComponent;
