"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminDonorByKey, updateAdminDonor } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

function normalizeStr(v) {
  const s = String(v ?? "").trim();
  return s;
}

export default function EditDonorProfileModal({ open, donorKey, donor, onClose, onSaved }) {
  const toast = useToast();
  const donorLabel = useMemo(() => String(donor?.name || donor?.email || donorKey || "Donor"), [donor, donorKey]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");

  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [streetName, setStreetName] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(false);
    setError("");

    setName(normalizeStr(donor?.name));
    setFirstName(normalizeStr(donor?.firstName));
    setLastName(normalizeStr(donor?.lastName));
    setPhone(normalizeStr(donor?.phone));
    setOrganization(normalizeStr(donor?.organization));

    setLine1(normalizeStr(donor?.address?.line1));
    setCity(normalizeStr(donor?.address?.city));
    setState(normalizeStr(donor?.address?.state));
    setPostalCode(normalizeStr(donor?.address?.postalCode));
    setStreetName(normalizeStr(donor?.address?.streetName));
    setCountry(normalizeStr(donor?.address?.country));
  }, [open, donor]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    const key = normalizeStr(donorKey);
    if (!key) {
      setError("Missing donor key.");
      return;
    }

    const payload = {};

    const n = normalizeStr(name);
    const fn = normalizeStr(firstName);
    const ln = normalizeStr(lastName);
    const ph = normalizeStr(phone);
    const org = normalizeStr(organization);

    if (n) payload.name = n;
    if (ph) payload.phone = ph;
    if (org) payload.organization = org;
    if (fn) payload.firstName = fn;
    if (ln) payload.lastName = ln;

    const addr = {};
    if (normalizeStr(line1)) addr.line1 = normalizeStr(line1);
    if (normalizeStr(city)) addr.city = normalizeStr(city);
    if (normalizeStr(postalCode)) addr.postalCode = normalizeStr(postalCode);
    if (normalizeStr(state)) addr.state = normalizeStr(state);
    if (normalizeStr(streetName)) addr.streetName = normalizeStr(streetName);
    if (normalizeStr(country)) addr.country = normalizeStr(country);
    if (Object.keys(addr).length > 0) payload.address = addr;

    if (Object.keys(payload).length === 0) {
      setError("No changes to save.");
      return;
    }

    setLoading(true);
    try {
      await updateAdminDonor(key, payload);
      const fresh = await getAdminDonorByKey(key);
      const wrapped = fresh?.data && typeof fresh.data === "object" && !Array.isArray(fresh.data) ? fresh.data : fresh;
      const freshObj = wrapped?.donor && typeof wrapped.donor === "object" ? wrapped.donor : wrapped;
      toast.success("Profile updated");
      onSaved?.(freshObj);
      onClose?.();
    } catch (e2) {
      const msg = e2?.message || "Update failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <button type="button" aria-label="Close modal overlay" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="hc-animate-dropdown relative w-full max-w-[760px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">Edit Profile</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">{donorLabel}</div>
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

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Full Name</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
              </div>
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Phone</div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">First Name</div>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
              </div>
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Last Name</div>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Organization</div>
              <input
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              />
            </div>

            <div className="pt-1 text-[13px] font-semibold text-[#111827]">Address</div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Line 1</div>
              <input
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">City</div>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
              </div>
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">State</div>
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
              </div>
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Postal Code</div>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Street Name</div>
                <input
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
              </div>
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Country</div>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
