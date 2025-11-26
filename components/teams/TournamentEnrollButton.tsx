"use client";

import { useState, useEffect } from "react";

interface TournamentEnrollButtonProps {
    teamId: string;
    teamName: string;
}

interface Tournament {
    _id: string;
    name: string;
    status: string;
    enrollmentDeadline?: string;
}

export default function TournamentEnrollButton({
    teamId,
    teamName,
}: TournamentEnrollButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournament, setSelectedTournament] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (showModal) {
            // Fetch open tournaments
            fetch("/api/tournaments")
                .then((res) => res.json())
                .then((data) => {
                    const openTournaments = data.filter(
                        (t: Tournament) => t.status === "upcoming",
                    );
                    setTournaments(openTournaments);
                })
                .catch((err) => console.error(err));
        }
    }, [showModal]);

    async function handleEnroll() {
        if (!selectedTournament) {
            alert("Please select a tournament");
            return;
        }

        setBusy(true);
        try {
            const res = await fetch(
                `/api/tournaments/${selectedTournament}/teams/enroll`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ teamId }),
                },
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to enroll");
            }

            alert("Enrollment request submitted! Awaiting admin approval.");
            setShowModal(false);
            setSelectedTournament("");
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to enroll in tournament");
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                Enroll in Tournament
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Enroll in Tournament</h2>
                        <p className="text-sm text-gray-600 mb-4">Team: {teamName}</p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Tournament
                            </label>
                            <select
                                value={selectedTournament}
                                onChange={(e) => setSelectedTournament(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            >
                                <option value="">-- Select a tournament --</option>
                                {tournaments.map((t) => (
                                    <option key={t._id} value={t._id}>
                                        {t.name}
                                        {t.enrollmentDeadline &&
                                            ` (Deadline: ${new Date(t.enrollmentDeadline).toLocaleDateString()})`}
                                    </option>
                                ))}
                            </select>
                            {tournaments.length === 0 && (
                                <p className="mt-2 text-sm text-gray-500">
                                    No open tournaments available for enrollment.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedTournament("");
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEnroll}
                                disabled={busy || !selectedTournament}
                                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {busy ? "Enrolling..." : "Enroll"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
