// The shape of `poll_responses.score_breakdown`, written by the calendar-mode
// grader that shipped before the session-run engine. The grader itself is gone
// (DVTD-9qyd); this type survives because populated rows still carry the JSON,
// and the column must keep describing what is actually stored.
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
