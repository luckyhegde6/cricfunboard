import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScorerPanel from '@/components/ScorerPanel';

beforeEach(() => {
    // mock fetch
    (global as any).fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, match: {} }) })
    );
});

afterEach(() => {
    jest.resetAllMocks();
});

test('records a run when clicking 4 button', async () => {
    const onUpdate = jest.fn();
    render(<ScorerPanel matchId="000000000000000000000000" onUpdate={onUpdate} />);
    const btn = screen.getByText('4');
    fireEvent.click(btn);
    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
    expect((global as any).fetch).toHaveBeenCalledWith(expect.stringContaining('/api/matches/'), expect.any(Object));
});
