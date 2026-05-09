"use client";

import { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { BellIcon, UserIcon } from "@/components/common/SvgIcon";

const LockIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const SaveIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);

const sections = {
  user:  { bg: "#ECF9F3", color: "#055A46" },
  bell:  { bg: "#FFF8EC", color: "#B45309" },
  lock:  { bg: "#EFF6FF", color: "#1D4ED8" },
};

function SectionHeader({ icon, title, variant = "user" }) {
  const { bg, color } = sections[variant];
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg, color }}
      >
        {icon}
      </span>
      <h2 className="text-base font-semibold text-[#383838]">{title}</h2>
    </div>
  );
}

function Field({ label, value, type = "text", onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#737373] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#EBEBEB] bg-white px-4 py-2.5 text-sm text-[#383838] placeholder:text-[#AEAEAE] focus:outline-none focus:border-[#055A46]/40 focus:ring-2 focus:ring-[#055A46]/10 transition"
      />
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-4 rounded-xl transition-colors ${
        checked ? "bg-[#ECF9F3]" : "bg-transparent"
      }`}
    >
      <div className="min-w-0 pr-4">
        <p className={`text-sm font-medium transition-colors ${checked ? "text-[#055A46]" : "text-[#383838]"}`}>
          {label}
        </p>
        <p className="text-xs text-[#8C8C8C] mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? "bg-[#055A46]" : "bg-[#DEDEDE]"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function OutlineButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-xl border border-[#EBEBEB] px-4 py-2 text-xs font-medium text-[#383838] hover:border-[#055A46]/40 hover:text-[#055A46] hover:bg-[#ECF9F3] transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

export default function ProfilePage() {
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
          <SectionHeader icon={UserIcon} title="Personal Information" variant="user" />

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
          <SectionHeader icon={BellIcon} title="Notification Preferences" variant="bell" />

          <div className="mt-4 space-y-2">
            <Toggle
              label="Email Notifications"
              desc="Receive important updates via email"
              checked={prefs.emailNotifications}
              onChange={setPref("emailNotifications")}
            />
            <Toggle
              label="Donation Receipts"
              desc="Receive email receipts for every donation"
              checked={prefs.donationReceipts}
              onChange={setPref("donationReceipts")}
            />
            <Toggle
              label="Campaign Updates"
              desc="Get notified about campaign progress and impact"
              checked={prefs.campaignUpdates}
              onChange={setPref("campaignUpdates")}
            />
          </div>
        </section>

        {/* Security */}
        <section className="bg-white rounded-2xl border border-[#EBEBEB] p-5 md:p-6">
          <SectionHeader icon={LockIcon} title="Security" variant="lock" />

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
