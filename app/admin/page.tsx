// app/admin/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminSidebar from "@/components/AdminSidebar";
import UsersList from "@/components/UsersList";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== "admin") {
    return <div className="p-6">Access denied</div>;
  }

  return (
    <div className="flex gap-6">
      <AdminSidebar />
      <div className="flex-1">
        <UsersList />
      </div>
    </div>
  );
}
