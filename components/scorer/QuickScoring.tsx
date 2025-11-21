// components/scorer/QuickScoring.tsx
import React, { useState } from "react";
import WicketModal from "./WicketModal";

type Player = {
    playerId: string;
    name: string;
    role: string;
};

type QuickScoringProps = {
    matchId: string;
    onScoreUpdate: () => void;
    battingTeam: string;
    bowlingTeam: string;
    teamA: string;
    teamB: string;
    teamAPlayers: Player[];
    teamBPlayers: Player[];
    currentBatters: { striker?: string; nonStriker?: string };
    currentBowler?: string;
    dismissedBatters: string[];
};

export default function QuickScoring({
    matchId,
    onScoreUpdate,
    battingTeam,
    bowlingTeam,
    teamA,
    teamB,
    teamAPlayers,
    teamBPlayers,
    currentBatters,
    currentBowler,
    dismissedBatters
}: QuickScoringProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Local state for selections
    const [striker, setStriker] = useState(currentBatters?.striker || "");
    const [nonStriker, setNonStriker] = useState(currentBatters?.nonStriker || "");
    const [bowler, setBowler] = useState(currentBowler || "");

    // Determine batting and bowling player lists
    const battingPlayers = battingTeam === teamA ? teamAPlayers : teamBPlayers;
    const bowlingPlayers = bowlingTeam === teamA ? teamAPlayers : teamBPlayers;

    // Filter available batsmen (not out and not currently playing)
}
