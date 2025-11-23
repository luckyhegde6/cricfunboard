import React from "react";
import { render, screen, within } from "@testing-library/react";
import MatchTopStats from "@/components/MatchTopStats";

jest.mock("@/lib/socket-client", () => ({
  getSocket: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  })),
}));

describe("MatchTopStats", () => {
  const mockTeamAPlayers = [
    { playerId: "p1", name: "Player 1" },
    { playerId: "p2", name: "Player 2" },
  ];
  const mockTeamBPlayers = [{ playerId: "p3", name: "Player 3" }];

  it("renders summary info for first innings", () => {
    const match = {
      teamA: "A",
      teamB: "B",
      venue: "Ground",
      currentInnings: 1,
      innings1Summary: { runs: 120, wickets: 3, overs: 17 },
      maxOvers: 20,
    };
    render(<MatchTopStats match={match} />);
    expect(
      screen.getByRole("heading", { name: /A vs B/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/120\/3/)).toBeInTheDocument();
    expect(screen.getByText(/17 overs/i)).toBeInTheDocument();
  });

  it("renders summary info for second innings", () => {
    const match = {
      teamA: "A",
      teamB: "B",
      venue: "Ground",
      currentInnings: 2,
      innings2Summary: { runs: 45, wickets: 1, overs: 5.2 },
      maxOvers: 20,
    };
    render(<MatchTopStats match={match} />);
    expect(screen.getByText(/45\/1/)).toBeInTheDocument();
    expect(screen.getByText(/5.2 overs/i)).toBeInTheDocument();
  });

  it("renders player names correctly", () => {
    const match = {
      teamA: "A",
      teamB: "B",
      currentInnings: 1,
      innings1Summary: { runs: 10, wickets: 0, overs: 1 },
      currentBatters: { striker: "p1", nonStriker: "p2" },
      currentBowler: "p3",
      maxOvers: 20,
    };
    render(
      <MatchTopStats
        match={match}
        teamAPlayers={mockTeamAPlayers}
        teamBPlayers={mockTeamBPlayers}
      />,
    );
    expect(screen.getByText("Player 1*")).toBeInTheDocument();
    expect(screen.getByText("Player 2")).toBeInTheDocument();
    expect(screen.getByText("Player 3")).toBeInTheDocument();
  });

  it("renders recent events excluding announcements", () => {
    const match = {
      teamA: "A",
      teamB: "B",
      currentInnings: 1,
      innings1Summary: { runs: 10, wickets: 0, overs: 1 },
      recentEvents: [
        { type: "ball", runs: 1 },
        { type: "ball", runs: 4 },
        { type: "wicket" },
        { type: "announcement", meta: { text: "Hidden" } },
        { type: "ball", runs: 6 },
      ],
      maxOvers: 20,
    };
    render(<MatchTopStats match={match} />);
    const ballsContainer = screen.getByTestId("recent-balls");
    expect(within(ballsContainer).getByText("1")).toBeInTheDocument();
    expect(within(ballsContainer).getByText("4")).toBeInTheDocument();
    expect(within(ballsContainer).getByText("W")).toBeInTheDocument();
    expect(within(ballsContainer).getByText("6")).toBeInTheDocument();
    expect(
      within(ballsContainer).queryByText("Hidden"),
    ).not.toBeInTheDocument();

    // It SHOULD be in the document as an announcement
    expect(screen.getByText("Hidden")).toBeInTheDocument();
  });

  it("renders latest announcement", () => {
    const match = {
      teamA: "A",
      teamB: "B",
      currentInnings: 1,
      innings1Summary: { runs: 10, wickets: 0, overs: 1 },
      recentEvents: [
        {
          type: "announcement",
          meta: { text: "Rain Delay" },
          createdAt: new Date().toISOString(),
        },
      ],
      maxOvers: 20,
    };
    render(<MatchTopStats match={match} />);
    expect(screen.getByText("Rain Delay")).toBeInTheDocument();
    expect(screen.getByText("Announcement")).toBeInTheDocument();
  });
});
