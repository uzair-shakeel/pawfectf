"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getUserById, updateUser } from "../../../services/userService";
import Avatar from "../../../components/both/Avatar";
import { toast } from "react-hot-toast";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

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
    socialMedia: { instagram: "", facebook: "", twitter: "", website: "", linkedin: "" },
    sellerType: "private",
    phoneNumbers: [{ phone: "", countryCode: "pl" }],
    location: { type: "Point", coordinates: [51.5074, -0.1278] }
  });

  const [imageFile, setImageFile] = useState(null);
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [isCpOpen, setIsCpOpen] = useState(false);

  // Lazy load map component
  const [MapComponent, setMapComponent] = useState(null);

  useEffect(() => {
    import("../../../components/dashboard/SimpleMapPlaceholder").then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

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
        setCpCurrent(""); setCpNew(""); setCpConfirm(""); setIsCpOpen(false);
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
            ? userData.phoneNumbers.map((phone) => ({ phone, countryCode: phone.startsWith("+48") ? "pl" : "us" }))
            : [{ phone: "", countryCode: "pl" }],
          location: { type: "Point", coordinates: userData.location?.coordinates || [51.5074, -0.1278] }
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
      setFormData({ ...formData, socialMedia: { ...formData.socialMedia, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
        toast.error("Invalid file type. Please upload JPG, PNG, WebP, or GIF.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Max size is 5MB.");
        return;
      }
      setImageFile(file);
      setUser(prevUser => ({ ...prevUser, image: URL.createObjectURL(file) }));
    }
  };

  const handlePhoneNumberChange = (index, value, country) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index] = { phone: value, countryCode: country.countryCode };
    setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
  };

  const addPhoneNumber = () => {
    if (formData.phoneNumbers.length < 4) {
      setFormData({ ...formData, phoneNumbers: [...formData.phoneNumbers, { phone: "", countryCode: "pl" }] });
    }
  };

  const removePhoneNumber = (index) => {
    if (formData.phoneNumbers.length > 1) {
      setFormData({ ...formData, phoneNumbers: formData.phoneNumbers.filter((_, i) => i !== index) });
    }
  };

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (/^(https?:\/\/|blob:|cloudinary\.com)/.test(imagePath)) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    return `${(API_BASE || "").replace(/\/$/, "")}/${imagePath.replace(/^[/\\]/, "")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        phoneNumbers: formData.phoneNumbers.map(item => item.phone).filter(phone => phone.trim() !== ""),
      };
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
    }
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium">Loading profile...</p>
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto dark:bg-dark-card">
      <div className="flex items-center justify-between mb-8 animate-fadeIn">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t("dashboard:profile.yourProfile", "Your Profile")}</h1>
          <p className="text-gray-500 mt-2 font-medium">{t("dashboard:profile.subtitle", "Manage your personal details and account settings.")}</p>
        </div>
        <button type="button" onClick={() => setIsCpOpen(true)} className="bg-white dark:bg-dark-main text-gray-700 dark:text-gray-200 font-bold border border-gray-200 dark:border-dark-divider px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-raised transition-all shadow-sm">
          {t("dashboard:profile.changePassword", "Change Password")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8 animate-slideIn">
          <div className="bg-white dark:bg-dark-main p-4 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-divider shadow-sm relative overflow-hidden group">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">{t("dashboard:profile.profilePhoto", "Profile Photo")}</h2>
            <div className="flex items-center gap-8">
              <div className="relative">
                <Avatar src={formatImageUrl(user?.image || user?.profilePicture)} alt="Profile" size={100} imgClassName="border-4 border-white dark:border-gray-800 shadow-xl rounded-full object-cover" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 pointer-events-none"></div>
              </div>
              <div>
                <label className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg inline-block">
                  {t("dashboard:profile.uploadNewPhoto", "Upload new photo")}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-3 font-medium">{t("dashboard:profile.photoRecommended", "Recommended: JPG, PNG, WebP. Max 5MB.")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-main p-4 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-divider shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">{t("dashboard:profile.personalDetails", "Personal Details")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("dashboard:profile.firstName", "First Name")}</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border-2 border-gray-100 dark:border-dark-divider p-4 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all font-semibold bg-gray-50/50 dark:bg-dark-raised text-gray-900 dark:text-white" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("dashboard:profile.lastName", "Last Name")}</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border-2 border-gray-100 dark:border-dark-divider p-4 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all font-semibold bg-gray-50/50 dark:bg-dark-raised text-gray-900 dark:text-white" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("dashboard:profile.about", "About")}</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border-2 border-gray-100 dark:border-dark-divider p-4 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all bg-gray-50/50 dark:bg-dark-raised text-gray-900 dark:text-white min-h-[120px]" placeholder={t("dashboard:profile.aboutPlaceholder", "Write a few words about yourself or your shelter...")} />
            </div>
          </div>

          {/* <div className="bg-white dark:bg-dark-main p-4 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-divider shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">{t("dashboard:profile.location", "Location")}</h2>
            <div className="rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-dark-divider">
              {MapComponent ? (
                <MapComponent location={formData.location} setLocation={(loc) => setFormData({ ...formData, location: loc })} />
              ) : (
                <div className="w-full h-96 bg-gray-100 dark:bg-dark-raised rounded-xl animate-pulse" />
              )}
            </div>
          </div> */}
        </div>

        <div className="xl:col-span-1 space-y-8 animate-slideIn">
          <div className="bg-white dark:bg-dark-main p-4 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-divider shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">{t("dashboard:profile.contactBusiness", "Contact & Business")}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("dashboard:profile.email", "Email")}</label>
                <input type="email" value={formData.email} disabled className="w-full border-2 border-gray-100 dark:border-dark-divider p-4 rounded-xl bg-gray-50 dark:bg-dark-raised text-gray-500 font-medium cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("dashboard:profile.accountType", "Account Type")}</label>
                <div className="flex bg-gray-50 dark:bg-dark-raised p-1 rounded-xl border border-gray-100 dark:border-dark-divider">
                  <button type="button" onClick={() => setFormData({ ...formData, sellerType: 'private' })} className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${formData.sellerType === 'private' ? 'bg-white dark:bg-dark-card text-blue-600 shadow-sm' : 'text-gray-500'}`}>{t("dashboard:profile.privateOwner", "Private Owner")}</button>
                  <button type="button" onClick={() => setFormData({ ...formData, sellerType: 'company' })} className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${formData.sellerType === 'company' ? 'bg-white dark:bg-dark-card text-blue-600 shadow-sm' : 'text-gray-500'}`}>{t("dashboard:profile.shelterRescue", "Shelter / Rescue")}</button>
                </div>
              </div>
              {formData.sellerType === 'company' && (
                <div className="animate-slideUp">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("dashboard:profile.shelterName", "Shelter Name")}</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full border-2 border-gray-100 dark:border-dark-divider p-4 rounded-xl focus:border-blue-500 transition-all font-semibold bg-gray-50/50 dark:bg-dark-raised text-gray-900 dark:text-white" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("dashboard:profile.phoneNumbers", "Phone Numbers")}</label>
                <div className="space-y-3">
                  {formData.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-grow">
                        <PhoneInput country={phone.countryCode?.toLowerCase() || 'pl'} value={phone.phone} onChange={(v, c) => handlePhoneNumberChange(index, v, c)} inputClass="!w-full !h-12 !bg-gray-50/50 dark:!bg-dark-raised !border-2 !border-gray-100 dark:!border-dark-divider !rounded-xl !text-gray-900 dark:!text-white" containerClass="!w-full" buttonClass="!bg-transparent !border-0 !pl-2" />
                      </div>
                      {formData.phoneNumbers.length > 1 && (
                        <button type="button" onClick={() => removePhoneNumber(index)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border-2 border-transparent">✕</button>
                      )}
                    </div>
                  ))}
                  {formData.phoneNumbers.length < 4 && (
                    <button type="button" onClick={addPhoneNumber} className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-dark-divider text-gray-500 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-dark-raised text-sm">{t("dashboard:profile.addNumber", "+ Add Number")}</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-main p-4 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-divider shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">{t("dashboard:profile.socialLinks", "Social Links")}</h2>
            <div className="space-y-4">
              {['instagram', 'facebook', 'website'].map((social) => (
                <div key={social} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 uppercase text-xs font-bold tracking-wider w-24">
                    {social}
                  </div>
                  <input type="url" name={social} value={formData.socialMedia[social]} onChange={handleInputChange} placeholder="https://..." className="w-full border-2 border-gray-100 dark:border-dark-divider p-4 pl-24 rounded-xl focus:border-blue-500 transition-all text-sm font-medium bg-gray-50/50 dark:bg-dark-raised text-gray-900 dark:text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 xl:col-span-3 flex justify-center sm:justify-end py-4">
          <button type="submit" className="bg-blue-600 text-white font-bold px-12 py-5 rounded-xl hover:bg-blue-700 transition-all shadow-xl hover:-translate-y-1 text-lg flex items-center gap-2">
            <span>{t("dashboard:profile.saveChanges", "Save Changes")}</span>
          </button>
        </div>
      </form>

      {isCpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCpOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-dark-main rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-dark-divider">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard:profile.changePassword", "Change Password")}</h3>
              <button type="button" onClick={() => setIsCpOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
            </div>
            <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("dashboard:profile.currentPassword", "Current Password")}</label>
                <input type="password" value={cpCurrent} onChange={(e) => setCpCurrent(e.target.value)} className="w-full border-2 border-gray-100 dark:border-dark-divider p-4 rounded-xl focus:border-blue-500 bg-gray-50/50 dark:bg-dark-raised text-gray-900 dark:text-white" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("dashboard:profile.newPassword", "New Password")}</label>
                <input type="password" value={cpNew} onChange={(e) => setCpNew(e.target.value)} minLength={6} className="w-full border-2 border-gray-100 dark:border-dark-divider p-4 rounded-xl focus:border-blue-500 bg-gray-50/50 dark:bg-dark-raised text-gray-900 dark:text-white" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("dashboard:profile.confirmNewPassword", "Confirm New Password")}</label>
                <input type="password" value={cpConfirm} onChange={(e) => setCpConfirm(e.target.value)} minLength={6} className="w-full border-2 border-gray-100 dark:border-dark-divider p-4 rounded-xl focus:border-blue-500 bg-gray-50/50 dark:bg-dark-raised text-gray-900 dark:text-white" required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsCpOpen(false)} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-dark-divider text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-dark-raised">{t("dashboard:profile.cancel", "Cancel")}</button>
                <button type="submit" disabled={cpLoading} className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50">
                  {cpLoading ? t("dashboard:profile.updating", "Updating...") : t("dashboard:profile.updatePassword", "Update Password")}
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
