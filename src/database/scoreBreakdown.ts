export type PollScoreBreakdown = {
	streak: number;
	earnedCoverage: number;
	delta: number;
	baseCoverage: number;
	streakBonus: number;
	configBonus: number;
};

export type ScoreCalculation = {
	newTotalCoverage: number;
	newBestStreak: number;
	newStreak: number;
	newPollsAnswered: number;
	breakdown: PollScoreBreakdown;
};
