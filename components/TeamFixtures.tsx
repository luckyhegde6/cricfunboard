// components/TeamFixtures.tsx
"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Match = {
  _id: string;
  name?: string;
  teamA: string;
  teamB: string;
  venue?: string;
  startTime?: Date;
  status: "scheduled" | "live" | "completed" | "abandoned";
};

type TeamFixturesProps = {
  teamId: string;
  teamName: string;
};

export default function TeamFixtures({ teamId, teamName }: TeamFixturesProps) {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;
  const canEdit = ["admin", "captain", "vicecaptain"].includes(userRole);

  useEffect(() => {
    // Fetch matches for this team
    fetch(`/api/matches?team=${encodeURIComponent(teamName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMatches(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch matches:", err);
        setLoading(false);
      });
  }, [teamName]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Fixtures
        </h2>
        <div className="text-slate-500">Loading fixtures...</div>
      </div>
    );
  }

  const liveMatches = matches.filter((m) => m.status === "live");
  const scheduledMatches = matches.filter((m) => m.status === "scheduled");
  const pastMatches = matches.filter(
    (m) => m.status === "completed" || m.status === "abandoned",
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Fixtures
      </h2>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live Matches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map((match) => (
              <MatchTile key={match._id} match={match} canEdit={false} />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Matches */}
      {scheduledMatches.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-slate-400"></span>
            Scheduled Matches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledMatches.map((match) => (
              <MatchTile key={match._id} match={match} canEdit={canEdit} />
            ))}
          </div>
        </div>
      )}

      {/* Past Matches */}
      {pastMatches.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-slate-300"></span>
            Past Matches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastMatches.map((match) => (
              <MatchTile key={match._id} match={match} canEdit={false} isPast />
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No fixtures found for this team
        </div>
      )}
    </div>
  );
}

function MatchTile({
  match,
  canEdit,
  isPast = false,
}: {
  match: Match;
  canEdit: boolean;
  isPast?: boolean;
}) {
  const formatDate = (date?: Date) => {
    if (!date) return "TBD";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColor = {
    live: "border-green-500 bg-green-50 dark:bg-green-900/10",
    scheduled: "border-slate-300 bg-white dark:bg-slate-800",
    completed: "border-slate-200 bg-slate-50 dark:bg-slate-700/30",
    abandoned: "border-slate-200 bg-slate-50 dark:bg-slate-700/30",
  };

  return (
    <Link
      href={`/match/${match._id}`}
      className={`block border-2 rounded-lg p-4 transition-all hover:shadow-md ${statusColor[match.status]} ${isPast ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            {match.name || `${match.teamA} vs ${match.teamB}`}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {match.venue || "Venue TBD"}
          </p>
        </div>
        {canEdit && match.status === "scheduled" && (
          <button
            onClick={(e) => {
              e.preventDefault();
              // TODO: Open edit modal
              alert("Edit functionality coming soon");
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Edit match"
          >
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">
          {formatDate(match.startTime)}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
            match.status === "live"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : match.status === "scheduled"
                ? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                : "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-400"
          }`}
        >
          {match.status}
        </span>
      </div>
    </Link>
  );
}
