import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ScorerPanel from "@/components/ScorerPanel";
import { getSocket } from "@/lib/socket-client";

// Mock socket client
jest.mock("@/lib/socket-client", () => ({
  getSocket: jest.fn(),
}));

describe("ScorerPanel", () => {
  const mockEmit = jest.fn();
  const mockOn = jest.fn();
  const mockOff = jest.fn();
  const mockSocket = {
    connected: true,
    emit: mockEmit,
    on: mockOn,
    off: mockOff,
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    (getSocket as jest.Mock).mockReturnValue(mockSocket);

    // Mock fetch
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ok: true, match: {} }),
      }),
    );
  });

  it("initializes socket connection on mount", () => {
    render(<ScorerPanel matchId="123" />);
    expect(getSocket).toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith("join", "match:123");
    expect(mockOn).toHaveBeenCalledWith("match:update", expect.any(Function));
  });

  it("records a run when clicking 4 button using socket", async () => {
    const onUpdate = jest.fn();
    render(<ScorerPanel matchId="123" onUpdate={onUpdate} />);

    const btn = screen.getByText("4");
    fireEvent.click(btn);

    await waitFor(() =>
      expect(mockEmit).toHaveBeenCalledWith("score:event", {
        matchId: "123",
        event: { type: "runs", runs: 4 },
      }),
    );

    // Should also call fetch for persistence
    expect((global as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/matches/123/score"),
      expect.any(Object),
    );
    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  });

  it("records a wicket", async () => {
    render(<ScorerPanel matchId="123" />);
    fireEvent.click(screen.getByText("Wicket"));
    await waitFor(() =>
      expect(mockEmit).toHaveBeenCalledWith("score:event", {
        matchId: "123",
        event: { type: "wicket" },
      }),
    );
  });

  it("records a wide", async () => {
    render(<ScorerPanel matchId="123" />);
    fireEvent.click(screen.getByText("Wide"));
    await waitFor(() =>
      expect(mockEmit).toHaveBeenCalledWith("score:event", {
        matchId: "123",
        event: { type: "wd" },
      }),
    );
  });

  it("records an undo", async () => {
    render(<ScorerPanel matchId="123" />);
    fireEvent.click(screen.getByText("Undo"));
    await waitFor(() =>
      expect(mockEmit).toHaveBeenCalledWith("score:event", {
        matchId: "123",
        event: { type: "undo" },
      }),
    );
  });

  it("falls back to fetch if socket is not connected", async () => {
    (getSocket as jest.Mock).mockReturnValue({
      ...mockSocket,
      connected: false,
    });
    const onUpdate = jest.fn();

    render(<ScorerPanel matchId="123" onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("Dot"));

    // Should NOT emit to socket
    expect(mockEmit).not.toHaveBeenCalledWith(
      "score:event",
      expect.any(Object),
    );

    // Should call fetch
    await waitFor(() =>
      expect((global as any).fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/matches/123/score"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ type: "dot" }),
        }),
      ),
    );
    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  });

  it("handles network error in fallback mode", async () => {
    (getSocket as jest.Mock).mockReturnValue(null);
    (global as any).fetch = jest.fn(() => Promise.reject("Network error"));

    render(<ScorerPanel matchId="123" />);
    fireEvent.click(screen.getByText("1"));

    await waitFor(() =>
      expect(screen.getByText("Network error")).toBeInTheDocument(),
    );
  });
});
