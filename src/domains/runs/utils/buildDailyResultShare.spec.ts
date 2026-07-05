import { describe, it, expect } from "vitest";

import {
	buildDailyResultShare,
	getBuildNumber,
	renderCoverageBar,
	DEVVOTED_URL,
	type DailyResultShareData,
} from "./buildDailyResultShare";

// Banjo-Kazooie / Rare-flavoured fixture. Note: none of these strings are ever a
// poll option or correct answer — the builder has no access to answer text.
const baseData: DailyResultShareData = {
	dayNumber: 64,
	pipeline: [true, true, true, true, false],
	gateNumber: 3,
	gateCleared: true,
	coverage: [
		{ label: "JS", ratio: 0.8 },
		{ label: "CSS", ratio: 0.6 },
		{ label: "Git", ratio: 0.4 },
	],
	streakDays: 7,
	percentile: 82,
	todayCategory: "React",
	hardPct: 63,
};

describe("buildDailyResultShare", () => {
	it("renders the exact six-line CI-pipeline card", () => {
		const result = buildDailyResultShare(baseData);

		expect(result).toBe(
			[
				"DevVoted — Build #64 🟢",
				"Pipeline: ✅ ✅ ✅ ✅ ❌   (Gate 3 cleared)",
				"Coverage:  JS ████░  CSS ███░░  Git ██░░░",
				"🔥 7-day streak · beat 82% of devs",
				"Today's React check stumped 63%. Think you'd pass?",
				`▶ ${DEVVOTED_URL}`,
			].join("\n")
		);
	});

	it("maps pipeline booleans to ✅/❌ in attempt order", () => {
		const result = buildDailyResultShare({
			...baseData,
			pipeline: [false, true, true],
		});

		expect(result).toContain("Pipeline: ❌ ✅ ✅");
	});

	it("labels an in-progress gate as 'reached', never a raw failure state", () => {
		const result = buildDailyResultShare({ ...baseData, gateCleared: false });

		expect(result).toContain("(Gate 3 reached)");
		expect(result).not.toMatch(/LOW|fail|0\/5/i);
	});

	it("omits the streak segment when the daily-login streak is undefined", () => {
		const { streakDays: _streakDays, ...noStreak } = baseData;
		const result = buildDailyResultShare(noStreak);

		expect(result).not.toContain("streak");
		expect(result).toContain("📊 beat 82% of devs");
	});

	it("always keeps the acquisition link in the copied text", () => {
		expect(buildDailyResultShare(baseData)).toContain(DEVVOTED_URL);
	});

	it("frames the last line as a challenge to the reader, not a confession", () => {
		const result = buildDailyResultShare(baseData);

		expect(result).toContain("Think you'd pass?");
		expect(result).not.toMatch(/I (found|got|failed|struggled)/i);
	});

	it("never leaks per-question or correct-answer text", () => {
		// The builder's inputs are a fixed allowlist that carries no answer data.
		// Even if a category name coincides with an answer, only these tokens can
		// ever appear — there is no code path that surfaces which poll was wrong.
		const answerSentinel = "Array.prototype.at()";
		const result = buildDailyResultShare(baseData);

		expect(result).not.toContain(answerSentinel);
		expect(result).not.toMatch(/correct answer|you (chose|picked|answered)/i);
	});
});

describe("renderCoverageBar", () => {
	it("renders a full bar at ratio 1", () => {
		expect(renderCoverageBar(1)).toBe("█████");
	});

	it("renders an empty bar at true zero — nothing is faked", () => {
		expect(renderCoverageBar(0)).toBe("░░░░░");
	});

	it("rounds a small-but-real ratio up to a visible sliver of progress", () => {
		expect(renderCoverageBar(0.1)).toBe("█░░░░");
	});

	it("clamps ratios above 1 and below 0", () => {
		expect(renderCoverageBar(1.5)).toBe("█████");
		expect(renderCoverageBar(-0.5)).toBe("░░░░░");
	});
});

describe("getBuildNumber", () => {
	it("counts the launch day itself as Build #1", () => {
		expect(getBuildNumber("2026-05-13", "2026-05-13")).toBe(1);
	});

	it("counts calendar days since launch, 1-indexed", () => {
		// Marciano's birthday launch → Christmas Eve.
		expect(getBuildNumber("2026-05-13", "2026-05-14")).toBe(2);
		expect(getBuildNumber("2025-12-24", "2025-12-25")).toBe(2);
	});
});
