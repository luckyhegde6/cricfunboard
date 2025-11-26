"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { format } from "date-fns";

interface Tournament {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    enrollmentStatus: string;
    teams: any[];
    enrolledTeams: any[];
}

export default function AdminTournamentDashboard({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/tournaments/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setTournament(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!tournament) return <div className="p-6">Tournament not found</div>;

    const pendingEnrollments = tournament.enrolledTeams.filter(
        (t) => t.status === "pending"
    ).length;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{tournament.name}</h1>
                <div className="space-x-4">
                    <Link
                        href={`/admin/tournaments/${id}/teams`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 relative"
                    >
                        Manage Teams
                        {pendingEnrollments > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {pendingEnrollments}
                            </span>
                        )}
                    </Link>
                    <Link
                        href={`/admin/tournaments/${id}/schedule`}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Schedule Matches
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Status</h3>
                    <p className="text-2xl font-bold mt-2 capitalize">{tournament.status}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Teams</h3>
                    <p className="text-2xl font-bold mt-2">{tournament.teams.length}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">
                        Enrollment
                    </h3>
                    <p className="text-2xl font-bold mt-2 capitalize">
                        {tournament.enrollmentStatus}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-gray-500 text-sm">Start Date</span>
                        <span>{format(new Date(tournament.startDate), "PPP")}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500 text-sm">End Date</span>
                        <span>{format(new Date(tournament.endDate), "PPP")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
