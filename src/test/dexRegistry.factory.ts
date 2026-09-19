import { KANTO_QUIZ } from "~/test/kanto";
import { gateRoster } from "~/test/swatchTrack.factory";

import type {
	DexAuditRow,
	DexAuditsProps,
} from "~/ui/kanto-theme/DexAudits.ui";
import type {
	DexConfigRow,
	DexConfigsProps,
} from "~/ui/kanto-theme/DexConfigs.ui";
import type { DexPollRow, DexPollsProps } from "~/ui/kanto-theme/DexPolls.ui";
import type { DexRunRow, DexRunsProps } from "~/ui/kanto-theme/DexRuns.ui";
import type {
	DexSwatchCard,
	DexSwatchesProps,
} from "~/ui/kanto-theme/DexSwatches.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

const CATEGORIES = ["TypeScript", "JavaScript", "CSS", "HTML"];

export const dexPollRows: readonly DexPollRow[] = [
	{
		id: 1,
		category: CATEGORIES[0],
		question: KANTO_QUIZ[0].question,
		answered: 4,
		correct: 3,
	},
	{
		id: 2,
		category: CATEGORIES[1],
		question: KANTO_QUIZ[1].question,
		answered: 2,
		correct: 2,
	},
	{
		id: 3,
		category: CATEGORIES[2],
		question: KANTO_QUIZ[2].question,
		answered: 0,
		correct: 0,
	},
	{ id: 4, locked: true },
];

export const dexPollsProps = (
	overrides: Partial<DexPollsProps> = {}
): DexPollsProps => ({
	rows: dexPollRows,
	count: "187 of 423",
	meta: "12 categories",
	note: "A poll enters the dex the first time it is dealt to you.",
	...overrides,
});

export const dexConfigRows: readonly DexConfigRow[] = [
	{
		id: "js",
		slots: 1,
		state: "granted",
		name: ".js",
		effect: "JavaScript polls reward ×1.25 coverage",
		provenance: "Starter config",
		starter: true,
		versions: [
			{
				version: 1,
				effect: "JavaScript polls reward ×1.25 coverage",
				price: null,
			},
			{
				version: 2,
				effect: "JavaScript polls reward ×1.5 coverage",
				price: "64 KB",
			},
			{
				version: 3,
				effect: "JavaScript polls reward ×1.75 coverage",
				price: "96 KB",
			},
		],
	},
	{
		id: "cache",
		slots: 4,
		state: "granted",
		name: "Cache",
		effect: "+0.25 a cached hit, up to four hits",
		provenance: "Earned: sweep three gates",
		starter: false,
	},
	{
		id: "agents",
		slots: 8,
		state: "locked",
		paths: [
			{ text: "Hold 2 MB in the archive", progress: { count: 1, target: 2 } },
			{ text: "Answer 225 polls", progress: { count: 43, target: 225 } },
		],
	},
];

export const dexConfigsProps = (
	overrides: Partial<DexConfigsProps> = {}
): DexConfigsProps => ({
	rows: dexConfigRows,
	count: "18 of 44",
	meta: "by weight",
	note: "Configs in the deck can be dealt into a hand or offered in the shop.",
	onVersion: () => {},
	...overrides,
});

export const dexAuditRows: readonly DexAuditRow[] = [
	{
		id: "cost-overrun",
		gates: "gate 3",
		code: 402,
		name: "Payment Required",
		rule: "paid actions cost double this gate",
	},
	{
		id: "dependency-outage",
		gates: "gates 8–10",
		code: 424,
		name: "Failed Dependency",
		rule: "one config sits out the attempt",
	},
	{ id: "legal-hold", gates: "gates 4–7", locked: true },
];

export const dexAuditsProps = (
	overrides: Partial<DexAuditsProps> = {}
): DexAuditsProps => ({
	rows: dexAuditRows,
	count: "7 of 16",
	meta: "HTTP codes",
	note: "An audit is logged the first time it fires.",
	...overrides,
});

const swatchCardAt = (gate: number, swept: number): DexSwatchCard => {
	const swatch = gateRoster[gate];
	const fill: SwatchFill =
		gate < swept
			? { state: "discovered", swatch }
			: gate === swept
				? { state: "current", swatch }
				: { state: "undiscovered" };

	return {
		gate,
		name: swatch.gateName,
		swatch: fill,
		note: gate < swept ? "swept" : `gate ${gate}`,
	};
};

export const dexSwatchCards = (swept = 4): readonly DexSwatchCard[] =>
	gateRoster.map((_, gate) => swatchCardAt(gate, swept));

export const dexSwatchesProps = (
	overrides: Partial<DexSwatchesProps> = {}
): DexSwatchesProps => ({
	cards: dexSwatchCards(),
	count: "4 of 13",
	meta: "one a gate, swept",
	note: "A swatch is earned by answering all five polls of its gate.",
	...overrides,
});

const runTrack = (earned: readonly number[]): readonly SwatchFill[] =>
	gateRoster.map((swatch, gate) =>
		earned.includes(gate)
			? { state: "discovered", swatch }
			: { state: "undiscovered" }
	);

export const dexRunRows: readonly DexRunRow[] = [
	{
		runId: 1,
		date: "11 Sep",
		swatches: runTrack([0, 1, 2, 3]),
		outcome: "Lavender held",
		coverage: "56%",
		band: "healthy",
	},
	{
		runId: 2,
		date: "28 Aug",
		swatches: runTrack([0, 1, 2]),
		outcome: "Thunder held",
		coverage: "34%",
		band: "shaky",
	},
	{
		runId: 3,
		date: "22 Jul",
		swatches: runTrack([0]),
		outcome: "Boulder held",
		coverage: "20%",
		band: "danger",
	},
];

export const dexRunsProps = (
	overrides: Partial<DexRunsProps> = {}
): DexRunsProps => ({
	rows: dexRunRows,
	count: "3 runs",
	meta: "best reached gate 9",
	note: "Coverage is the run's final score against its window.",
	...overrides,
});
