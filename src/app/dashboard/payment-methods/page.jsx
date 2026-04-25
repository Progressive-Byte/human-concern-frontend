import DashboardHeader from "../components/DashboardHeader";

// Static placeholder — wire to API later.
const methods = [
  { id: 1, brand: "Visa",       last4: "4242", exp: "08/27", isDefault: true  },
  { id: 2, brand: "Mastercard", last4: "5555", exp: "11/26", isDefault: false },
  { id: 3, brand: "PayPal",     last4: null,   exp: null,    isDefault: false, email: "ahmed@example.com" },
];

function BrandBadge({ brand }) {
  const colors = {
    Visa: "bg-blue-50 text-blue-700",
    Mastercard: "bg-orange-50 text-orange-700",
    PayPal: "bg-indigo-50 text-indigo-700",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colors[brand] || "bg-gray-100 text-gray-700"}`}>
      {brand}
    </span>
  );
}

export default function PaymentMethodsPage() {
  return (
    <>
      <DashboardHeader
        title="Payment Methods"
        subtitle="Manage cards and accounts used for donations"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Method
          </button>
        }
      />

      <div className="flex-1 p-6">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {methods.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <BrandBadge brand={m.brand} />
                {m.isDefault && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                    Default
                  </span>
                )}
              </div>

              <div>
                {m.last4 ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      •••• •••• •••• {m.last4}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Expires {m.exp}</p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{m.email}</p>
                )}
              </div>

              <div className="mt-auto flex items-center gap-3 pt-2 border-t border-gray-100">
                {!m.isDefault && (
                  <button type="button" className="text-sm text-gray-700 hover:underline">
                    Set as default
                  </button>
                )}
                <button type="button" className="ml-auto text-sm text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
