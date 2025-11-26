"use client";

import { useState } from "react";

interface TeamEditFormProps {
    team: any;
    onCancel: () => void;
    onSave: () => void;
}

export default function TeamEditForm({
    team,
    onCancel,
    onSave,
}: TeamEditFormProps) {
    const [players, setPlayers] = useState(team.players || []);
    const [busy, setBusy] = useState(false);

    function addPlayer() {
        setPlayers([
            ...players,
            {
                playerId: `player-${Date.now()}`,
                name: "",
                role: "batsman",
                isExtra: false,
            },
        ]);
    }

    function updatePlayer(index: number, field: string, value: any) {
        const updated = [...players];
        updated[index] = { ...updated[index], [field]: value };
        setPlayers(updated);
    }

    function removePlayer(index: number) {
        setPlayers(players.filter((_: any, i: number) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);

        const activePlayers = players.filter((p: any) => !p.isExtra);
        if (activePlayers.length < 11) {
            alert("Team must have at least 11 active players");
            setBusy(false);
            return;
        }

        try {
            const res = await fetch(`/api/teams/${team._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ players }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update team");
            }

            onSave();
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to update team");
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Players</h3>

            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {players.map((player: any, idx: number) => (
                    <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded"
                    >
                        <input
                            type="text"
                            placeholder="Player Name"
                            value={player.name}
                            onChange={(e) => updatePlayer(idx, "name", e.target.value)}
                            className="col-span-4 px-2 py-1 border rounded text-sm"
                            required
                        />
                        <select
                            value={player.role}
                            onChange={(e) => updatePlayer(idx, "role", e.target.value)}
                            className="col-span-3 px-2 py-1 border rounded text-sm"
                        >
                            <option value="batsman">Batsman</option>
                            <option value="bowler">Bowler</option>
                            <option value="allrounder">All-rounder</option>
                            <option value="keeper">Keeper</option>
                        </select>
                        <label className="col-span-3 flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={player.isExtra}
                                onChange={(e) => updatePlayer(idx, "isExtra", e.target.checked)}
                            />
                            Extra Player
                        </label>
                        <button
                            type="button"
                            onClick={() => removePlayer(idx)}
                            className="col-span-2 px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addPlayer}
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
                + Add Player
            </button>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={busy}
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {busy ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
