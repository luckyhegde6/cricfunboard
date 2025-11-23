// components/scorer/QuickScoring.tsx
import { useState } from "react";

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
  dismissedBatters,
}: QuickScoringProps) {
  const [_loading, _setLoading] = useState(false);
  const [_error, _setError] = useState("");

  // Local state for selections
  const [_striker, _setStriker] = useState(currentBatters?.striker || "");
  const [_nonStriker, _setNonStriker] = useState(
    currentBatters?.nonStriker || "",
  );
  const [_bowler, _setBowler] = useState(currentBowler || "");

  // Determine batting and bowling player lists
  const _battingPlayers = battingTeam === teamA ? teamAPlayers : teamBPlayers;
  const _bowlingPlayers = bowlingTeam === teamA ? teamAPlayers : teamBPlayers;

  // Filter available batsmen (not out and not currently playing)
}
