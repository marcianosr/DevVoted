import { differenceInCalendarDays, parseISO } from "date-fns";

/**
 * Builds the spoiler-free, ego-safe "build result" a player copies to paste into
 * Slack/Discord/DMs after answering the daily poll. Everyone gets the same daily
 * poll, so the shared substrate creates "you play too? what'd you get?" pull.
 *
 * This is a PURE function (no React, no I/O) so the ego-safety rules below are
 * unit-testable in isolation. The rules are non-negotiable — the feature dies if
 * they break:
 *
 *  1. It NEVER reveals which specific polls were wrong, or the correct answers.
 *     The ✅/❌ row shows how FAR the player got, not WHICH questions.
 *  2. An average or bad day must still look worth sharing (gate reached, streak,
 *     percentile) — never a raw "you failed / LOW" state. The header is always a
 *     green build (🟢).
 *  3. The last line challenges the READER ("Think you'd pass?"), never a
 *     confession from the sharer.
 *  4. The devvoted.com link is always present — it is the entire acquisition loop.
 */

export const DEVVOTED_URL = "https://devvoted.com";

// Fixed-width coverage bars keep the card monospace-aligned across pastes.
export const COVERAGE_BAR_WIDTH = 5;
const FILLED_CELL = "█";
const EMPTY_CELL = "░";

export type CoverageBar = {
	/** Short category label, e.g. "JS", "CSS", "Git". */
	label: string;
	/** Coverage as a 0..1 ratio. Values outside the range are clamped. */
	ratio: number;
};

export type DailyResultShareData = {
	/** Global "build number" — days since the first daily poll (Build #1). */
	dayNumber: number;
	/**
	 * Window outcomes in attempt order (mixes days — NOT a per-question map of
	 * today's poll). Shows how far the player got, never which answers.
	 */
	pipeline: boolean[];
	/** Gate the player has reached this run. */
	gateNumber: number;
	/** Whether the current window/gate was just cleared (green) vs. still in progress. */
	gateCleared: boolean;
	/** Player's top categories by coverage (already selected/sorted by the caller). */
	coverage: CoverageBar[];
	/**
	 * Account-level daily-login streak. Optional: the streak feature does not exist
	 * yet, so when undefined the streak text is omitted entirely (see prerequisite
	 * note in the feature bean).
	 */
	streakDays?: number;
	/** Percentile framed as "beat X% of devs". 0..100. */
	percentile: number;
	/** Display name of today's poll category, e.g. "React". */
	todayCategory: string;
	/** Share of players stumped by today's poll, framed as a challenge. 0..100. */
	hardPct: number;
	/** Acquisition link. Defaults to the public site. */
	url?: string;
};

/** Days since launch, 1-indexed: launch day itself is Build #1. */
export const getBuildNumber = (
	launchDateIso: string,
	currentDateIso: string
): number =>
	differenceInCalendarDays(parseISO(currentDateIso), parseISO(launchDateIso)) +
	1;

const clampRatio = (ratio: number): number => Math.min(1, Math.max(0, ratio));

/**
 * Renders a 0..1 ratio as a fixed-width bar, e.g. 0.8 → "████░".
 *
 * Rounding choice: we round (not floor) so a small-but-real coverage still shows
 * at least a sliver of progress — reinforcing rule 2 (a modest day still looks
 * like forward motion). A true 0 stays fully empty; nothing is faked.
 */
export const renderCoverageBar = (ratio: number): string => {
	const filled = Math.round(clampRatio(ratio) * COVERAGE_BAR_WIDTH);
	return (
		FILLED_CELL.repeat(filled) + EMPTY_CELL.repeat(COVERAGE_BAR_WIDTH - filled)
	);
};

const renderPipelineRow = (pipeline: boolean[], gateLabel: string): string => {
	const cells = pipeline.map((passed) => (passed ? "✅" : "❌")).join(" ");
	return `Pipeline: ${cells}   (${gateLabel})`;
};

const renderCoverageRow = (coverage: CoverageBar[]): string => {
	const bars = coverage
		.map((c) => `${c.label} ${renderCoverageBar(c.ratio)}`)
		.join("  ");
	return `Coverage:  ${bars}`;
};

// Streak line is omitted when the daily-login streak feature is unavailable, but
// the percentile brag always survives — an average day still reads as a win.
const renderStandingRow = (
	streakDays: number | undefined,
	percentile: number
): string => {
	const beat = `beat ${percentile}% of devs`;
	if (streakDays === undefined) return `📊 ${beat}`;
	return `🔥 ${streakDays}-day streak · ${beat}`;
};

// Challenges the reader; never a confession. "stumped X%" reframes difficulty as
// the reader's dare, not the sharer's struggle.
const renderChallengeRow = (todayCategory: string, hardPct: number): string =>
	`Today's ${todayCategory} check stumped ${hardPct}%. Think you'd pass?`;

export const buildDailyResultShare = (data: DailyResultShareData): string => {
	const gateLabel = data.gateCleared
		? `Gate ${data.gateNumber} cleared`
		: `Gate ${data.gateNumber} reached`;

	return [
		`DevVoted — Build #${data.dayNumber} 🟢`,
		renderPipelineRow(data.pipeline, gateLabel),
		renderCoverageRow(data.coverage),
		renderStandingRow(data.streakDays, data.percentile),
		renderChallengeRow(data.todayCategory, data.hardPct),
		`▶ ${data.url ?? DEVVOTED_URL}`,
	].join("\n");
};
