"use client";

import { useEffect, useMemo, useState } from "react";
import { createAdminSystemUser, updateAdminSystemUser } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { useAdminAuth } from "@/context/AdminAuthContext";

const UserUpsertModal = ({ open, mode, user, roles, onClose, onSuccess }) => {
  const toast = useToast();
  const { admin } = useAdminAuth();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("active");
  const [roleIds, setRoleIds] = useState([]);

  const isSelf = Boolean(isEdit && admin?.id && user?.id && String(admin.id) === String(user.id));
  const roleOptions = Array.isArray(roles) ? roles : [];

  const title = useMemo(() => (isEdit ? "Edit System User" : "Create System User"), [isEdit]);
  const primaryLabel = useMemo(() => (isEdit ? "Save Changes" : "Create User"), [isEdit]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);

    if (!isEdit) {
      setName("");
      setEmail("");
      setPassword("");
      setStatus("active");
      setRoleIds([]);
      return;
    }

    setName(String(user?.name || ""));
    setEmail(String(user?.email || ""));
    setPassword("");
    setStatus(String(user?.status || "active").toLowerCase() === "disabled" ? "disabled" : "active");
    setRoleIds(Array.isArray(user?.roles) ? user.roles.map((r) => String(r.id)).filter(Boolean) : []);
  }, [open, isEdit, user]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  function toggleRole(id) {
    setRoleIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmedName = String(name || "").trim();
    const trimmedEmail = String(email || "").trim();

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (!isEdit && String(password || "").length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const id = String(user?.id || "");
        if (!id) throw new Error("Missing user id.");

        const payload = { name: trimmedName, email: trimmedEmail };
        // The backend rejects self role/status changes, so don't send them for your own row.
        if (!isSelf) {
          payload.roleIds = roleIds;
          payload.status = status;
        }
        await updateAdminSystemUser(id, payload);
        toast.success("User updated");
      } else {
        await createAdminSystemUser({
          name: trimmedName,
          email: trimmedEmail,
          password,
          roleIds,
          status,
        });
        toast.success("User created");
      }

      onSuccess?.();
      onClose?.();
    } catch (e2) {
      const msg = e2?.message || "Something went wrong.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button type="button" aria-label="Close modal overlay" className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="hc-animate-dropdown relative max-h-[calc(100vh-32px)] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">{title}</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Platform accounts are separate from donors. Assign roles to control access.
            </div>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          {isSelf ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
              You cannot change your own roles or status.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="e.g. Sarah Khan"
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="name@example.org"
              />
            </div>

            {!isEdit ? (
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Initial Password</div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <div className="mt-1 text-[12px] text-[#6B7280]">Share this with the user; they can change it after signing in.</div>
              </div>
            ) : null}

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Roles</div>
              {roleOptions.length === 0 ? (
                <div className="text-[13px] text-[#6B7280]">No roles available.</div>
              ) : (
                <div className="max-h-[220px] space-y-2 overflow-y-auto rounded-xl border border-dashed border-[#E5E7EB] p-3">
                  {roleOptions.map((role) => (
                    <label
                      key={role.id || role.key}
                      className={`flex items-center gap-2 text-[13px] ${isSelf ? "cursor-not-allowed text-[#9CA3AF]" : "text-[#111827]"}`}
                    >
                      <input
                        type="checkbox"
                        disabled={isSelf}
                        checked={roleIds.includes(String(role.id))}
                        onChange={() => toggleRole(String(role.id))}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="font-medium">{role.name || role.key}</span>
                      <span className="text-[12px] text-[#9CA3AF]">{role.permissionKeys?.length || 0} permissions</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Status</div>
              <select
                value={status}
                disabled={isSelf}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Saving..." : primaryLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserUpsertModal;
