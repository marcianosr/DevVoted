import { KANTO_QUIZ } from "~/test/kanto";
import { gateRoster } from "~/test/swatchTrack.factory";

import type {
	DexAuditRow,
	DexAuditsProps,
} from "~/ui/kanto-theme/DexAudits.ui";
import type { ConfigUnlockPath } from "~/ui/kanto-theme/ConfigUnlock.ui";
import type {
	DexConfigCard,
	DexConfigsProps,
	DexWeightGroup,
} from "~/ui/kanto-theme/DexConfigs.ui";
import type {
	DexControlRow,
	DexControlsProps,
} from "~/ui/kanto-theme/DexControls.ui";
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

const FIGURE_COLOR = "viridian" as const;

const lockPaths = (
	thematic: string,
	count: number,
	target: number,
	fallbackTarget: number
): readonly ConfigUnlockPath[] => [
	{ text: thematic, progress: { count, target } },
	{
		text: `Answer ${fallbackTarget} polls`,
		progress: { count: 43, target: fallbackTarget },
	},
];

const STARTER_PROVENANCE = "Starter config";

const noteLine = (provenance: string, maxVersion?: number): string =>
	maxVersion === undefined ? provenance : `${provenance} · v1 of ${maxVersion}`;

type GrantedCard = {
	id: string;
	name: string;
	slots: number;
	effect: string;
	provenance?: string;
	figure?: string;
	maxVersion?: number;
};

const grantedCard = ({
	id,
	name,
	slots,
	effect,
	provenance,
	figure,
	maxVersion,
}: GrantedCard): DexConfigCard => ({
	id,
	name,
	slots,
	version: maxVersion,
	badges: figure === undefined ? [] : [{ label: figure, color: FIGURE_COLOR }],
	info: {
		description: effect,
		slots,
		note: noteLine(provenance ?? STARTER_PROVENANCE, maxVersion),
	},
});

export const dexConfigGroups: readonly DexWeightGroup[] = [
	{
		weight: 2,
		label: "weight 2",
		held: "3 of 5",
		chips: [
			grantedCard({
				id: "codeCoverage",
				name: "Code Coverage",
				slots: 2,
				effect: "Correct answers pay +10% coverage",
				figure: "+10%",
			}),
			grantedCard({
				id: "indexedDb",
				name: "IndexedDB",
				slots: 2,
				effect: "+8KB per correct answer, up to 320KB a run",
				figure: "+8 KB",
			}),
			grantedCard({
				id: "regressionTest",
				name: "Regression Test",
				slots: 2,
				effect: "Polls you have previously missed pay ×2 coverage",
				provenance: "Earned: answered 25 polls correctly",
				figure: "×2",
			}),
			{
				id: "planningPoker",
				name: "Planning Poker",
				slots: 2,
				badges: [],
				unlock: lockPaths("Land 3 exact estimates", 1, 3, 575),
			},
			{
				id: "lock",
				locked: true,
				slots: 2,
				unlock: lockPaths("Lock 5 shop offers", 2, 5, 550),
			},
		],
	},
	{
		weight: 1,
		label: "weight 1",
		held: "2 of 3",
		chips: [
			grantedCard({
				id: "js",
				name: ".js",
				slots: 1,
				effect: "JavaScript polls reward ×1.25 coverage",
				figure: "×1.25",
				maxVersion: 5,
			}),
			grantedCard({
				id: "eslint",
				name: "ESLint",
				slots: 1,
				effect: "Cross out a wrong answer on JavaScript / TypeScript polls",
			}),
			{
				id: "html",
				locked: true,
				slots: 1,
				unlock: lockPaths("Answer 10 HTML polls correctly", 4, 10, 25),
			},
		],
	},
];

export const dexConfigsProps = (
	overrides: Partial<DexConfigsProps> = {}
): DexConfigsProps => ({
	groups: dexConfigGroups,
	count: "18 of 44",
	meta: "by weight",
	note: "Configs in the deck can be dealt into a hand or offered in the shop.",
	openInfo: new Set(),
	onToggleInfo: () => {},
	onToggleAll: () => {},
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
		href: "/runs/1",
		date: "11 Sep",
		swatches: runTrack([0, 1, 2, 3]),
		outcome: "Lavender held",
		coverage: "56%",
		band: "healthy",
	},
	{
		runId: 2,
		href: "/runs/2",
		date: "28 Aug",
		swatches: runTrack([0, 1, 2]),
		outcome: "Thunder held",
		coverage: "34%",
		band: "shaky",
	},
	{
		runId: 3,
		href: "/runs/3",
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

export const dexControlRows: readonly DexControlRow[] = [
	{
		id: "rebuild",
		glyph: "↻",
		title: "Rebuild the registry",
		detail: "Registry · this visit",
		price: "from 4 KB, doubling",
	},
	{
		id: "extend",
		glyph: "+",
		title: "Extend the registry",
		detail: "Registry · rest of the run",
		locked: true,
		unlock: "Reach Cascade",
	},
	{
		id: "hotReload",
		glyph: "⇋",
		title: "Hot reload one offer",
		detail: "Registry · this visit",
		locked: true,
		unlock: "Rebuild 5 times",
	},
	{
		id: "returnPolicy",
		glyph: "↩",
		title: "Return policy",
		detail: "Registry · this visit",
		locked: true,
		unlock: "Sell 5 configs",
	},
	{
		id: "abandon",
		glyph: "✕",
		title: "kill -9",
		detail: "Registry · ends the run",
		locked: true,
		unlock: "Clear gate 5",
	},
	{
		id: "pin",
		glyph: "⚑",
		title: "git tag",
		detail: "Run · carries into your next run",
		locked: true,
		unlock: "Reach gate 4",
	},
	{
		id: "bootCache",
		glyph: "▮",
		title: "Boot Cache",
		detail: "Next run · consumed on start",
		locked: true,
		unlock: "Bank 256 KB in one run",
	},
	{
		id: "dockerImage",
		glyph: "⧉",
		title: "Docker Image",
		detail: "Next run · spent in the first shop",
		locked: true,
		unlock: "Keep a starting config to the end",
	},
];

export const dexControlsProps = (
	overrides: Partial<DexControlsProps> = {}
): DexControlsProps => ({
	rows: dexControlRows,
	count: "1 of 8",
	meta: "registry, then run",
	note: "A service is unlocked once, for good. A registry service is then bought in the shop with the run's own storage; a run service once a run, before it, from the archive.",
	...overrides,
});
