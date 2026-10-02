import { KANTO_QUIZ } from "~/test/kanto";
import { gateRoster } from "~/test/swatchTrack.factory";

import type {
	DexAuditDetail,
	DexAuditRow,
	DexAuditsProps,
} from "~/ui/kanto-theme/DexAudits.ui";
import type { ConfigUnlockPath } from "~/ui/kanto-theme/ConfigUnlock.ui";
import type {
	DexConfigCard,
	DexConfigDetail,
	DexConfigRow,
	DexConfigsProps,
} from "~/ui/kanto-theme/DexConfigs.ui";
import type {
	DexControlDetail,
	DexControlRow,
	DexControlsProps,
} from "~/ui/kanto-theme/DexControls.ui";
import type {
	DexPollDetail,
	DexPollRow,
	DexPollsProps,
} from "~/ui/kanto-theme/DexPolls.ui";
import type {
	DexRunDetail,
	DexRunRow,
	DexRunsProps,
} from "~/ui/kanto-theme/DexRuns.ui";
import type {
	DexSwatchDetail,
	DexSwatchRow,
	DexSwatchesProps,
} from "~/ui/kanto-theme/DexSwatches.ui";
import { REDACTED } from "~/ui/kanto-theme/Redaction.ui";
import type { SegmentedItem } from "~/ui/kanto-theme/Segmented.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

type PollFixture = {
	id: string;
	number: string;
	category: string;
	question?: string;
	timesSeen?: number;
	answered?: number;
	correct?: number;
	accuracy?: number | null;
};

export const dexPollFixtures: readonly PollFixture[] = [
	{
		id: "1",
		number: "#001",
		category: "TypeScript",
		question: KANTO_QUIZ[0].question,
		timesSeen: 5,
		answered: 4,
		correct: 3,
		accuracy: 75,
	},
	{ id: "4", number: "#004", category: "TypeScript" },
	{
		id: "2",
		number: "#002",
		category: "JavaScript",
		question: KANTO_QUIZ[1].question,
		timesSeen: 2,
		answered: 2,
		correct: 2,
		accuracy: 100,
	},
	{
		id: "3",
		number: "#003",
		category: "JavaScript",
		question: KANTO_QUIZ[2].question,
		timesSeen: 1,
		answered: 0,
		correct: 0,
		accuracy: null,
	},
];

export const dexPollRow = (poll: PollFixture): DexPollRow =>
	poll.question === undefined
		? { id: poll.id, number: poll.number, locked: true }
		: {
				id: poll.id,
				number: poll.number,
				question: poll.question,
				answered: poll.answered ?? 0,
				correct: poll.correct ?? 0,
			};

export const dexPollDetail = (poll: PollFixture): DexPollDetail =>
	poll.question === undefined
		? {
				number: poll.number,
				category: poll.category,
				locked: true,
			}
		: {
				number: poll.number,
				category: poll.category,
				question: poll.question,
				timesSeen: poll.timesSeen ?? 0,
				answered: poll.answered ?? 0,
				correct: poll.correct ?? 0,
				accuracy: poll.accuracy ?? null,
			};

export const dexPollFilters: readonly SegmentedItem<string>[] = [
	{ value: "all", label: "all" },
	{ value: "ts", mark: "TypeScript", label: "1 of 2" },
	{ value: "js", mark: "JavaScript", label: "2 of 2" },
];

export const dexPollsProps = (
	overrides: Partial<DexPollsProps> = {}
): DexPollsProps => ({
	filters: dexPollFilters,
	filter: "all",
	rows: dexPollFixtures.map(dexPollRow),
	selectedId: dexPollFixtures[0].id,
	detail: dexPollDetail(dexPollFixtures[0]),
	count: "187 of 423",
	meta: "12 categories",
	note: "A poll enters the dex the first time it is dealt to you.",
	onSelect: () => {},
	onFilter: () => {},
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

export const dexConfigCards: readonly DexConfigCard[] = [
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
];

const slotsOf = (card: DexConfigCard): number => card.slots ?? 1;

const figureOn = (card: DexConfigCard): string | undefined => {
	const badge = card.badges?.find((entry) => "color" in entry);
	return badge?.label;
};

export const dexConfigRow = (card: DexConfigCard): DexConfigRow =>
	card.locked === true
		? { id: card.id, slots: slotsOf(card), locked: true }
		: {
				id: card.id,
				slots: slotsOf(card),
				name: card.name,
				figure: figureOn(card),
				version: card.version,
			};

export const dexConfigDetail = (card: DexConfigCard): DexConfigDetail => ({
	label: card.locked === true ? REDACTED : card.name,
	card,
});

const heldIn = (cards: readonly DexConfigCard[]): string =>
	`${cards.filter((card) => card.locked !== true).length} of ${cards.length}`;

const weightsIn = (cards: readonly DexConfigCard[]): readonly number[] =>
	[...new Set(cards.map(slotsOf))].sort((a, b) => a - b);

export const dexConfigFilters = (
	cards: readonly DexConfigCard[] = dexConfigCards
): readonly SegmentedItem<string>[] => [
	{ value: "all", label: "all" },
	...weightsIn(cards).map((weight) => ({
		value: String(weight),
		mark: String(weight),
		label: heldIn(cards.filter((card) => slotsOf(card) === weight)),
	})),
];

export const dexConfigsProps = (
	overrides: Partial<DexConfigsProps> = {}
): DexConfigsProps => ({
	filters: dexConfigFilters(),
	filter: "all",
	rows: dexConfigCards.map(dexConfigRow),
	selectedId: dexConfigCards[0].id,
	detail: dexConfigDetail(dexConfigCards[0]),
	count: heldIn(dexConfigCards),
	meta: "by weight",
	note: "Configs in the deck can be dealt into a hand or offered in the shop.",
	onSelect: () => {},
	onFilter: () => {},
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

export const dexAuditDetail = (row: DexAuditRow): DexAuditDetail =>
	row.locked === true
		? { label: REDACTED, gates: row.gates, locked: true }
		: {
				label: String(row.code),
				gates: row.gates,
				code: row.code,
				name: row.name,
				rule: row.rule,
			};

export const dexAuditFilters: readonly SegmentedItem<string>[] = [
	{ value: "all", label: "all" },
	{ value: "3", mark: "3", label: "1 of 2" },
	{ value: "4", mark: "4", label: "1 of 3" },
];

export const dexAuditsProps = (
	overrides: Partial<DexAuditsProps> = {}
): DexAuditsProps => ({
	filters: dexAuditFilters,
	filter: "all",
	rows: dexAuditRows,
	selectedId: dexAuditRows[0].id,
	detail: dexAuditDetail(dexAuditRows[0]),
	count: "7 of 16",
	meta: "HTTP codes",
	note: "An audit is logged the first time it fires.",
	onSelect: () => {},
	onFilter: () => {},
	...overrides,
});

const swatchFillAt = (gate: number, swept: number): SwatchFill => {
	const swatch = gateRoster[gate];
	if (gate < swept) return { state: "discovered", swatch };
	return gate === swept
		? { state: "current", swatch }
		: { state: "undiscovered" };
};

const swatchRowAt = (gate: number, swept: number): DexSwatchRow => ({
	id: String(gate),
	name: gateRoster[gate].gateName,
	swatch: swatchFillAt(gate, swept),
	note: gate < swept ? "swept" : `gate ${gate}`,
});

export const dexSwatchRows = (swept = 4): readonly DexSwatchRow[] =>
	gateRoster.map((_, gate) => swatchRowAt(gate, swept));

export const dexSwatchDetail = (row: DexSwatchRow): DexSwatchDetail => ({
	label: row.name,
	swatch: row.swatch,
	note: `gate ${row.id}`,
	rule:
		row.swatch.state === "discovered"
			? "Minted. You covered every change."
			: "Cover every change this gate ships to mint it.",
});

export const dexSwatchesProps = (
	overrides: Partial<DexSwatchesProps> = {}
): DexSwatchesProps => ({
	rows: dexSwatchRows(),
	selectedId: "0",
	detail: dexSwatchDetail(dexSwatchRows()[0]),
	count: "4 of 13",
	meta: "one a gate, swept",
	note: "A swatch is earned by covering every change its gate ships.",
	onSelect: () => {},
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
		id: "1",
		date: "11 Sep",
		swatches: runTrack([0, 1, 2, 3]),
		outcome: "Lavender held",
		coverage: "56%",
		band: "healthy",
	},
	{
		id: "2",
		date: "28 Aug",
		swatches: runTrack([0, 1, 2]),
		outcome: "Thunder held",
		coverage: "34%",
		band: "shaky",
	},
	{
		id: "3",
		date: "22 Jul",
		swatches: runTrack([0]),
		outcome: "Boulder held",
		coverage: "20%",
		band: "danger",
	},
];

export const dexRunDetail = (row: DexRunRow): DexRunDetail => ({
	label: row.date,
	swatches: row.swatches,
	outcome: row.outcome,
	coverage: row.coverage,
	band: row.band,
	href: `/runs/${row.id}`,
});

export const dexRunsProps = (
	overrides: Partial<DexRunsProps> = {}
): DexRunsProps => ({
	rows: dexRunRows,
	selectedId: dexRunRows[0].id,
	detail: dexRunDetail(dexRunRows[0]),
	count: "3 runs",
	meta: "best reached gate 9",
	note: "Coverage is the run's final score against its window.",
	onSelect: () => {},
	...overrides,
});

export const dexControlRows: readonly DexControlRow[] = [
	{
		id: "rebuild",
		glyph: "↻",
		title: "Rebuild the registry",
		detail: "Every shop · this visit",
		price: "from 4 KB, doubling",
	},
	{
		id: "extend",
		glyph: "+",
		title: "Extend the registry",
		detail: "Shop from Cascade · rest of the run",
		locked: true,
		unlock: "Reach Cascade",
	},
	{
		id: "hotReload",
		glyph: "⇋",
		title: "Hot reload one offer",
		detail: "Every shop · this visit",
		locked: true,
		unlock: "Rebuild 5 times",
	},
	{
		id: "returnPolicy",
		glyph: "↩",
		title: "Return policy",
		detail: "Every shop · this visit",
		locked: true,
		unlock: "Sell 5 configs",
	},
	{
		id: "abandon",
		glyph: "✕",
		title: "kill -9",
		detail: "Every shop · ends the run",
		locked: true,
		unlock: "Clear gate 5",
	},
	{
		id: "pin",
		glyph: "⚑",
		title: "git tag",
		detail: "Shop, gates 4–10 · carries into your next run",
		locked: true,
		unlock: "Reach gate 4",
	},
	{
		id: "bootCache",
		glyph: "▮",
		title: "Boot Cache",
		detail: "New run · banked at the start",
		locked: true,
		unlock: "Bank 256 KB in one run",
	},
	{
		id: "dockerImage",
		glyph: "⧉",
		title: "Docker Image",
		detail: "New run · offered in the first shop",
		locked: true,
		unlock: "Keep a starting config to the end",
	},
];

export const dexControlDetail = (row: DexControlRow): DexControlDetail => ({
	label: row.title,
	control: row,
	availability: "On sale in every shop from the first gate.",
});

export const dexControlsProps = (
	overrides: Partial<DexControlsProps> = {}
): DexControlsProps => ({
	rows: dexControlRows,
	selectedId: dexControlRows[0].id,
	detail: dexControlDetail(dexControlRows[0]),
	onSelect: () => {},
	count: "1 of 8",
	meta: "earned once · carried per run",
	note: "A service is unlocked once, for good. What a run carries is picked at new run and paid from the archive; a carried service is then pressed in the shop for the run's own storage.",
	...overrides,
});
