"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import MatchEditModal from "@/components/admin/MatchEditModal";
import MatchStatusModal from "@/components/admin/MatchStatusModal";

export default function AdminMatchesPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMatch, setEditMatch] = useState<any>(null);
    const [statusMatch, setStatusMatch] = useState<{
        match: any;
        action: "cancel" | "abandon";
    } | null>(null);

    function loadMatches() {
        setLoading(true);
        fetch("/api/matches")
            .then((res) => res.json())
            .then((data) => {
                setMatches(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }

    useEffect(() => {
        loadMatches();
    }, []);

    if (loading) return <div className="p-6">Loading matches...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Matches</h1>
                <button
                    onClick={() => setEditMatch({})} // Empty object or null to trigger create mode
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Schedule Match
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Match
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date & Venue
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {matches.map((match) => (
                            <tr key={match._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {match.teamA} vs {match.teamB}
                                    </div>
                                    <div className="text-xs text-gray-500">{match.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {match.startTime
                                            ? format(new Date(match.startTime), "PP p")
                                            : "TBD"}
                                    </div>
                                    <div className="text-xs text-gray-500">{match.venue}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${match.status === "live"
                                                ? "bg-green-100 text-green-800"
                                                : match.status === "completed"
                                                    ? "bg-gray-100 text-gray-800"
                                                    : match.status === "cancelled" ||
                                                        match.status === "abandoned"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-blue-100 text-blue-800"
                                            }`}
                                    >
                                        {match.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => setEditMatch(match)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Edit
                                    </button>

                                    {match.status === "scheduled" && (
                                        <button
                                            onClick={() =>
                                                setStatusMatch({ match, action: "cancel" })
                                            }
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    {match.status === "live" && (
                                        <button
                                            onClick={() =>
                                                setStatusMatch({ match, action: "abandon" })
                                            }
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Abandon
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editMatch && (
                <MatchEditModal
                    match={editMatch._id ? editMatch : undefined}
                    onClose={() => setEditMatch(null)}
                    onSave={loadMatches}
                />
            )}

            {statusMatch && (
                <MatchStatusModal
                    match={statusMatch.match}
                    action={statusMatch.action}
                    onClose={() => setStatusMatch(null)}
                    onSave={loadMatches}
                />
            )}
        </div>
    );
}
