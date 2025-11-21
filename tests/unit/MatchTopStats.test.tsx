import React from 'react';
import { render, screen } from '@testing-library/react';
import MatchTopStats from '@/components/MatchTopStats';

describe('MatchTopStats', () => {
    it('renders summary info', () => {
        const match = { teamA: 'A', teamB: 'B', venue: 'Ground', summary: { runs: 120, wickets: 3, overs: 17 }, maxOvers: 20 };
        render(<MatchTopStats match={match} />);
        expect(screen.getByText(/A vs B/)).toBeInTheDocument();
        expect(screen.getByText(/120\/3/)).toBeInTheDocument();
        expect(screen.getByText(/17 overs/i)).toBeInTheDocument();
    });
});
