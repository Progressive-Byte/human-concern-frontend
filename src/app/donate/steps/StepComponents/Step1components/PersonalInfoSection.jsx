import Field from "@/components/ui/Field";
import PhoneField from "./PhoneField";

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
          className={`text-[12px] font-medium transition-colors cursor-pointer select-none ${
            hasEdited
              ? "text-[#EA3335] hover:underline"
              : "text-[#AEAEAE] opacity-60"
          }`}
        >
          {editMode ? "Save change" : "Edit change"}
        </button>
      )}
    </div>

    {isAuthenticated && !editMode && !isPreview && (
      <p className="text-[13px] text-[#055A46] bg-[#F0FAF7] border border-[#C3E8DC] rounded-xl px-4 py-2.5">
        Your account information has been pre-filled. Click <strong>Edit change</strong> to make changes.
      </p>
    )}

    <Field label="Organization" required placeholder="xyz ltd" {...personalField("organization")} />

    <div className="grid grid-cols-2 gap-4">
      <Field label="First Name" required placeholder="John" {...personalField("firstName")} />
      <Field label="Last Name"  required placeholder="Doe"  {...personalField("lastName")}  />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Email"            required type="email" placeholder="you@example.com" {...personalField("email")} />
      <Field label="Phone (Optional)" type="tel"            placeholder="1-800-583-5841"  {...personalField("phone")} />
    </div>
  </div>
);

export default PersonalInfoSection;
