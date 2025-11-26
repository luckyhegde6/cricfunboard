"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

interface Team {
    _id: string;
    name: string;
}

interface Tournament {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    enrollmentStatus: string;
    teams: Team[];
    enrolledTeams: { teamId: string; status: string }[];
}

export default function TournamentDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: session } = useSession();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [myTeamId, setMyTeamId] = useState<string | null>(null);

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

        // Fetch user's team if captain
        if (session?.user?.role === "captain" || session?.user?.role === "vicecaptain") {
            // This is a simplified check. Ideally, we'd have an endpoint to get the user's team.
            // For now, we assume the user knows their team ID or we fetch it.
            // Let's assume we fetch it from a hypothetical /api/my-team endpoint or similar.
            // For this implementation, I'll add a simple fetch to get all teams and find the one where user is captain.
            fetch("/api/teams")
                .then((res) => res.json())
                .then((teams) => {
                    const myTeam = teams.find(
                        (t: any) =>
                            t.captainId === (session.user as any).id ||
                            t.viceCaptainId === (session.user as any).id
                    );
                    if (myTeam) setMyTeamId(myTeam._id);
                });
        }
    }, [id, session]);

    const handleEnroll = async () => {
        if (!myTeamId) return;
        setEnrolling(true);
        try {
            const res = await fetch(`/api/tournaments/${id}/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId: myTeamId }),
            });
            if (res.ok) {
                alert("Enrollment submitted successfully!");
                // Refresh tournament data
                const updated = await fetch(`/api/tournaments/${id}`).then((r) =>
                    r.json()
                );
                setTournament(updated);
            } else {
                const err = await res.json();
                alert(err.error || "Enrollment failed");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!tournament) return <div className="p-6">Tournament not found</div>;

    const isEnrolled =
        myTeamId &&
        tournament.enrolledTeams.some((t) => t.teamId === myTeamId);
    const enrollmentStatus =
        myTeamId &&
        tournament.enrolledTeams.find((t) => t.teamId === myTeamId)?.status;

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">{tournament.name}</h1>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium uppercase">
                        {tournament.status}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 mb-6">
                    <p>Start Date: {format(new Date(tournament.startDate), "PPP")}</p>
                    <p>End Date: {format(new Date(tournament.endDate), "PPP")}</p>
                    <p>Participating Teams: {tournament.teams.length}</p>
                    <p>Enrollment: {tournament.enrollmentStatus}</p>
                </div>

                <div className="flex gap-4">
                    <Link
                        href={`/tournaments/${id}/schedule`}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        View Schedule
                    </Link>

                    {session && ["captain", "vicecaptain"].includes(session.user.role) && myTeamId && (
                        <div className="flex items-center gap-2">
                            {isEnrolled ? (
                                <span className={`px-4 py-2 rounded border ${enrollmentStatus === 'approved' ? 'bg-green-50 border-green-200 text-green-700' :
                                        enrollmentStatus === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                                            'bg-yellow-50 border-yellow-200 text-yellow-700'
                                    }`}>
                                    Enrollment: {enrollmentStatus}
                                </span>
                            ) : tournament.enrollmentStatus === "open" ? (
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {enrolling ? "Enrolling..." : "Register Team"}
                                </button>
                            ) : (
                                <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded border">
                                    Enrollment Closed
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Standings / Teams List */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Teams</h2>
                    {tournament.teams.length > 0 ? (
                        <ul className="space-y-2">
                            {tournament.teams.map((team) => (
                                <li key={team._id} className="p-3 bg-gray-50 rounded">
                                    {team.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No teams confirmed yet.</p>
                    )}
                </div>

                {/* Recent/Upcoming Matches Preview */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Upcoming Matches</h2>
                    <p className="text-gray-500 mb-4">
                        Check the full schedule for details.
                    </p>
                    <Link
                        href={`/tournaments/${id}/schedule`}
                        className="text-blue-600 hover:underline"
                    >
                        Go to Schedule &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
