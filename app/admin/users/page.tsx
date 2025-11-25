"use client";

import UsersList from "@/components/UsersList";

export default function AdminUsersPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
            <UsersList />
        </div>
    );
}
