type MatchStatusProps = {
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
  };
  innings2Summary?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  recentEvents?: any[];
  currentBatters?: { striker?: string; nonStriker?: string };
  currentBowler?: string;
  allPlayers?: { playerId: string; name: string }[];
  strikerStats?: { runs: number; balls: number };
  nonStrikerStats?: { runs: number; balls: number };
  bowlerStats?: {
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
  };
};

export default function MatchStatus({
  matchState,
  currentInnings,
  battingTeam,
  bowlingTeam,
  toss,
  innings1Summary,
  innings2Summary,
  currentBatters,
  currentBowler,
  allPlayers = [],
  recentEvents = [],
  strikerStats,
  nonStrikerStats,
  bowlerStats,
}: MatchStatusProps) {
  const stateColors = {
    "pre-toss":
      "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    "toss-done":
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    live: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "innings-break":
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    "rain-delay":
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    completed:
      "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  };

  const currentSummary =
    currentInnings === 1 ? innings1Summary : innings2Summary;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Match Status
        </h3>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${stateColors[matchState as keyof typeof stateColors] || stateColors["pre-toss"]}`}
        >
          {matchState === "live" && (
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
          {matchState ? matchState.replace(/-/g, " ") : "Unknown"}
        </span>
      </div>

      {/* Toss Result */}
      {toss?.winner && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Toss
          </div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {toss.winner} won and chose to{" "}
            {toss.decision === "bat" ? "bat first" : "bowl first"}
          </div>
        </div>
      )}

      {/* Current Innings */}
      {(matchState === "live" || matchState === "innings-break") && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
              Innings
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {currentInnings}
            </div>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xs text-green-600 dark:text-green-400 mb-1">
              Score
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {currentSummary?.runs || 0}/{currentSummary?.wickets || 0}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                ({currentSummary?.overs || 0} ov)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Batting/Bowling Teams */}
      {battingTeam && bowlingTeam && (
        <div className="space-y-2 mb-4">
          <div
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${battingTeam ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}
          >
            <span className="text-sm opacity-90">Batting</span>
            <span className="font-bold text-lg">{battingTeam}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Bowling
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {bowlingTeam}
            </span>
          </div>
        </div>
      )}

      {/* Current Players */}
      {(currentBatters?.striker ||
        currentBatters?.nonStriker ||
        currentBowler) && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Striker
              </div>
              <div className="font-medium text-slate-900 dark:text-white flex items-center justify-between">
                <div className="flex items-center">
                  {allPlayers.find(
                    (p) => p.playerId === currentBatters?.striker,
                  )?.name || "Not Selected"}
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    *
                  </span>
                </div>
                {strikerStats && (
                  <span className="text-sm font-mono text-slate-600 dark:text-slate-300">
                    {strikerStats.runs}
                    <span className="text-xs text-slate-400">
                      ({strikerStats.balls})
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Non-Striker
              </div>
              <div className="font-medium text-slate-900 dark:text-white flex items-center justify-between">
                <div>
                  {allPlayers.find(
                    (p) => p.playerId === currentBatters?.nonStriker,
                  )?.name || "Not Selected"}
                </div>
                {nonStrikerStats && (
                  <span className="text-sm font-mono text-slate-600 dark:text-slate-300">
                    {nonStrikerStats.runs}
                    <span className="text-xs text-slate-400">
                      ({nonStrikerStats.balls})
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-600 pt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Current Bowler
            </div>
            <div className="font-medium text-slate-900 dark:text-white flex items-center justify-between">
              <div>
                {allPlayers.find((p) => p.playerId === currentBowler)?.name ||
                  "Not Selected"}
              </div>
              {bowlerStats && (
                <span className="text-sm font-mono text-slate-600 dark:text-slate-300">
                  {bowlerStats.wickets}-{bowlerStats.runs}{" "}
                  <span className="text-xs text-slate-400">
                    ({bowlerStats.overs})
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Events (This Over) */}
      {matchState === "live" && (
        <div className="mb-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase font-semibold tracking-wider">
            Recent Balls
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {recentEvents && recentEvents.length > 0 ? (
              recentEvents.map((event: any, i: number) => (
                <div key={i} className="flex flex-col items-center">
                  <span
                    className={`
                                        w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border shadow-sm
                                        ${
                                          event.type === "wicket"
                                            ? "bg-red-500 text-white border-red-600"
                                            : event.runs === 4
                                              ? "bg-blue-500 text-white border-blue-600"
                                              : event.runs === 6
                                                ? "bg-purple-500 text-white border-purple-600"
                                                : event.type === "wd" ||
                                                    event.type === "nb"
                                                  ? "bg-orange-100 text-orange-800 border-orange-200"
                                                  : "bg-white text-slate-700 border-slate-200"
                                        }
                                    `}
                  >
                    {event.type === "wicket"
                      ? "W"
                      : event.type === "wd"
                        ? "wd"
                        : event.type === "nb"
                          ? "nb"
                          : event.runs}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">
                No balls yet
              </span>
            )}
          </div>
        </div>
      )}

      {/* Innings 1 Summary (when in innings 2) */}
      {currentInnings === 2 && innings1Summary && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Innings 1
          </div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {innings1Summary.runs}/{innings1Summary.wickets} (
            {innings1Summary.overs} overs)
          </div>
        </div>
      )}
    </div>
  );
}
