// components/admin/RoleDelegation.tsx
"use client";
import React, { useState, useEffect } from "react";

type User = {
    _id: string;
    name: string;
    email: string;
    role: string;
};

export default function RoleDelegation() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const roles = [
        { value: "user", label: "User" },
        { value: "captain", label: "Captain" },
        { value: "vicecaptain", label: "Vice Captain" },
        { value: "scorer", label: "Scorer" },
        { value: "admin", label: "Admin" }
    ];

    useEffect(() => {
        // Fetch all users
        fetch("/api/users")
            .then(r => r.json())
            .then(data => setUsers(data))
            .catch(err => console.error("Failed to fetch users:", err));
    }, []);

    const handleRoleChange = async () => {
        if (!selectedUserId || !selectedRole) {
            setError("Please select both user and role");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/user/role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: selectedUserId, role: selectedRole })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update role");
            }

            setMessage(`Role updated successfully for ${data.user.name}`);

            // Update local users list
            setUsers(users.map(u => u._id === data.user._id ? data.user : u));

            // Reset selections
            setSelectedUserId("");
            setSelectedRole("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedUser = users.find(u => u._id === selectedUserId);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Role Delegation</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                As an admin, you can assign roles to users.
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
            )}

            {message && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-300">{message}</p>
                </div>
            )}

            <div className="space-y-4">
                {/* User Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2">Select User</label>
                    <select
                        value={selectedUserId}
                        onChange={(e) => {
                            setSelectedUserId(e.target.value);
                            const user = users.find(u => u._id === e.target.value);
                            if (user) setSelectedRole(user.role);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Select a user --</option>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>
                                {user.name} ({user.email}) - Current: {user.role}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Role Selection */}
                {selectedUserId && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Assign Role</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            {roles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Current Role Display */}
                {selectedUser && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Current Role: <span className="font-semibold capitalize text-slate-900 dark:text-white">{selectedUser.role}</span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            New Role: <span className="font-semibold capitalize text-slate-900 dark:text-white">{selectedRole}</span>
                        </div>
                    </div>
                )}

                {/* Update Button */}
                <button
                    onClick={handleRoleChange}
                    disabled={loading || !selectedUserId || !selectedRole || selectedUser?.role === selectedRole}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                    {loading ? "Updating..." : "Update Role"}
                </button>
            </div>
        </div>
    );
}
