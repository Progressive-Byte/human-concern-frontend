import Field from "@/components/ui/Field";
import PhoneField from "@/components/ui/PhoneField";
import { EditIcon } from "@/components/common/SvgIcon";

const PersonalInfoSection = ({
  isAuthenticated,
  isPreview,
  editMode,
  hasEdited,
  onToggleEditMode,
  personalField,
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <p className="text-[13px] font-semibold text-[#383838]">Personal Information</p>
      {isAuthenticated && (
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors cursor-pointer select-none ${
            hasEdited
              ? "border-[#EA3335]/40 bg-[#FFF5F5] text-[#EA3335] hover:bg-[#FFEBEB]"
              : "border-[#E5E7EB] bg-white text-[#383838] hover:border-[#EA3335]/50 hover:text-[#EA3335]"
          }`}
        >
          {editMode ? null : (
            <span className="inline-flex h-4 w-4 items-center justify-center">{EditIcon}</span>
          )}
          {editMode ? "Save change" : "Edit change"}
        </button>
      )}
    </div>

    {isAuthenticated && !editMode && !isPreview && (
      <p className="text-[13px] text-[#055A46] bg-[#F0FAF7] border border-[#C3E8DC] rounded-xl px-4 py-2.5">
        These details are pre-filled from your account. If anything has changed, click{" "}
        <strong>Edit change</strong> to update it before continuing.
      </p>
    )}

    <Field label="Organization" required placeholder="xyz ltd" {...personalField("organization")} />

    <div className="grid grid-cols-2 gap-4">
      <Field label="First Name" required placeholder="John" {...personalField("firstName")} />
      <Field label="Last Name"  required placeholder="Doe"  {...personalField("lastName")}  />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Email" required type="email" placeholder="you@example.com" {...personalField("email")} />
      <PhoneField {...personalField("phone")} />
    </div>
  </div>
);

export default PersonalInfoSection;
