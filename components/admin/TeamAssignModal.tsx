"use client";

import { useState, useEffect } from "react";

interface TeamAssignModalProps {
    team: any;
    onClose: () => void;
    onSave: () => void;
}

interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
}

export default function TeamAssignModal({
    team,
    onClose,
    onSave,
}: TeamAssignModalProps) {
    const [captainEmail, setCaptainEmail] = useState(
        team.captainId?.email || "",
    );
    const [viceCaptainEmail, setViceCaptainEmail] = useState(
        team.viceCaptainId?.email || "",
    );
    const [users, setUsers] = useState<User[]>([]);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        // Fetch users with captain/vicecaptain roles
        fetch("/api/admin/users")
            .then((res) => res.json())
            .then((data) => {
                const captainUsers = data.filter(
                    (u: User) => u.role === "captain" || u.role === "vicecaptain",
                );
                setUsers(captainUsers);
            })
            .catch((err) => console.error(err));
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);

        try {
            const res = await fetch(`/api/teams/${team._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    captainEmail: captainEmail || null,
                    viceCaptainEmail: viceCaptainEmail || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to assign captain/vice-captain");
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to assign captain/vice-captain");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">
                    Assign Captain/Vice-Captain
                </h2>
                <p className="text-sm text-gray-600 mb-4">Team: {team.name}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Captain
                        </label>
                        <select
                            value={captainEmail}
                            onChange={(e) => setCaptainEmail(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        >
                            <option value="">-- None --</option>
                            {users
                                .filter((u) => u.role === "captain")
                                .map((u) => (
                                    <option key={u._id} value={u.email}>
                                        {u.name || u.email} ({u.email})
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vice Captain
                        </label>
                        <select
                            value={viceCaptainEmail}
                            onChange={(e) => setViceCaptainEmail(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        >
                            <option value="">-- None --</option>
                            {users
                                .filter((u) => u.role === "vicecaptain")
                                .map((u) => (
                                    <option key={u._id} value={u.email}>
                                        {u.name || u.email} ({u.email})
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={busy}
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {busy ? "Saving..." : "Assign"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
