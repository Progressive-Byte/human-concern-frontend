"use client";

import { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { BellIcon, LockIcon, SaveIcon, UserIcon } from "@/components/common/SvgIcon";
import UserToggle from "@/components/ui/UserToggle";
import Field from "@/components/ui/Field";
import OutlineButton from "@/components/ui/OutlineButton";
import UserSectionHeader from "@/components/ui/UserSectionHeader";

const ProfilePage = () => {
  const [form, setForm] = useState({
    firstName: "Ahmed",
    lastName:  "Hassan",
    email:     "ahmed.h@email.com",
    phone:     "+1 555 123 4567",
  });

  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    donationReceipts:   true,
    campaignUpdates:    false,
  });

  const set     = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setPref = (key) => (val) => setPrefs((p) => ({ ...p, [key]: val }));

  return (
    <>
      <DashboardHeader
        title="Profile Settings"
        subtitle="Manage your account information and preferences"
      />

      <div className="flex-1 p-4 md:p-6 space-y-5">

        {/* Personal Information */}
        <section className="bg-white rounded-2xl border border-[#EBEBEB] p-5 md:p-6">
          <UserSectionHeader icon={UserIcon} title="Personal Information" variant="user" />

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" value={form.firstName} onChange={set("firstName")} />
              <Field label="Last Name"  value={form.lastName}  onChange={set("lastName")} />
            </div>
            <Field label="Email Address" value={form.email} type="email" onChange={set("email")} />
            <Field label="Phone Number"  value={form.phone} type="tel"   onChange={set("phone")} />

            <div className="pt-1">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[#055A46] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#044035] transition-colors cursor-pointer"
              >
                {SaveIcon}
                Save Changes
              </button>
            </div>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="bg-white rounded-2xl border border-[#EBEBEB] p-5 md:p-6">
          <UserSectionHeader icon={BellIcon} title="Notification Preferences" variant="bell" />

          <div className="mt-4 space-y-2">
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
          </div>
        </section>

        {/* Security */}
        <section className="bg-white rounded-2xl border border-[#EBEBEB] p-5 md:p-6">
          <UserSectionHeader icon={LockIcon} title="Security" variant="lock" />

          <div className="mt-4 divide-y divide-[#F5F5F5]">
            <div className="flex items-center justify-between py-4">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-medium text-[#383838]">Password</p>
                <p className="text-xs text-[#8C8C8C] mt-0.5">Last changed 30 days ago</p>
              </div>
              <OutlineButton>Change Password</OutlineButton>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-medium text-[#383838]">Two-Factor Authentication</p>
                <p className="text-xs text-[#8C8C8C] mt-0.5">Add an extra layer of security</p>
              </div>
              <OutlineButton>Enable</OutlineButton>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="bg-white rounded-2xl border border-[#EA3335]/20 p-5 md:p-6">
          <h2 className="text-base font-semibold text-[#383838]">Account</h2>

          <div className="mt-4 flex items-center justify-between gap-4 px-4 py-4 rounded-xl bg-[#FFF5F5] border border-[#EA3335]/15">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#EA3335]">Deactivate Account</p>
              <p className="text-xs text-[#8C8C8C] mt-0.5">Temporarily archive your account and all data</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-[#383838] px-4 py-2 text-xs font-medium text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </section>

      </div>
    </>
  );
}
export default ProfilePage;