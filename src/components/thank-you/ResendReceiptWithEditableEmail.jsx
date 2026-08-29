"use client";

import { useState } from "react";
import { apiRequest } from "@/services/api";
import { EmailIcon, Spinner, CircleCheckIcon } from "@/components/common/SvgIcon";
import { validateEmail } from "@/utils/validateEmail";

const ResendReceiptWithEditableEmail = ({
  donationId,
  initialEmail = "",
  className = "",
}) => {
  const [email, setEmail] = useState(initialEmail || "");
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(initialEmail || "");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleEdit = () => {
    setEditDraft(email);
    setIsEditing(true);
    setError("");
    setSuccessMsg("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError("");
  };

  const handleSaveEdit = () => {
    const trimmed = String(editDraft || "").trim();
    if (validateEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setEmail(trimmed);
    setIsEditing(false);
    setError("");
  };

  const handleResend = async () => {
    const trimmed = String(email || "").trim();
    if (!donationId) {
      setError("Missing donation reference.");
      return;
    }
    if (validateEmail(trimmed)) {
      setError("Please enter a valid email address first.");
      setIsEditing(true);
      setEditDraft(trimmed);
      return;
    }
    setStatus("loading");
    setError("");
    setSuccessMsg("");
    try {
      await apiRequest("receipt/resend", {
        method: "POST",
        body: JSON.stringify({ donationId, email: trimmed }),
      });
      setStatus("success");
      setSuccessMsg("Receipt sent. Check your inbox.");
      setTimeout(() => {
        setStatus("idle");
        setSuccessMsg("");
      }, 4000);
    } catch (e) {
      setStatus("error");
      setError(e?.message || "Could not resend receipt. Please try again.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className={`w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="text-gray-500">{EmailIcon}</div>
        <h3 className="text-[13px] font-semibold uppercase tracking-widest text-gray-500">
          Donation Receipt
        </h3>
      </div>

      <div className="space-y-3">
        {isEditing ? (
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-gray-600">Email Address</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                placeholder="donor@example.com"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-[13px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
              <button
                type="button"
                onClick={handleSaveEdit}
                className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-[12px] font-semibold text-white transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="shrink-0 rounded-xl border border-gray-200 hover:bg-gray-50 px-4 py-2.5 text-[12px] font-semibold text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-0.5">
                Sent to
              </p>
              <p className="text-[13px] font-semibold text-gray-800 truncate" title={email}>
                {email || "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleEdit}
              className="shrink-0 rounded-xl border border-gray-200 hover:bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-600 transition-colors"
            >
              Edit
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-700 font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-2">
            <span className="text-emerald-600">{CircleCheckIcon}</span>
            <span className="text-[12px] text-emerald-700 font-medium">{successMsg}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#EA3335] hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed px-4 py-3 text-[13px] font-semibold text-white transition-colors active:scale-[0.98]"
        >
          {status === "loading" ? (
            <>
              <span className="text-white">{Spinner}</span>
              Sending...
            </>
          ) : (
            <>Resend Receipt</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResendReceiptWithEditableEmail;
