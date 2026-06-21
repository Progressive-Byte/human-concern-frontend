import { UserIcon, SaveIcon } from "@/components/common/SvgIcon";
import UserSectionHeader from "@/components/ui/UserSectionHeader";
import Field from "@/components/ui/Field";
import { SkeletonStack } from "@/components/ui/Skeleton";

export function PersonalInfoCard({ loading, savingProfile, form, setField, setAddress, onSave }) {
  return (
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
              <Field label="Last Name"  value={form.lastName}  onChange={setField("lastName")}  placeholder="Last name" />
            </div>

            <Field label="Email Address" value={form.email} type="email" readOnly />
            <Field label="Phone Number"  value={form.phone} type="tel" onChange={setField("phone")} placeholder="+1 555..." />

            <div className="pt-2">
              <p className="text-[13px] font-semibold text-[#111827]">Address</p>
              <p className="mt-1 text-[12px] text-[#6B7280]">Used for receipts and billing where applicable</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Address Line 1" value={form.address?.line1 || ""}      onChange={setAddress("line1")}      placeholder="12 Main St" />
              <Field label="Street Name"    value={form.address?.streetName || ""} onChange={setAddress("streetName")} placeholder="Main St" />
              <Field label="City"           value={form.address?.city || ""}       onChange={setAddress("city")}       placeholder="City" />
              <Field label="State"          value={form.address?.state || ""}      onChange={setAddress("state")}      placeholder="State" />
              <Field label="Postal Code"    value={form.address?.postalCode || ""} onChange={setAddress("postalCode")} placeholder="00000" />
              <Field label="Country"        value={form.address?.country || ""}    onChange={setAddress("country")}    placeholder="Country" />
            </div>

            <div className="pt-1">
              <button
                type="button"
                disabled={savingProfile}
                onClick={onSave}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {SaveIcon}
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
