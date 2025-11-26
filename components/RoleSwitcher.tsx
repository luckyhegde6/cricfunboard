"use client";

import { useSession } from "next-auth/react";

export default function RoleSwitcher() {
    const { data: session, update } = useSession();

    // Only show if the user was originally an admin
    if (session?.user?.originalRole !== "admin") {
        return null;
    }

    const roles = ["admin", "captain", "vicecaptain", "scorer", "user"];

    const handleRoleChange = async (newRole: string) => {
        await update({ role: newRole });
        window.location.reload(); // Reload to reflect permission changes
    };

    return (
        <div className="flex items-center gap-2 ml-4 border-l pl-4">
            <span className="text-xs text-gray-500 uppercase font-bold">View As:</span>
            <select
                value={session.user.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
                {roles.map((role) => (
                    <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                ))}
            </select>
        </div>
    );
}
