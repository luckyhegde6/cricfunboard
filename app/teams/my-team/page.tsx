"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeamEditForm from "@/components/teams/TeamEditForm";
import TournamentEnrollButton from "@/components/teams/TournamentEnrollButton";

interface Team {
    _id: string;
    name: string;
    players: any[];
    captainId?: { _id: string; email: string; name: string };
    viceCaptainId?: { _id: string; email: string; name: string };
    contactEmail?: string;
    contactPhone?: string;
}

interface EditPermission {
    canEdit: boolean;
    reason?: string;
    isAdmin?: boolean;
    isCaptain?: boolean;
    isViceCaptain?: boolean;
}

export default function MyTeamPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [team, setTeam] = useState<Team | null>(null);
    const [permission, setPermission] = useState<EditPermission | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
            return;
        }

        if (status === "authenticated") {
            // Fetch team where user is captain or vice-captain
            fetch(`/api/teams/my-team`)
                .then((res) => res.json())
                .then((teamData) => {
                    if (teamData && teamData._id) {
                        setTeam(teamData);
                        // Fetch edit permission
                        return fetch(`/api/teams/${teamData._id}/check-edit-permission`);
                    } else {
                        setLoading(false);
                        return null;
                    }
                })
                .then((res) => res ? res.json() : null)
                .then((permData) => {
                    if (permData) {
                        setPermission(permData);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [status, session, router]);

    if (loading) return <div className="p-6">Loading...</div>;

    if (!team) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">My Team</h1>
                <p className="text-gray-600">
                    You are not assigned to any team. Please contact an administrator.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{team.name}</h1>
                <div className="flex gap-3">
                    <TournamentEnrollButton teamId={team._id} teamName={team.name} />
                    {permission?.canEdit && !editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Edit Team
                        </button>
                    )}
                </div>
            </div>

            {!permission?.canEdit && permission?.reason && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> {permission.reason}
                    </p>
                </div>
            )}

            {editing ? (
                <TeamEditForm
                    team={team}
                    onCancel={() => setEditing(false)}
                    onSave={() => {
                        setEditing(false);
                        // Reload team data
                        fetch(`/api/teams/${team._id}`)
                            .then((res) => res.json())
                            .then((data) => setTeam(data));
                    }}
                />
            ) : (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Captain</h3>
                            <p className="mt-1">
                                {team.captainId?.name || team.captainId?.email || "Not assigned"}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                Vice Captain
                            </h3>
                            <p className="mt-1">
                                {team.viceCaptainId?.name ||
                                    team.viceCaptainId?.email ||
                                    "Not assigned"}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
                            <p className="mt-1">{team.contactEmail || "N/A"}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Contact Phone</h3>
                            <p className="mt-1">{team.contactPhone || "N/A"}</p>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-3">Players</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Name
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Role
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Type
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {team.players?.map((player, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2 text-sm">{player.name}</td>
                                        <td className="px-4 py-2 text-sm capitalize">
                                            {player.role}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            {player.isExtra ? (
                                                <span className="text-gray-500">Extra</span>
                                            ) : (
                                                <span className="text-green-600">Active</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
