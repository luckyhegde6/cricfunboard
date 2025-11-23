// app/profile/page.tsx
"use client";
import { useSession } from "next-auth/react";
import type React from "react";
import { useState } from "react";
import RoleDelegation from "@/components/admin/RoleDelegation";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if passwords match
  const passwordsMatch = newPassword === confirmPassword;
  const hasPasswordMismatch = newPassword && confirmPassword && !passwordsMatch;

  // Check if any field is empty or contains only whitespace
  const hasEmptyFields =
    !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim();

  // Disable button if fields are empty or passwords don't match
  const isButtonDisabled = loading || hasEmptyFields || !passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validate passwords match
    if (!passwordsMatch) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!session)
    return <div className="p-6">Please sign in to view your profile.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">User Details</h2>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Name:</span>{" "}
            {session.user?.name || "N/A"}
          </div>
          <div>
            <span className="font-medium">Email:</span> {session.user?.email}
          </div>
          <div>
            <span className="font-medium">Role:</span>{" "}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {(session.user as any)?.role || "User"}
            </span>
          </div>
        </div>
      </div>

      {/* Role Delegation (Admin Only) */}
      {(session.user as any)?.role === "admin" && <RoleDelegation />}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
              required
              minLength={6}
            />
          </div>

          {hasPasswordMismatch && (
            <div className="text-red-600 text-sm">Passwords do not match</div>
          )}
          {message && <div className="text-green-600 text-sm">{message}</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={isButtonDisabled}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
