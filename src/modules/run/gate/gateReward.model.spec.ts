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
			configBonuses: [{ configId: "agents-md", value: 0.5 }],
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
	configs: [
		CONFIGS.css,
		CONFIGS.agentsMd,
		CONFIGS.indexedDb,
		CONFIGS.unitTests,
	],
	checks,
};

describe(gateRewardRows, () => {
	it("uses each config's roster description verbatim", () => {
		const rows = gateRewardRows(input);
		expect(rows.find((row) => row.key === "agents-md")?.description).toBe(
			CONFIGS.agentsMd.description
		);
		expect(rows.find((row) => row.key === "indexed-db")?.description).toBe(
			CONFIGS.indexedDb.description
		);
	});

	it("attributes coverage per config by summing per-answer breakdowns", () => {
		const rows = gateRewardRows(input);
		expect(rows.find((row) => row.key === "css")?.value).toBe("+0.2%");
		expect(rows.find((row) => row.key === "agents-md")?.value).toBe("+0.5%");
	});

	it("computes storage as per-correct × correct answers", () => {
		const rows = gateRewardRows(input);
		// 2 correct answers × 8KB.
		expect(rows.find((row) => row.key === "indexed-db")?.value).toBe("+16KB");
	});

	it("shows Unit Tests' flat payout as its value, judged by the Correct check", () => {
		const rows = gateRewardRows(input);
		const unitTests = rows.find((row) => row.key === "unit-tests");
		expect(unitTests?.value).toBe("+32KB");
		expect(unitTests?.kind).toBe("storage");
		expect(unitTests?.status).toBe("passed");
	});

	it("swaps the flat payout for the unmet progress when the Correct check failed", () => {
		const failed: CheckStatus[] = [
			{
				label: "Correct",
				progress: "0/1",
				current: 0,
				target: 1,
				state: "failed",
				sourceConfigId: "unit-tests",
				description: "1 correct answer",
			},
		];
		const row = gateRewardRows({ ...input, checks: failed }).find(
			(candidate) => candidate.key === "unit-tests"
		);
		expect(row?.status).toBe("failed");
		expect(row?.value).toBe("0/1");
	});

	it("reads check progress as the value for a pure-check row (linter)", () => {
		const lintCheck: CheckStatus[] = [
			{
				label: "ESLint linted",
				progress: "1/2",
				current: 1,
				target: 2,
				state: "failed",
				sourceConfigId: "eslint",
			},
		];
		const row = gateRewardRows({
			...input,
			configs: [CONFIGS.eslint],
			checks: lintCheck,
		}).find((candidate) => candidate.key === "eslint");
		expect(row?.kind).toBe("check");
		expect(row?.value).toBe("1/2");
		expect(row?.status).toBe("failed");
	});

	it("prefers the exact capped faucet income when the engine provides it", () => {
		const rows = gateRewardRows({ ...input, faucetThisGateKb: 12 });
		expect(rows.find((row) => row.key === "indexed-db")?.value).toBe("+12KB");
	});

	it("states the escalated demand on the check row, not the roster text", () => {
		const escalated: CheckStatus[] = [
			{
				label: "Correct",
				progress: "2/3",
				current: 2,
				target: 3,
				state: "failed",
				sourceConfigId: "unit-tests",
				description: "3 correct answers",
			},
		];
		const row = gateRewardRows({ ...input, checks: escalated }).find(
			(candidate) => candidate.key === "unit-tests"
		);
		expect(row?.status).toBe("failed");
		expect(row?.description).toBe(
			"Requires 3 correct answers to pass the gate."
		);
	});

	it("keeps the roster text when the check carries no demand", () => {
		const bare: CheckStatus[] = [
			{
				label: "Correct",
				progress: "2/1",
				current: 2,
				target: 1,
				state: "success",
				sourceConfigId: "unit-tests",
			},
		];
		const row = gateRewardRows({ ...input, checks: bare }).find(
			(candidate) => candidate.key === "unit-tests"
		);
		expect(row?.description).toBe(CONFIGS.unitTests.description);
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
		// Unit Tests now rows as storage (+32KB on clear), not as a bare check.
		const rows = gateRewardRows(input);
		expect(rows.map((row) => row.kind)).toEqual([
			"coverage",
			"coverage",
			"storage",
			"storage",
		]);
	});
});

describe(gateStorageGained, () => {
	it("adds the clear payout to every per-correct payout", () => {
		// 120 clear payout + (2 correct × 8KB).
		expect(gateStorageGained(input.configs, answered, 120)).toBe(136);
	});

	it("uses the exact capped faucet income when provided", () => {
		expect(gateStorageGained(input.configs, answered, 120, 12)).toBe(132);
	});
});
