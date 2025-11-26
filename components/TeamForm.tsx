// components/TeamForm.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Player = {
  name: string;
  role: "batsman" | "bowler" | "allrounder" | "keeper";
  isExtra: boolean;
  email?: string;
  contact?: string;
};

type TeamFormData = {
  name: string;
  players: Player[];
  contactEmail?: string;
  contactPhone?: string;
};

export default function TeamForm({
  initialData,
}: {
  initialData?: TeamFormData;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(initialData?.name || "");
  const [contactEmail, setContactEmail] = useState(
    initialData?.contactEmail || "",
  );
  const [contactPhone, setContactPhone] = useState(
    initialData?.contactPhone || "",
  );

  const [players, setPlayers] = useState<Player[]>(
    initialData?.players || [{ name: "", role: "batsman", isExtra: false }],
  );

  const addPlayer = () => {
    setPlayers([...players, { name: "", role: "batsman", isExtra: false }]);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayer = (index: number, field: keyof Player, value: any) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const activePlayers = players.filter((p) => !p.isExtra);
      if (activePlayers.length < 11) {
        throw new Error(
          `Team must have at least 11 active players (non-extras). Currently have ${activePlayers.length}.`,
        );
      }

      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, players, contactEmail, contactPhone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save team");
      }

      router.push("/teams");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Team Submission</h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Team Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Email (Optional)
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Phone (Optional)
          </label>
          <input
            type="text"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Players</h3>
          <button
            type="button"
            onClick={addPlayer}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Add Player
          </button>
        </div>

        {players.map((player, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-3 p-3 border rounded bg-slate-50 items-start md:items-center"
          >
            <div className="flex-1 w-full">
              <input
                placeholder="Player Name"
                value={player.name}
                onChange={(e) => updatePlayer(index, "name", e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                required
              />
            </div>
            <div className="w-full md:w-32">
              <select
                value={player.role}
                onChange={(e) => updatePlayer(index, "role", e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">All Rounder</option>
                <option value="keeper">Wicket Keeper</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={player.isExtra}
                  onChange={(e) =>
                    updatePlayer(index, "isExtra", e.target.checked)
                  }
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Extra
              </label>
              {players.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePlayer(index)}
                  className="text-red-500 hover:text-red-700 px-2"
                  title="Remove player"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !name || !contactEmail || players.filter(p => !p.isExtra).length < 11}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          title={
            !name
              ? "Team Name is required"
              : !contactEmail
                ? "Contact Email is required"
                : players.filter((p) => !p.isExtra).length < 11
                  ? `Need at least 11 active players (currently ${players.filter((p) => !p.isExtra).length})`
                  : "Submit Team"
          }
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          Submit Team
        </button>
      </div>
    </form>
  );
}
