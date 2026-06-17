import { BellIcon, SaveIcon } from "@/components/common/SvgIcon";
import UserSectionHeader from "@/components/ui/UserSectionHeader";
import UserToggle from "@/components/ui/UserToggle";
import { SkeletonStack } from "@/components/ui/Skeleton";

export function NotificationPrefsCard({ loading, savingPrefs, prefs, setPref, onSave }) {
  return (
    <section className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <UserSectionHeader icon={BellIcon} title="Notification Preferences" variant="bell" />

      <div className="mt-4 space-y-2">
        {loading ? (
          <SkeletonStack count={3} blockClass="h-12 rounded-xl" />
        ) : (
          <>
            <UserToggle
              label="Email Notifications"
              desc="Receive important updates via email"
              checked={prefs.emailNotifications}
              onChange={setPref("emailNotifications")}
            />
            <UserToggle
              label="Donation Receipts"
              desc="Receive email receipts for every donation"
              checked={prefs.donationReceipts}
              onChange={setPref("donationReceipts")}
            />
            <UserToggle
              label="Campaign Updates"
              desc="Get notified about campaign progress and impact"
              checked={prefs.campaignUpdates}
              onChange={setPref("campaignUpdates")}
            />
          </>
        )}
      </div>

      {!loading && (
        <div className="pt-4">
          <button
            type="button"
            disabled={savingPrefs}
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {SaveIcon}
            {savingPrefs ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      )}
    </section>
  );
}
