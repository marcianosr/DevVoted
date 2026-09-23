/**
 * Level system for category coverage
 *
 * Coverage can exceed 100%. Each 100% = one "level":
 * - 50% → L1 (50% display)
 * - 100% → L2 (0% display)
 * - 127% → L2 (27% display)
 * - 250% → L3 (50% display)
 *
 * Gates check "effective coverage" (the raw total), not display coverage.
 */

export type LevelInfo = {
	level: number; // 1, 2, 3, etc.
	displayCoverage: number; // 0-99.9% (what shows in progress bar)
	effectiveCoverage: number; // Raw total (what gates check against)
};

/**
 * Calculates level and display coverage from raw coverage value
 * @param rawCoverage - The total accumulated coverage (can exceed 100)
 * @returns Level info with level number, display coverage, and effective coverage
 *
 * @example
 * calculateLevelAndCoverage(50)   // { level: 1, displayCoverage: 50, effectiveCoverage: 50 }
 * calculateLevelAndCoverage(100)  // { level: 2, displayCoverage: 0, effectiveCoverage: 100 }
 * calculateLevelAndCoverage(127)  // { level: 2, displayCoverage: 27, effectiveCoverage: 127 }
 * calculateLevelAndCoverage(250)  // { level: 3, displayCoverage: 50, effectiveCoverage: 250 }
 * calculateLevelAndCoverage(-5)   // { level: 1, displayCoverage: -5, effectiveCoverage: -5 }
 */
export const calculateLevelAndCoverage = (rawCoverage: number): LevelInfo => {
	// Floor level at 1 (handles negative coverage edge case)
	const level = Math.max(1, Math.floor(rawCoverage / 100) + 1);

	// Display coverage is the remainder (0-99.9 for positive values)
	// For negative values, just show the raw value
	const displayCoverage = rawCoverage >= 0 ? rawCoverage % 100 : rawCoverage;

	return {
		level,
		displayCoverage: Math.round(displayCoverage * 10) / 10,
		effectiveCoverage: Math.round(rawCoverage * 10) / 10,
	};
};
