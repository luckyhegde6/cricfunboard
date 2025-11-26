"use client";

import { useEffect, useState } from "react";
import TeamAssignModal from "@/components/admin/TeamAssignModal";

interface Team {
    _id: string;
    name: string;
    players: any[];
    captainId?: { _id: string; email: string; name: string };
    viceCaptainId?: { _id: string; email: string; name: string };
    contactEmail?: string;
}

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignTeam, setAssignTeam] = useState<Team | null>(null);

    function loadTeams() {
        setLoading(true);
        fetch("/api/teams")
            .then((res) => res.json())
            .then((data) => {
                setTeams(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }

    useEffect(() => {
        loadTeams();
    }, []);

    if (loading) return <div className="p-6">Loading teams...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Teams</h1>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Team Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Captain
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vice Captain
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Players
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {teams.map((team) => (
                            <tr key={team._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {team.name}
                                    </div>
                                    {team.contactEmail && (
                                        <div className="text-xs text-gray-500">
                                            {team.contactEmail}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {team.captainId ? (
                                        <div>
                                            <div className="text-sm text-gray-900">
                                                {team.captainId.name || "N/A"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {team.captainId.email}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">Not assigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {team.viceCaptainId ? (
                                        <div>
                                            <div className="text-sm text-gray-900">
                                                {team.viceCaptainId.name || "N/A"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {team.viceCaptainId.email}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">Not assigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {team.players?.length || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setAssignTeam(team)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Assign Captain/VC
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {assignTeam && (
                <TeamAssignModal
                    team={assignTeam}
                    onClose={() => setAssignTeam(null)}
                    onSave={loadTeams}
                />
            )}
        </div>
    );
}
