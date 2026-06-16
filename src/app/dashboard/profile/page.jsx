"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { BellIcon, CloseModal, LockIcon, SaveIcon, UserIcon } from "@/components/common/SvgIcon";
import UserToggle from "@/components/ui/UserToggle";
import Field from "@/components/ui/Field";
import OutlineButton from "@/components/ui/OutlineButton";
import UserSectionHeader from "@/components/ui/UserSectionHeader";
import { getUserProfile, updateUserNotificationPreferences, updateUserProfile } from "@/services/donationService";
import { SkeletonStack } from "@/components/ui/Skeleton";
import { changePassword } from "@/services/authService";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    organization: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      streetName: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    donationReceipts: true,
    campaignUpdates: false,
  });

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const res = await getUserProfile();
        if (!alive) return;
        const data = res?.data?.data || res?.data || {};
        const user = data?.user || {};
        const np = data?.notificationPreferences || {};
        const emailPrefs = np?.email || {};

        setForm({
          organization: String(user?.organization || ""),
          firstName: String(user?.firstName || ""),
          lastName: String(user?.lastName || ""),
          email: String(user?.email || ""),
          phone: String(user?.phone || ""),
          address: {
            line1: String(user?.address?.line1 || ""),
            streetName: String(user?.address?.streetName || ""),
            city: String(user?.address?.city || ""),
            state: String(user?.address?.state || ""),
            postalCode: String(user?.address?.postalCode || ""),
            country: String(user?.address?.country || ""),
          },
        });

        setPrefs({
          emailNotifications: Boolean(emailPrefs?.scheduleReminders),
          donationReceipts: Boolean(emailPrefs?.donationReceipts),
          campaignUpdates: Boolean(emailPrefs?.marketing),
        });
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load profile.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setAddress = (key) => (e) =>
    setForm((f) => ({
      ...f,
      address: { ...(f.address || {}), [key]: e.target.value },
    }));
  const setPref = (key) => (val) => setPrefs((p) => ({ ...p, [key]: val }));

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

        {/* Personal Information */}
        <section className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
          <UserSectionHeader icon={UserIcon} title="Personal Information" variant="user" />

          <div className="mt-5 space-y-4">
            {loading ? (
              <SkeletonStack count={6} />
            ) : (
              <>
            <Field label="Organization" value={form.organization} onChange={setField("organization")} placeholder="Organization" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" value={form.firstName} onChange={setField("firstName")} placeholder="First name" />
              <Field label="Last Name" value={form.lastName} onChange={setField("lastName")} placeholder="Last name" />
            </div>
            <Field label="Email Address" value={form.email} type="email" readOnly />
            <Field label="Phone Number" value={form.phone} type="tel" onChange={setField("phone")} placeholder="+1 555..." />

            <div className="pt-2">
              <p className="text-[13px] font-semibold text-[#111827]">Address</p>
              <p className="mt-1 text-[12px] text-[#6B7280]">Used for receipts and billing where applicable</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Address Line 1" value={form.address?.line1 || ""} onChange={setAddress("line1")} placeholder="12 Main St" />
              <Field label="Street Name" value={form.address?.streetName || ""} onChange={setAddress("streetName")} placeholder="Main St" />
              <Field label="City" value={form.address?.city || ""} onChange={setAddress("city")} placeholder="City" />
              <Field label="State" value={form.address?.state || ""} onChange={setAddress("state")} placeholder="State" />
              <Field label="Postal Code" value={form.address?.postalCode || ""} onChange={setAddress("postalCode")} placeholder="00000" />
              <Field label="Country" value={form.address?.country || ""} onChange={setAddress("country")} placeholder="Country" />
            </div>

            <div className="pt-1">
              <button
                type="button"
                disabled={savingProfile}
                onClick={async () => {
                  setError("");
                  setSuccess("");
                  setSavingProfile(true);
                  try {
                    const payload = {
                      organization: String(form.organization || "").trim(),
                      firstName: String(form.firstName || "").trim(),
                      lastName: String(form.lastName || "").trim(),
                      phone: String(form.phone || "").trim(),
                      address: {
                        line1: String(form.address?.line1 || "").trim(),
                        streetName: String(form.address?.streetName || "").trim(),
                        city: String(form.address?.city || "").trim(),
                        state: String(form.address?.state || "").trim(),
                        postalCode: String(form.address?.postalCode || "").trim(),
                        country: String(form.address?.country || "").trim(),
                      },
                    };
                    await updateUserProfile(payload);
                    setSuccess("Profile updated.");
                  } catch (e) {
                    setError(e?.message || "Save failed.");
                  } finally {
                    setSavingProfile(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                {SaveIcon}
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
              </>
            )}
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
          <UserSectionHeader icon={BellIcon} title="Notification Preferences" variant="bell" />

          <div className="mt-4 space-y-2">
            {loading ? (
              <SkeletonStack count={3} blockClass="h-12 rounded-xl" />
            ) : (
              <>
                <UserToggle
                  label="Email Notifications"
                  desc="Receive important updates via email"
                  checked={prefs.emailNotifications}
                  onChange={setPref("emailNotifications")}
                />
                <UserToggle
                  label="Donation Receipts"
                  desc="Receive email receipts for every donation"
                  checked={prefs.donationReceipts}
                  onChange={setPref("donationReceipts")}
                />
                <UserToggle
                  label="Campaign Updates"
                  desc="Get notified about campaign progress and impact"
                  checked={prefs.campaignUpdates}
                  onChange={setPref("campaignUpdates")}
                />
              </>
            )}
          </div>

          {!loading && (
          <div className="pt-4">
            <button
              type="button"
              disabled={savingPrefs}
              onClick={async () => {
                setError("");
                setSuccess("");
                setSavingPrefs(true);
                try {
                  await updateUserNotificationPreferences({
                    email: {
                      donationReceipts: Boolean(prefs.donationReceipts),
                      scheduleReminders: Boolean(prefs.emailNotifications),
                      marketing: Boolean(prefs.campaignUpdates),
                    },
                  });
                  setSuccess("Preferences updated.");
                } catch (e) {
                  setError(e?.message || "Save failed.");
                } finally {
                  setSavingPrefs(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors cursor-pointer"
            >
              {SaveIcon}
              {savingPrefs ? "Saving..." : "Save Preferences"}
            </button>
          </div>
          )}
        </section>

        {/* Security */}
        <section className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
          <UserSectionHeader icon={LockIcon} title="Security" variant="lock" />

          <div className="mt-4 divide-y divide-[#E5E7EB]">
            <div className="flex items-center justify-between py-4">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-medium text-[#111827]">Password</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Update your account password</p>
              </div>
              <OutlineButton onClick={() => { setPasswordError(""); setPasswordSuccess(""); setPasswordOpen(true); }}>
                Change Password
              </OutlineButton>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-medium text-[#111827]">Two-Factor Authentication</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Add an extra layer of security</p>
              </div>
              <OutlineButton>Enable</OutlineButton>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="bg-white rounded-2xl border border-dashed border-[#EA3335]/20 p-5 md:p-6">
          <h2 className="text-base font-semibold text-[#111827]">Account</h2>

          <div className="mt-4 flex items-center justify-between gap-4 px-4 py-4 rounded-xl bg-[#FFF5F5] border border-dashed border-[#EA3335]/15">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#EA3335]">Deactivate Account</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Temporarily archive your account and all data</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-[#1A1A1A] px-4 py-2 text-xs font-medium text-white hover:bg-[#333333] transition-colors cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </section>

      </div>

      {passwordOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !passwordSaving) setPasswordOpen(false);
          }}
        >
          <div className="relative w-full max-w-[520px] bg-white rounded-[24px] px-6 sm:px-8 py-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setPasswordOpen(false)}
              disabled={passwordSaving}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] text-[#737373] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {CloseModal}
            </button>

            <h2 className="text-[18px] font-semibold text-[#111827]">Change Password</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">Use a strong password you don’t use elsewhere.</p>

            {passwordError ? (
              <div className="mt-4 rounded-xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                {passwordError}
              </div>
            ) : null}
            {passwordSuccess ? (
              <div className="mt-4 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                {passwordSuccess}
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              <Field
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Current password"
              />
              <Field
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="New password"
              />
              <Field
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />

              <div className="pt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={passwordSaving}
                  onClick={() => setPasswordOpen(false)}
                  className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={passwordSaving}
                  onClick={async () => {
                    setPasswordError("");
                    setPasswordSuccess("");
                    const currentPassword = String(passwordForm.currentPassword || "");
                    const newPassword = String(passwordForm.newPassword || "");
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
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {SaveIcon}
                  {passwordSaving ? "Saving..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
export default ProfilePage;
