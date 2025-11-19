// app/match/[id]/page.tsx
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

type MatchSummary = {
  _id: string; teamA: string; teamB: string; score: string; overs: string;
};

export default function MatchPage({ params }: { params: { id: string } }) {
  const [match, setMatch] = useState<MatchSummary | null>(null);
  useEffect(() => {
    let socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000");
    socket.emit("join", { matchId: params.id });
    socket.on("match:update", (payload: MatchSummary) => setMatch(payload));
    // initial fetch
    fetch(`/api/matches/${params.id}`).then(r => r.json()).then(setMatch);
    return () => { socket.disconnect(); };
  }, [params.id]);

  if (!match) return <div>Loading…</div>;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{match.teamA} vs {match.teamB}</h1>
      <div className="mt-2">
        <span className="text-lg">{match.score}</span> • <span>{match.overs} overs</span>
      </div>
    </div>
  );
}
