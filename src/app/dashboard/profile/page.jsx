"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { getUserProfile, updateUserNotificationPreferences, updateUserProfile } from "@/services/donationService";
import { changePassword } from "@/services/authService";
import { PersonalInfoCard } from "./components/PersonalInfoCard";
import { NotificationPrefsCard } from "./components/NotificationPrefsCard";
import { SecurityCard } from "./components/SecurityCard";
import { AccountCard } from "./components/AccountCard";
import { ChangePasswordModal } from "./components/ChangePasswordModal";

const ProfilePage = () => {
  const [loading, setLoading]           = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs]   = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");

  const [form, setForm] = useState({
    organization: "", firstName: "", lastName: "", email: "", phone: "",
    address: { line1: "", streetName: "", city: "", state: "", postalCode: "", country: "" },
  });

  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    donationReceipts:   true,
    campaignUpdates:    false,
  });

  const [passwordOpen, setPasswordOpen]       = useState(false);
  const [passwordSaving, setPasswordSaving]   = useState(false);
  const [passwordError, setPasswordError]     = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordForm, setPasswordForm]       = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const res = await getUserProfile();
        if (!alive) return;
        const data       = res?.data?.data || res?.data || {};
        const user       = data?.user || {};
        const emailPrefs = data?.notificationPreferences?.email || {};

        setForm({
          organization: String(user?.organization || ""),
          firstName:    String(user?.firstName || ""),
          lastName:     String(user?.lastName || ""),
          email:        String(user?.email || ""),
          phone:        String(user?.phone || ""),
          address: {
            line1:      String(user?.address?.line1 || ""),
            streetName: String(user?.address?.streetName || ""),
            city:       String(user?.address?.city || ""),
            state:      String(user?.address?.state || ""),
            postalCode: String(user?.address?.postalCode || ""),
            country:    String(user?.address?.country || ""),
          },
        });

        setPrefs({
          emailNotifications: Boolean(emailPrefs?.scheduleReminders),
          donationReceipts:   Boolean(emailPrefs?.donationReceipts),
          campaignUpdates:    Boolean(emailPrefs?.marketing),
        });
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load profile.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const setField   = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setAddress = (key) => (e) => setForm((f) => ({ ...f, address: { ...f.address, [key]: e.target.value } }));
  const setPref    = (key) => (val) => setPrefs((p) => ({ ...p, [key]: val }));

  const handleSaveProfile = async () => {
    setError(""); setSuccess("");
    setSavingProfile(true);
    try {
      await updateUserProfile({
        organization: String(form.organization || "").trim(),
        firstName:    String(form.firstName || "").trim(),
        lastName:     String(form.lastName || "").trim(),
        phone:        String(form.phone || "").trim(),
        address: {
          line1:      String(form.address?.line1 || "").trim(),
          streetName: String(form.address?.streetName || "").trim(),
          city:       String(form.address?.city || "").trim(),
          state:      String(form.address?.state || "").trim(),
          postalCode: String(form.address?.postalCode || "").trim(),
          country:    String(form.address?.country || "").trim(),
        },
      });
      setSuccess("Profile updated.");
    } catch (e) {
      setError(e?.message || "Save failed.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePrefs = async () => {
    setError(""); setSuccess("");
    setSavingPrefs(true);
    try {
      await updateUserNotificationPreferences({
        email: {
          donationReceipts:  Boolean(prefs.donationReceipts),
          scheduleReminders: Boolean(prefs.emailNotifications),
          marketing:         Boolean(prefs.campaignUpdates),
        },
      });
      setSuccess("Preferences updated.");
    } catch (e) {
      setError(e?.message || "Save failed.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setPasswordError(""); setPasswordSuccess("");
    setPasswordOpen(true);
  };

  const handlePasswordFormChange = (field) => (e) =>
    setPasswordForm((p) => ({ ...p, [field]: e.target.value }));

  const handlePasswordSave = async () => {
    setPasswordError(""); setPasswordSuccess("");
    const currentPassword = String(passwordForm.currentPassword || "");
    const newPassword     = String(passwordForm.newPassword || "");
    const confirmPassword = String(passwordForm.confirmPassword || "");

    if (!currentPassword.trim() || !newPassword.trim()) {
      setPasswordError("Please enter your current password and a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Confirm password does not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordOpen(false), 800);
    } catch (e) {
      setPasswordError(e?.message || "Change password failed.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
      <DashboardHeader
        title="Profile Settings"
        subtitle="Manage your account information and preferences"
      />

      <div className="flex-1 p-4 md:p-6 space-y-5">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
        ) : null}
        {success ? (
          <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{success}</div>
        ) : null}

        <PersonalInfoCard
          loading={loading}
          savingProfile={savingProfile}
          form={form}
          setField={setField}
          setAddress={setAddress}
          onSave={handleSaveProfile}
        />

        <NotificationPrefsCard
          loading={loading}
          savingPrefs={savingPrefs}
          prefs={prefs}
          setPref={setPref}
          onSave={handleSavePrefs}
        />

        <SecurityCard onChangePassword={handleOpenPasswordModal} />

        <AccountCard />
      </div>

      {passwordOpen && (
        <ChangePasswordModal
          saving={passwordSaving}
          error={passwordError}
          success={passwordSuccess}
          form={passwordForm}
          onFormChange={handlePasswordFormChange}
          onClose={() => setPasswordOpen(false)}
          onSave={handlePasswordSave}
        />
      )}
    </>
  );
};

export default ProfilePage;
