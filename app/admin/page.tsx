// app/admin/page.tsx
"use client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminSidebar from "@/components/AdminSidebar";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!stats) return <div className="p-6">Failed to load stats.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* User Stats */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Users</h2>
          <div className="text-3xl font-bold mb-2">{stats.users.total}</div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Admins:</span> <span>{stats.users.byRole.admin || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Captains:</span>{" "}
              <span>{stats.users.byRole.captain || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Scorers:</span> <span>{stats.users.byRole.scorer || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Users:</span> <span>{stats.users.byRole.user || 0}</span>
            </div>
          </div>
          <Link
            href="/admin/users"
            className="block mt-4 text-blue-600 text-sm hover:underline"
          >
            Manage Users →
          </Link>
        </div>

        {/* Match Stats */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Matches</h2>
          <div className="text-3xl font-bold mb-2">{stats.matches.total}</div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Live:</span>{" "}
              <span className="text-green-600 font-bold">
                {stats.matches.byStatus.live || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>{" "}
              <span>{stats.matches.byStatus.completed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Scheduled:</span>{" "}
              <span>{stats.matches.byStatus.scheduled || 0}</span>
            </div>
          </div>
          <Link
            href="/admin/matches"
            className="block mt-4 text-blue-600 text-sm hover:underline"
          >
            Manage Matches →
          </Link>
        </div>

        {/* Tournament Stats */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-purple-500">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Tournaments
          </h2>
          <div className="text-3xl font-bold mb-2">
            {stats.tournaments.total}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Ongoing:</span>{" "}
              <span className="text-green-600 font-bold">
                {stats.tournaments.byStatus.ongoing || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Upcoming:</span>{" "}
              <span>{stats.tournaments.byStatus.upcoming || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>{" "}
              <span>{stats.tournaments.byStatus.completed || 0}</span>
            </div>
          </div>
          <Link
            href="/admin/tournaments"
            className="block mt-4 text-blue-600 text-sm hover:underline"
          >
            Manage Tournaments →
          </Link>
        </div>

        {/* Connection Stats */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-orange-500">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Active Connections
          </h2>
          <div className="text-3xl font-bold mb-2">
            {stats.connections.totalConnections}
          </div>
          <p className="text-sm text-gray-500 mb-4">Current active sockets</p>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="font-medium mb-1">Top Matches:</div>
            {Object.entries(stats.connections.activeRooms || {}).length > 0 ? (
              Object.entries(stats.connections.activeRooms)
                .slice(0, 3)
                .map(([room, count]: any) => (
                  <div key={room} className="flex justify-between">
                    <span className="truncate max-w-[120px]">{room}</span>
                    <span>{count}</span>
                  </div>
                ))
            ) : (
              <div className="text-gray-400 italic">No active match rooms</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
