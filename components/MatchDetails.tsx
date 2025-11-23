type MatchDetailsProps = {
  match: {
    teamA: string;
    teamB: string;
    venue?: string;
    startTime?: Date | string;
    status: "scheduled" | "live" | "completed" | "abandoned";
    summary?: {
      runs: number;
      wickets: number;
      overs: number;
    };
  };
  isCompleted?: boolean;
};

export default function MatchDetails({
  match,
  isCompleted = false,
}: MatchDetailsProps) {
  const statusColors = {
    scheduled:
      "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    live: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    completed:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    abandoned: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const formattedDate = match.startTime
    ? new Date(match.startTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date TBD";

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${isCompleted ? "opacity-60" : ""}`}
    >
      <div className="p-6">
        {/* Match Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {match.teamA} <span className="text-slate-400">vs</span>{" "}
              {match.teamB}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              {match.venue && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {match.venue}
                </div>
              )}
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[match.status]}`}
          >
            {match.status === "live" && (
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
            {match.status}
          </span>
        </div>

        {/* Score Summary */}
        {match.summary &&
          (match.status === "live" || match.status === "completed") && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-800/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Current Score
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {match.summary.runs}/{match.summary.wickets}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Overs
                  </div>
                  <div className="text-2xl font-semibold text-slate-700 dark:text-slate-300">
                    {match.summary.overs}
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
