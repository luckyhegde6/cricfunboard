"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

interface Tournament {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    enrollmentStatus: string;
}

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/tournaments")
            .then((res) => res.json())
            .then((data) => {
                setTournaments(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Tournaments</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => (
                    <Link
                        href={`/tournaments/${tournament._id}`}
                        key={tournament._id}
                        className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold">{tournament.name}</h2>
                            <span
                                className={`px-2 py-1 rounded text-xs font-medium uppercase ${tournament.status === "ongoing"
                                        ? "bg-green-100 text-green-800"
                                        : tournament.status === "completed"
                                            ? "bg-gray-100 text-gray-800"
                                            : "bg-blue-100 text-blue-800"
                                    }`}
                            >
                                {tournament.status}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                            <p>Start: {format(new Date(tournament.startDate), "PPP")}</p>
                            <p>End: {format(new Date(tournament.endDate), "PPP")}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-gray-500">
                                Enrollment: {tournament.enrollmentStatus}
                            </span>
                            <span className="text-blue-600 font-medium text-sm">
                                View Details &rarr;
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
