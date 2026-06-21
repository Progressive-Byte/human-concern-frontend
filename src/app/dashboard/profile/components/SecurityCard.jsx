import { LockIcon } from "@/components/common/SvgIcon";
import UserSectionHeader from "@/components/ui/UserSectionHeader";
import OutlineButton from "@/components/ui/OutlineButton";

export function SecurityCard({ onChangePassword }) {
  return (
    <section className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <UserSectionHeader icon={LockIcon} title="Security" variant="lock" />

      <div className="mt-4 divide-y divide-[#E5E7EB]">
        <div className="flex items-center justify-between py-4">
          <div className="min-w-0 pr-4">
            <p className="text-sm font-medium text-[#111827]">Password</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Update your account password</p>
          </div>
          <OutlineButton onClick={onChangePassword}>Change Password</OutlineButton>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="min-w-0 pr-4">
            <p className="text-sm font-medium text-[#111827]">Two-Factor Authentication</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Add an extra layer of security</p>
          </div>
          <OutlineButton>Enable</OutlineButton>
        </div>
      </div>
    </section>
  );
}
