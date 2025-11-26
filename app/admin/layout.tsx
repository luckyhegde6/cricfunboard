import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || (session as any).user?.role !== "admin") {
        return <div className="p-6">Access denied</div>;
    }

    return (
        <div className="flex gap-6 min-h-screen">
            <AdminSidebar />
            <div className="flex-1 bg-gray-50 p-6">{children}</div>
        </div>
    );
}
