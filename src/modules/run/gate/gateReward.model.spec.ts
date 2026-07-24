import { describe, expect, it } from "vitest";

import type { AnsweredPoll } from "../climb/run.model";
import { CONFIGS } from "../configs/configRoster.model";
import type { CheckStatus } from "../configs/effect.model";
import { gateRewardRows, gateStorageGained } from "./gateReward.model";

const answered: AnsweredPoll[] = [
	{
		id: "css1",
		question: "CSS?",
		category: "css",
		outcome: "correct",
		picked: ["a"],
		coverageBreakdown: {
			base: 0.4,
			streakBonus: 0,
			configBonuses: [{ configId: "css", value: 0.2 }],
		},
	},
	{
		id: "js1",
		question: "JS?",
		category: "js",
		outcome: "correct",
		picked: ["b"],
		coverageBreakdown: {
			base: 0.5,
			streakBonus: 0,
			configBonuses: [{ configId: "copilot", value: 0.5 }],
		},
	},
	{
		id: "js2",
		question: "JS again?",
		category: "js",
		outcome: "wrong",
		picked: ["c"],
	},
];

const checks: CheckStatus[] = [
	{
		label: "Correct",
		progress: "2/1",
		current: 2,
		target: 1,
		state: "success",
		sourceConfigId: "unit-tests",
		description: "1 correct answer",
	},
];

const input = {
	answered,
	configs: [CONFIGS.css, CONFIGS.copilot, CONFIGS.indexedDb, CONFIGS.unitTests],
	checks,
};

describe(gateRewardRows, () => {
	it("uses each config's roster description verbatim", () => {
		const rows = gateRewardRows(input);
		expect(rows.find((row) => row.key === "copilot")?.description).toBe(
			CONFIGS.copilot.description
		);
		expect(rows.find((row) => row.key === "indexed-db")?.description).toBe(
			CONFIGS.indexedDb.description
		);
	});

	it("attributes coverage per config by summing per-answer breakdowns", () => {
		const rows = gateRewardRows(input);
		expect(rows.find((row) => row.key === "css")?.value).toBe("+0.2%");
		expect(rows.find((row) => row.key === "copilot")?.value).toBe("+0.5%");
	});

	it("computes storage as per-correct × correct answers", () => {
		const rows = gateRewardRows(input);
		// 2 correct answers × 8KB.
		expect(rows.find((row) => row.key === "indexed-db")?.value).toBe("+16KB");
	});

	it("reads check progress straight from the passed check", () => {
		const rows = gateRewardRows(input);
		expect(rows.find((row) => row.key === "unit-tests")?.value).toBe("2/1");
	});

	it("passes a focus config whose category showed and was answered right", () => {
		expect(gateRewardRows(input).find((row) => row.key === "css")?.status).toBe(
			"passed"
		);
	});

	it("skips a focus config whose category never appeared this gate", () => {
		const rows = gateRewardRows({ ...input, configs: [CONFIGS.ts] });
		const ts = rows.find((row) => row.key === "ts");
		expect(ts?.status).toBe("skipped");
		expect(ts?.description).toBe("no ts poll in this gate");
		expect(ts?.value).toBe("—");
	});

	it("fails a focus config whose category showed but wasn't answered right", () => {
		const wrongCss: AnsweredPoll[] = [
			{
				id: "css-wrong",
				question: "CSS?",
				category: "css",
				outcome: "wrong",
				picked: ["x"],
				coverageBreakdown: { base: -1.2, streakBonus: 0, configBonuses: [] },
			},
		];
		const css = gateRewardRows({
			...input,
			answered: wrongCss,
			configs: [CONFIGS.css],
		}).find((row) => row.key === "css");
		expect(css?.status).toBe("failed");
		expect(css?.description).toBe("needs 1 correct css, got 0");
		expect(css?.value).toBe("-1.2%");
	});

	it("orders rows coverage → storage → check with no synthetic bonus row", () => {
		const rows = gateRewardRows(input);
		expect(rows.map((row) => row.kind)).toEqual([
			"coverage",
			"coverage",
			"storage",
			"check",
		]);
	});
});

describe(gateStorageGained, () => {
	it("adds the clear bonus to every per-correct payout", () => {
		// 120 bonus + (2 correct × 8KB).
		expect(gateStorageGained(input.configs, answered, 120)).toBe(136);
	});
});
