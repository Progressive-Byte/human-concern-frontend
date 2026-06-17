"use client";

import { CloseModal, SaveIcon } from "@/components/common/SvgIcon";
import Field from "@/components/ui/Field";

export function ChangePasswordModal({ saving, error, success, form, onFormChange, onClose, onSave }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div className="relative w-full max-w-[520px] bg-white rounded-[24px] px-6 sm:px-8 py-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] text-[#737373] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {CloseModal}
        </button>

        <h2 className="text-[18px] font-semibold text-[#111827]">Change Password</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">Use a strong password you don't use elsewhere.</p>

        {error ? (
          <div className="mt-4 rounded-xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <Field
            label="Current Password"
            type="password"
            value={form.currentPassword}
            onChange={onFormChange("currentPassword")}
            placeholder="Current password"
          />
          <Field
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={onFormChange("newPassword")}
            placeholder="New password"
          />
          <Field
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={onFormChange("confirmPassword")}
            placeholder="Confirm new password"
          />

          <div className="pt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onSave}
              className="inline-flex items-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {SaveIcon}
              {saving ? "Saving..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
