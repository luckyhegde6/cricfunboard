// components/CreateMatchForm.tsx
"use client";
import type React from "react";
import { useState } from "react";

export default function CreateMatchForm() {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg(null);
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ teamA, teamB, venue, startTime }),
    });
    if (!res.ok) {
      const err = await res.json();
      setStatusMsg(`Error: ${JSON.stringify(err)}`);
      return;
    }
    setStatusMsg("Match created");
    setTeamA("");
    setTeamB("");
    setVenue("");
    setStartTime("");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          required
          value={teamA}
          onChange={(e) => setTeamA(e.target.value)}
          placeholder="Team A"
          className="p-2 border rounded"
        />
        <input
          required
          value={teamB}
          onChange={(e) => setTeamB(e.target.value)}
          placeholder="Team B"
          className="p-2 border rounded"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Venue"
          className="p-2 border rounded"
        />
        <input
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          type="datetime-local"
          className="p-2 border rounded"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 text-white rounded"
        >
          Create
        </button>
        {statusMsg && <div className="text-sm text-slate-600">{statusMsg}</div>}
      </div>
    </form>
  );
}
