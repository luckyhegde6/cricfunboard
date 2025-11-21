"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TossModal from "@/components/scorer/TossModal";
import MatchControls from "@/components/scorer/MatchControls";
import MatchStatus from "@/components/scorer/MatchStatus";
import ScoreBuilder from "@/components/scorer/ScoreBuilder";
import Scorecard from "@/components/match/Scorecard";
import { ArrowLeft } from "lucide-react";
import { getSocket } from "@/lib/socket-client";
import SelectBatsmanModal from "@/components/scorer/SelectBatsmanModal";
import SelectBowlerModal from "@/components/scorer/SelectBowlerModal";

type Match = {
    _id: string;
    teamA: string;
    teamB: string;
    venue?: string;
    startTime?: Date | string;
    status: "scheduled" | "live" | "completed" | "abandoned";
    scorerId?: string;
    matchState: string;
    currentInnings: number;
    battingTeam?: string;
    bowlingTeam?: string;
    toss?: {
        winner: string;
        decision: string;
    };
    innings1Summary?: {
        runs: number;
        wickets: number;
        overs: number;
        dismissedBatters?: string[];
    };
    innings2Summary?: {
        runs: number;
        wickets: number;
        overs: number;
        dismissedBatters?: string[];
    };
    currentBatters?: {
        striker: string | null;
        nonStriker: string | null;
    };
    currentBowler?: string | null;
    teamAPlayers?: any[];
    teamBPlayers?: any[];
    scorecard?: any;
    recentEvents?: any[];
}

export default function ScorePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("info");
    const [showScoreBuilder, setShowScoreBuilder] = useState(true);

    // Modal States
    const [showBatsmanModal, setShowBatsmanModal] = useState(false);
    const [showBowlerModal, setShowBowlerModal] = useState(false);
    const [batsmanRole, setBatsmanRole] = useState<"striker" | "nonStriker">("striker");

    const { data: session, status } = useSession();
    const router = useRouter();

    const fetchMatch = () => {
        // ... (existing fetchMatch logic)
        console.log("[ScorePage] Fetching match data for ID:", id);
        fetch(`/api/matches/${id}?t=${Date.now()}`)
            .then(async r => {
                if (!r.ok) {
                    const text = await r.text();
                    throw new Error(`Failed to fetch match: ${r.status} ${text}`);
                }
                return r.json();
            })
            .then(data => {
                if (data.status === "completed" || data.status === "abandoned") {
                    router.push(`/match/${id}`);
                    return;
                }
                setMatch(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch match:", err);
                setLoading(false);
            });
    };

    // Socket Connection
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.emit("join", `match:${id}`);
        console.log(`[ScorePage] Joined socket room: match:${id}`);

        const handleUpdate = (payload: any) => {
            console.log("[ScorePage] Received match update via socket");
            // Optimistically update or fetch fresh
            // If payload is full match object, use it. But usually it might be partial or raw DB doc.
            // Our GET /api/matches/[id] returns enriched data (players etc).
            // The socket payload from events/route.ts is the raw match doc.
            // So we should probably fetchMatch() to get enriched data, OR manually merge.
            // Fetching is safer for consistency.
            fetchMatch();
        };

        socket.on("match:update", handleUpdate);

        return () => {
            socket.off("match:update", handleUpdate);
            socket.emit("leave", `match:${id}`);
        };
    }, [id]);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push(`/api/auth/signin?callbackUrl=/match/${id}/score`);
            return;
        }
        fetchMatch();
    }, [id, session, status, router]);

    // Check authorization... (existing)
    useEffect(() => {
        if (!match || !session) return;
        const user = session?.user as any;
        const isAdmin = user?.role === "admin";
        const isAssignedScorer = match.scorerId?.toString() === user?.id;

        if (!isAdmin && !isAssignedScorer) {
            setLoading(false);
        }
    }, [match, session]);

    // Check for missing players (Prompts)
    useEffect(() => {
        if (!match || match.matchState !== "live") return;

        const currentBatters = (match as any).currentBatters || {};
        const currentBowler = (match as any).currentBowler;

        if (!currentBatters.striker) {
            setBatsmanRole("striker");
            setShowBatsmanModal(true);
        } else if (!currentBatters.nonStriker) {
            setBatsmanRole("nonStriker");
            setShowBatsmanModal(true);
        } else {
            setShowBatsmanModal(false);
        }

        if (!currentBowler) {
            setShowBowlerModal(true);
        } else {
            setShowBowlerModal(false);
        }
    }, [match]);

    // Handlers for Modals
    const handleBatsmanSelect = async (playerId: string) => {
        if (!match) return;
        try {
            const currentBatters = (match as any).currentBatters || {};
            const payload = {
                currentBatters: {
                    ...currentBatters,
                    [batsmanRole]: playerId
                }
            };

            await fetch(`/api/matches/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            setShowBatsmanModal(false);
            fetchMatch(); // Refresh
        } catch (err) {
            console.error("Error selecting batsman:", err);
            alert("Failed to select batsman");
        }
    };

    const handleBowlerSelect = async (playerId: string) => {
        if (!match) return;
        try {
            await fetch(`/api/matches/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentBowler: playerId })
            });

            setShowBowlerModal(false);
            fetchMatch(); // Refresh
        } catch (err) {
            console.error("Error selecting bowler:", err);
            alert("Failed to select bowler");
        }
    };

    if (loading || status === "loading") {
        // ... (existing loading)
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">Loading scorer panel...</p>
                </div>
            </div>
        );
    }

    if (!match) {
        // ... (existing not found)
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-red-800 dark:text-red-300">Match Not Found</h2>
                    <p className="mt-2 text-red-600 dark:text-red-400">The match you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    const user = session?.user as any;
    const isAdmin = user?.role === "admin";
    const isAssignedScorer = match?.scorerId?.toString() === user?.id;
    const canAccess = isAdmin || isAssignedScorer;

    if (!canAccess) {
        // ... (existing access denied)
        return (
            <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">Not Assigned to This Match</h2>
                            <p className="text-yellow-700 dark:text-yellow-400 mb-4">
                                You are not assigned as the scorer for this match. Only the assigned scorer or an admin can access the scorer panel.
                            </p>
                            <Link
                                href={`/match/${id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                            >
                                View Match Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const allPlayers = [...((match as any).teamAPlayers || []), ...((match as any).teamBPlayers || [])];

    // Determine batting and bowling team players
    const battingTeamName = match.battingTeam;
    const bowlingTeamName = match.bowlingTeam;

    const battingTeamPlayers = battingTeamName === match.teamA
        ? (match as any).teamAPlayers
        : (match as any).teamBPlayers;

    const bowlingTeamPlayers = bowlingTeamName === match.teamA
        ? (match as any).teamAPlayers
        : (match as any).teamBPlayers;

    // Filter out dismissed players for batsman selection
    // We need to check match.innings1Summary.dismissedBatters or innings2Summary...
    const currentSummary = match.currentInnings === 1 ? match.innings1Summary : match.innings2Summary;
    const dismissedBatters = currentSummary?.dismissedBatters || []; // Array of playerIds

    // Also filter out current batters (striker/nonStriker) so we don't select them again
    const currentStriker = (match as any).currentBatters?.striker;
    const currentNonStriker = (match as any).currentBatters?.nonStriker;

    const availableBatters = (battingTeamPlayers || []).filter((p: any) =>
        !dismissedBatters.includes(p.playerId) &&
        p.playerId !== currentStriker &&
        p.playerId !== currentNonStriker
    );

    const availableBowlers = (bowlingTeamPlayers || []).filter((p: any) => p.playerId !== (match as any).currentBowler);

    // Extract current stats from scorecard
    const currentInningsData = match.currentInnings === 1 ? (match as any).scorecard?.innings1 : (match as any).scorecard?.innings2;
    const strikerId = (match as any).currentBatters?.striker;
    const nonStrikerId = (match as any).currentBatters?.nonStriker;
    const bowlerId = (match as any).currentBowler;

    const strikerStats = strikerId && currentInningsData?.batting?.[strikerId]
        ? { runs: currentInningsData.batting[strikerId].runs, balls: currentInningsData.batting[strikerId].balls }
        : undefined;

    const nonStrikerStats = nonStrikerId && currentInningsData?.batting?.[nonStrikerId]
        ? { runs: currentInningsData.batting[nonStrikerId].runs, balls: currentInningsData.batting[nonStrikerId].balls }
        : undefined;

    const bowlerStats = bowlerId && currentInningsData?.bowling?.[bowlerId]
        ? {
            overs: currentInningsData.bowling[bowlerId].overs,
            maidens: currentInningsData.bowling[bowlerId].maidens,
            runs: currentInningsData.bowling[bowlerId].runs,
            wickets: currentInningsData.bowling[bowlerId].wickets
        }
        : undefined;

    const handleScoreSubmit = async (payload: any) => {
        try {
            // Inject current batsman and bowler
            const enrichedPayload = {
                ...payload,
                batsman: (match as any).currentBatters?.striker,
                bowler: (match as any).currentBowler
            };

            const res = await fetch(`/api/matches/${id}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(enrichedPayload)
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to submit score: ${res.status} ${text}`);
            }

            // Refresh match data (Socket will also trigger this, but double tap is fine or we can rely on socket)
            // fetchMatch(); 
        } catch (err: any) {
            console.error("Error submitting score:", err);
            alert(err.message || "Failed to submit score. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* ... (Header) */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="flex items-center h-16">
                        <Link href="/" className="mr-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                {match.teamA} vs {match.teamB}
                            </h1>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                {match.matchState === "live" ? "Live Scoring" : "Match Center"}
                            </div>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            {isAdmin && (
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Scoring</span>
                                    <button
                                        onClick={() => setShowScoreBuilder(!showScoreBuilder)}
                                        className={`w-8 h-4 rounded-full transition-colors relative ${showScoreBuilder ? 'bg-green-500' : 'bg-slate-400'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showScoreBuilder ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${match.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                {match.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Match Status Header */}
                <MatchStatus
                    matchState={match.matchState}
                    currentInnings={match.currentInnings}
                    battingTeam={match.battingTeam}
                    bowlingTeam={match.bowlingTeam}
                    toss={match.toss}
                    innings1Summary={match.innings1Summary}
                    innings2Summary={match.innings2Summary}
                    recentEvents={(match as any).recentEvents}
                    currentBatters={(match as any).currentBatters}
                    currentBowler={(match as any).currentBowler}
                    allPlayers={allPlayers}
                    strikerStats={strikerStats}
                    nonStrikerStats={nonStrikerStats}
                    bowlerStats={bowlerStats}
                />

                {/* Pre-Toss State */}
                {match.matchState === "pre-toss" && (
                    <TossModal
                        matchId={match._id}
                        teamA={match.teamA}
                        teamB={match.teamB}
                        onTossComplete={fetchMatch}
                    />
                )}

                {/* Match Controls (Innings Break, etc) */}
                {match.matchState !== "pre-toss" && match.matchState !== "completed" && match.matchState !== "live" && (
                    <MatchControls
                        matchId={match._id}
                        matchState={match.matchState}
                        currentInnings={match.currentInnings}
                        onAction={fetchMatch}
                    />
                )}

                {/* Live Scoring Dashboard */}
                {match.matchState === "live" && (
                    <>
                        {/* Score Builder */}
                        {showScoreBuilder && (
                            <div className="mb-6">
                                <ScoreBuilder onScoreSubmit={handleScoreSubmit} />
                            </div>
                        )}

                        {/* Scorecard */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm">
                                Live Scorecard
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <Scorecard match={match} players={allPlayers} />
                            </div>
                        </div>
                    </>
                )}

                {/* Completed Match View */}
                {match.matchState === "completed" && (
                    <Scorecard match={match} players={allPlayers} />
                )}
            </div>

            {/* Modals */}
            <SelectBatsmanModal
                isOpen={showBatsmanModal}
                onClose={() => { }} // Force selection
                onSubmit={handleBatsmanSelect}
                players={availableBatters}
                role={batsmanRole}
            />

            <SelectBowlerModal
                isOpen={showBowlerModal}
                onClose={() => { }} // Force selection
                onSubmit={handleBowlerSelect}
                players={availableBowlers}
            />
        </div>
    );
}
