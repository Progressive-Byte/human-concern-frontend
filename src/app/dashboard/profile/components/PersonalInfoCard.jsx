import { useMemo } from "react";
import { Country, State, City } from "country-state-city";
import { UserIcon, SaveIcon } from "@/components/common/SvgIcon";
import UserSectionHeader from "@/components/ui/UserSectionHeader";
import Field from "@/components/ui/Field";
import PhoneField from "@/components/ui/PhoneField";
import CustomDropdown from "@/components/common/CustomDropdown";
import { SkeletonStack } from "@/components/ui/Skeleton";
import { resolveCountryIso, resolveStateIso } from "@/utils/isoHelpers";

const LABEL_CLASS = "text-[13px] font-medium text-[#111827] mb-1.5 block";

export function PersonalInfoCard({ loading, savingProfile, form, setField, setAddress, setAddressValue, onSave }) {
  const savedCountry = form.address?.country || "";
  const savedState   = form.address?.state || "";

  // Country/State/City use the same pickers as the donation form, so the saved values are
  // canonical names the donate step can resolve back into the right selections.
  // The picker codes are derived from the saved names — no local state to keep in sync.
  const countryCode = useMemo(() => resolveCountryIso(savedCountry) || "", [savedCountry]);
  const stateCode = useMemo(() => resolveStateIso(savedState, countryCode) || "", [savedState, countryCode]);

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
    []
  );
  const stateOptions = useMemo(
    () => (countryCode ? State.getStatesOfCountry(countryCode).map((s) => ({ value: s.isoCode, label: s.name })) : []),
    [countryCode]
  );
  const cityOptions = useMemo(
    () => (countryCode && stateCode
      ? City.getCitiesOfState(countryCode, stateCode).map((c) => ({ value: c.name, label: c.name }))
      : []),
    [countryCode, stateCode]
  );

  const handleCountryChange = (isoCode) => {
    const country = Country.getCountryByCode(isoCode);
    setAddressValue("country", country?.name || "");
    setAddressValue("state", "");
    setAddressValue("city", "");
  };

  const handleStateChange = (isoCode) => {
    const state = State.getStateByCodeAndCountry(isoCode, countryCode);
    setAddressValue("state", state?.name || "");
    setAddressValue("city", "");
  };

  const handleCityChange = (cityName) => setAddressValue("city", cityName);

  const stateIsPicklist = Boolean(countryCode) && stateOptions.length > 0;
  const cityIsPicklist  = Boolean(stateCode) && cityOptions.length > 0;

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
            <PhoneField label="Phone Number" value={form.phone} onChange={setField("phone")} />

            <div className="pt-2">
              <p className="text-[13px] font-semibold text-[#111827]">Address</p>
              <p className="mt-1 text-[12px] text-[#6B7280]">Used for receipts and billing where applicable</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Address Line 1" value={form.address?.line1 || ""}      onChange={setAddress("line1")}      placeholder="12 Main St" />
              <Field label="Street Name"    value={form.address?.streetName || ""} onChange={setAddress("streetName")} placeholder="Main St" />

              <div>
                <label className={LABEL_CLASS}>Country</label>
                <CustomDropdown
                  variant="form"
                  options={countryOptions}
                  value={countryCode}
                  onChange={handleCountryChange}
                  placeholder="Select country"
                  label="Countries"
                  maxHeight="220px"
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>State</label>
                {stateIsPicklist ? (
                  <CustomDropdown
                    variant="form"
                    options={stateOptions}
                    value={stateCode}
                    onChange={handleStateChange}
                    placeholder="Select state"
                    label="States"
                    maxHeight="220px"
                  />
                ) : (
                  <Field
                    label=""
                    value={form.address?.state || ""}
                    onChange={setAddress("state")}
                    placeholder={countryCode ? "No states listed — type manually" : "Select country first"}
                    readOnly={!countryCode}
                  />
                )}
              </div>

              <div>
                <label className={LABEL_CLASS}>City</label>
                {cityIsPicklist ? (
                  <CustomDropdown
                    variant="form"
                    options={cityOptions}
                    value={form.address?.city || ""}
                    onChange={handleCityChange}
                    placeholder="Select city"
                    label="Cities"
                    maxHeight="220px"
                  />
                ) : (
                  <Field
                    label=""
                    value={form.address?.city || ""}
                    onChange={setAddress("city")}
                    placeholder={stateCode ? "No cities listed — type manually" : "Select state first"}
                    readOnly={!stateCode}
                  />
                )}
              </div>

              <Field label="Postal Code" value={form.address?.postalCode || ""} onChange={setAddress("postalCode")} placeholder="00000" />
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
