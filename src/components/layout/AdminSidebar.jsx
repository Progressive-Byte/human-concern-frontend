import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-full border-r border-gray-200 bg-white p-4 md:w-64">
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
