export type LevelInfo = {
	level: number;
	displayCoverage: number;
	effectiveCoverage: number;
};

export const calculateLevelAndCoverage = (rawCoverage: number): LevelInfo => {
	const level = Math.max(1, Math.floor(rawCoverage / 100) + 1);

	const displayCoverage = rawCoverage >= 0 ? rawCoverage % 100 : rawCoverage;

	return {
		level,
		displayCoverage: Math.round(displayCoverage * 10) / 10,
		effectiveCoverage: Math.round(rawCoverage * 10) / 10,
	};
};
