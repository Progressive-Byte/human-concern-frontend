"use client";

import { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminHasPermission } from "@/utils/adminPermissions";
import { AlertIcon } from "@/components/common/SvgIcon";
import SystemUsersHeader from "./components/SystemUsersHeader";
import UsersTab from "./components/UsersTab";
import RolesTab from "./components/RolesTab";

const AdminSystemUsersPage = () => {
  const { admin } = useAdminAuth();
  const canReadUsers = adminHasPermission(admin, "users.read");
  const canReadRoles = adminHasPermission(admin, "roles.read");

  const [tab, setTab] = useState("users");

  if (!canReadUsers) {
    return (
      <main className="min-w-0 space-y-6 p-4 md:p-6">
        <div className="hc-animate-fade-up">
          <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">System Users</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">Permission required to view this page.</p>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-amber-800">
            You do not have the `users.read` permission to access this area.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <SystemUsersHeader tab={tab} onTabChange={setTab} showRolesTab={canReadRoles} />

      {tab === "roles" && canReadRoles ? <RolesTab /> : <UsersTab />}
    </main>
  );
};

export default AdminSystemUsersPage;
