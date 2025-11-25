"use client";

import { useEffect, useState, use } from "react";
import { format } from "date-fns";

interface Team {
    _id: string;
    name: string;
}

interface Enrollment {
    teamId: string;
    status: string;
    enrolledAt: string;
    teamDetails?: Team; // Populated manually
}

interface Tournament {
    _id: string;
    teams: Team[];
    enrolledTeams: Enrollment[];
}

export default function AdminTeamManagementPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [tourRes, teamsRes] = await Promise.all([
                fetch(`/api/tournaments/${id}`),
                fetch("/api/teams"),
            ]);
            const tourData = await tourRes.json();
            const teamsData = await teamsRes.json();

            // Map team details to enrollments
            tourData.enrolledTeams = tourData.enrolledTeams.map((enrollment: any) => ({
                ...enrollment,
                teamDetails: teamsData.find((t: any) => t._id === enrollment.teamId),
            }));

            setTournament(tourData);
            setAllTeams(teamsData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleStatusUpdate = async (teamId: string, status: string) => {
        try {
            const res = await fetch(
                `/api/tournaments/${id}/teams/${teamId}/status`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status }),
                }
            );
            if (res.ok) {
                fetchData(); // Refresh data
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!tournament) return <div className="p-6">Tournament not found</div>;

    const pendingEnrollments = tournament.enrolledTeams.filter(
        (e) => e.status === "pending"
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Manage Teams</h1>

            {/* Pending Enrollments */}
            {pendingEnrollments.length > 0 && (
                <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-yellow-800 mb-4">
                        Pending Enrollments
                    </h2>
                    <div className="space-y-4">
                        {pendingEnrollments.map((enrollment) => (
                            <div
                                key={enrollment.teamId}
                                className="flex justify-between items-center bg-white p-4 rounded shadow-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {enrollment.teamDetails?.name || "Unknown Team"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Applied: {format(new Date(enrollment.enrolledAt), "PP")}
                                    </p>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        onClick={() =>
                                            handleStatusUpdate(enrollment.teamId, "approved")
                                        }
                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleStatusUpdate(enrollment.teamId, "rejected")
                                        }
                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Participating Teams */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Participating Teams</h2>
                {tournament.teams.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {tournament.teams.map((team) => (
                            <li key={team._id} className="py-3 flex justify-between items-center">
                                <span>{team.name}</span>
                                <button
                                    onClick={() => handleStatusUpdate(team._id, "rejected")}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No teams added yet.</p>
                )}
            </div>
        </div>
    );
}
