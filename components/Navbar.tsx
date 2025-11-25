// components/Navbar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import AuthButton from "./AuthButton";
import LiveScoreBanner from "./LiveScoreBanner";
import RoleSwitcher from "./RoleSwitcher";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [announcement, setAnnouncement] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [teams, setTeams] = useState<Array<{ _id: string; name: string }>>([]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.announcement) setAnnouncement(data.announcement);
      })
      .catch((err) => console.error(err));
  }, []); // Refresh on nav change

  // Fetch teams for dropdown
  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTeams(data);
      })
      .catch((err) => console.error("Failed to fetch teams:", err));
  }, []);

  // Close Teams dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open]);

  return (
    <>
      {announcement && (
        <div className="bg-yellow-100 text-yellow-800 text-center text-sm py-2 px-4 font-medium border-b border-yellow-200">
          📢 {announcement}
        </div>
      )}
      <LiveScoreBanner />
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <img
                  src="/icons/logo.svg"
                  alt="CricBoard"
                  className="w-9 h-9"
                />
                <span className="font-semibold text-lg">CricBoard</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <NavLink
                  href="/matches"
                  active={pathname?.startsWith("/matches")}
                >
                  Matches
                </NavLink>
                <NavLink href="/teams" active={pathname?.startsWith("/teams")}>
                  Teams
                </NavLink>
                <NavLink
                  href="/tournaments"
                  active={pathname?.startsWith("/tournaments")}
                >
                  Tournaments
                </NavLink>
                {isAdmin && (
                  <NavLink
                    href="/admin"
                    active={pathname?.startsWith("/admin")}
                  >
                    Admin
                  </NavLink>
                )}

                {["admin", "captain", "vicecaptain"].includes(
                  session?.user?.role || ""
                ) && (
                    <NavLink
                      href="/team/submit"
                      active={pathname?.startsWith("/team/submit")}
                    >
                      Manage Team
                    </NavLink>
                  )}

                {/* Team dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setOpen((s) => !s)}
                    className="ml-2 px-3 py-1.5 text-sm rounded-md border hover:bg-slate-50"
                  >
                    Teams ▾
                  </button>
                  {open && (
                    <div className="absolute left-0 mt-2 w-44 bg-white border rounded shadow z-50">
                      {teams.length > 0 ? (
                        <>
                          {teams.map((team) => (
                            <Link
                              key={team._id}
                              href={`/teams/${team._id}`}
                              className="block px-3 py-2 hover:bg-slate-50"
                              onClick={() => setOpen(false)}
                            >
                              {team.name}
                            </Link>
                          ))}
                          <Link
                            href="/teams"
                            className="block px-3 py-2 hover:bg-slate-50 border-t"
                            onClick={() => setOpen(false)}
                          >
                            All teams
                          </Link>
                        </>
                      ) : (
                        <div className="px-3 py-2 text-sm text-slate-500">
                          No teams found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm text-slate-500 mr-2">
                Follow live matches
              </div>
              <RoleSwitcher />
              <AuthButton />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded text-sm ${active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
    >
      {children}
    </Link>
  );
}
