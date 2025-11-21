// tests/unit/aggregation.test.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import MatchEvent from '@/models/MatchEvent';
import MatchModel from '@/models/Match';

let mongod: MongoMemoryServer;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), {});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

test('aggregates events into summary', async () => {
    const match = await MatchModel.create({ teamA: 'A', teamB: 'B' });
    await MatchEvent.create({ matchId: match._id, type: 'runs', runs: 4 });
    await MatchEvent.create({ matchId: match._id, type: 'wicket' });
    // run aggregation like server code and assert totals
    const agg = await MatchEvent.aggregate([
        { $match: { matchId: match._id } },
        {
            $group: {
                _id: '$matchId',
                totalRuns: { $sum: '$runs' },
                totalWickets: { $sum: { $cond: [{ $eq: ['$type', 'wicket'] }, 1, 0] } },
                totalBalls: { $sum: { $cond: [{ $in: ['$type', ['dot', 'runs', 'wicket']] }, 1, 0] } },
            },
        },
    ]);
    expect(agg[0].totalRuns).toBe(4);
    expect(agg[0].totalWickets).toBe(1);
});
