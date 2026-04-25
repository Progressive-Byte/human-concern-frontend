import DashboardHeader from "../components/DashboardHeader";

// Static placeholder — wire to the user API later (and convert to a client form).
const profile = {
  fullName: "Ahmed Khan",
  email: "ahmed@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main St, New York, NY",
  preferences: {
    newsletter: true,
    receipts: true,
    smsAlerts: false,
  },
};

function Field({ label, value }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase">
        {label}
      </label>
      <input
        type="text"
        defaultValue={value}
        readOnly
        className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <>
      <DashboardHeader
        title="Profile"
        subtitle="Your personal information and preferences"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Edit Profile
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Identity */}
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white text-lg font-semibold">
              {profile.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{profile.fullName}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>
        </section>

        {/* Personal info */}
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Personal information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Full name" value={profile.fullName} />
            <Field label="Email"     value={profile.email} />
            <Field label="Phone"     value={profile.phone} />
            <Field label="Address"   value={profile.address} />
          </div>
        </section>

        {/* Preferences */}
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Communication preferences</h2>
          <ul className="divide-y divide-gray-100">
            {[
              { key: "newsletter", label: "Email newsletter",        desc: "Monthly updates on campaigns and impact." },
              { key: "receipts",   label: "Email donation receipts", desc: "Get a receipt every time you donate." },
              { key: "smsAlerts",  label: "SMS alerts",              desc: "Reminders for scheduled donations." },
            ].map((p) => (
              <li key={p.key} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.label}</p>
                  <p className="text-xs text-gray-500">{p.desc}</p>
                </div>
                <span
                  className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
                    profile.preferences[p.key] ? "bg-gray-900" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      profile.preferences[p.key] ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
