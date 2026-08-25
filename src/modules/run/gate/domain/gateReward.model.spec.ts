import { describe, expect, it } from "vitest";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	gateRewardRows,
	gateStorageBreakdown,
	gateStorageGained,
} from "~/modules/run/gate/domain/gateReward.model";

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

const input = {
	answered,
	configs: [
		CONFIGS.css,
		CONFIGS.agentsMd,
		CONFIGS.indexedDb,
		CONFIGS.unitTests,
	],
};

describe(gateRewardRows, () => {
	it("defers to each config's own roster text when it owes nothing extra", () => {
		const rows = gateRewardRows(input);
		expect(rows.find((row) => row.key === "agents-md")?.reason).toEqual({
			kind: "config",
		});
		expect(rows.find((row) => row.key === "indexed-db")?.reason).toEqual({
			kind: "config",
		});
	});

	it("attributes coverage per config by summing per-answer breakdowns", () => {
		const rows = gateRewardRows(input);
		expect(rows.find((row) => row.key === "css")?.value).toEqual({
			unit: "percent",
			amount: 0.2,
		});
		expect(rows.find((row) => row.key === "agents-md")?.value).toEqual({
			unit: "percent",
			amount: 0.5,
		});
	});

	it("computes storage as per-correct × correct answers", () => {
		const rows = gateRewardRows(input);
		// 2 correct answers × 8KB.
		expect(rows.find((row) => row.key === "indexed-db")?.value).toEqual({
			unit: "kb",
			amount: 16,
		});
	});

	it("shows Unit Tests' flat payout as a passed storage row", () => {
		const rows = gateRewardRows(input);
		const unitTests = rows.find((row) => row.key === "unit-tests");
		expect(unitTests?.value).toEqual({ unit: "kb", amount: 32 });
		expect(unitTests?.kind).toBe("storage");
		expect(unitTests?.status).toBe("passed");
	});

	it("prefers the exact capped faucet income when the engine provides it", () => {
		const rows = gateRewardRows({ ...input, faucetThisGateKb: 12 });
		expect(rows.find((row) => row.key === "indexed-db")?.value).toEqual({
			unit: "kb",
			amount: 12,
		});
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
		expect(ts?.reason).toEqual({ kind: "noPollInCategory", category: "ts" });
		expect(ts?.value).toEqual({ unit: "none" });
	});

	it("still passes a focus config whose category was missed — nothing demands anymore (ADR-035)", () => {
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
		expect(css?.status).toBe("passed");
		expect(css?.reason).toEqual({ kind: "config" });
	});

	it("orders rows coverage → storage", () => {
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

describe(gateStorageBreakdown, () => {
	const breakdownInput = {
		answered,
		configs: input.configs,
		gateReward: 120,
	};

	it("gives each paying config a row and leaves the rest out", () => {
		const { rows } = gateStorageBreakdown(breakdownInput);
		expect(rows.map(({ key, kb }) => ({ key, kb }))).toEqual([
			// 2 correct × 8KB, the faucet's own income for the gate.
			{ key: "indexed-db", kb: 16 },
			{ key: "unit-tests", kb: 32 },
		]);
	});

	it("carries the config itself, so the ledger can chip it by rarity", () => {
		const [faucet] = gateStorageBreakdown(breakdownInput).rows;
		expect(faucet?.config).toBe(CONFIGS.indexedDb);
	});

	it("leaves the gate's own payout in the base once the configs are attributed", () => {
		// 136 gained − 16 faucet − 32 on-clear.
		expect(gateStorageBreakdown(breakdownInput).baseKb).toBe(88);
	});

	it("totals to the figure the clear screen headlines", () => {
		const { baseKb, rows, totalKb } = gateStorageBreakdown(breakdownInput);
		expect(totalKb).toBe(gateStorageGained(input.configs, answered, 120));
		expect(baseKb + rows.reduce((sum, row) => sum + row.kb, 0)).toBe(totalKb);
	});

	it("credits the faucet with the capped income rather than the uncapped rate", () => {
		const { rows, baseKb } = gateStorageBreakdown({
			...breakdownInput,
			faucetThisGateKb: 4,
		});
		expect(rows).toContainEqual({
			key: "indexed-db",
			config: CONFIGS.indexedDb,
			kb: 4,
		});
		expect(baseKb).toBe(88);
	});

	it("scales a flat on-clear payout with the config's level", () => {
		const { rows } = gateStorageBreakdown({
			...breakdownInput,
			configs: [{ ...CONFIGS.unitTests, level: 3 }],
		});
		expect(rows.map(({ key, kb }) => ({ key, kb }))).toEqual([
			{ key: "unit-tests", kb: 96 },
		]);
	});

	// No config on the roster draws on the extra-pick pot any more — `.length` is
	// pure information now — so the ledger's fourth source is exercised by a
	// config built for it. If it gains no owner, the pot and this test go too.
	const PER_EXTRA_PICK: Config = {
		id: "per-extra-pick",
		label: "Per extra pick",
		family: "economy",
		description: "Pays per correct answer beyond one per poll.",
		rewardMultiplier: 1,
		storagePerExtraPick: 16,
	};

	it("attributes interest and extra-pick payouts to the configs that earned them", () => {
		const { rows } = gateStorageBreakdown({
			...breakdownInput,
			configs: [CONFIGS.mooresLaw, PER_EXTRA_PICK],
			interestThisGateKb: 12,
			extraPickThisGateKb: 32,
		});
		expect(rows.map(({ key, kb }) => ({ key, kb }))).toEqual([
			{ key: "moores-law", kb: 12 },
			{ key: "per-extra-pick", kb: 32 },
		]);
	});

	it("banks storage no equipped config can account for in the base", () => {
		// The pots are slices of the clear payout, not money on top of it. With no
		// interest config equipped the 20KB has no row to sit on, so it stays in
		// the base — the total never moves and no phantom row appears.
		const { baseKb, rows, totalKb } = gateStorageBreakdown({
			...breakdownInput,
			interestThisGateKb: 20,
		});
		expect(rows).toEqual(gateStorageBreakdown(breakdownInput).rows);
		expect(baseKb).toBe(88);
		expect(totalKb).toBe(136);
	});

	it("splits one pot across every config drawing on it", () => {
		const { rows } = gateStorageBreakdown({
			...breakdownInput,
			configs: [
				CONFIGS.indexedDb,
				{
					...CONFIGS.indexedDb,
					id: "ssd",
					label: "SSD",
					storagePerCorrect: 24,
				},
			],
			faucetThisGateKb: 64,
		});
		// 8:24 rates split the capped 64KB one-quarter / three-quarters.
		expect(rows.map((row) => row.kb)).toEqual([16, 48]);
	});
});
