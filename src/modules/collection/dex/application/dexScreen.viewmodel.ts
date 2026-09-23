import { plural } from "~/shared/lib/displayValue";
import { CATEGORY_METADATA } from "~/shared/lib/categories";

import type { AuditdexEntry } from "~/modules/collection/dex/domain/auditdex.model";
import type { ConfigdexEntry } from "~/modules/collection/dex/domain/configdex.model";
import type { GatedexEntry } from "~/modules/collection/dex/domain/gatedex.model";
import {
	deepestGateIn,
	type RunHistoryEntry,
} from "~/modules/collection/dex/domain/runHistory.model";
import {
	polldexCoverage,
	presentCategories,
	type PolldexEntry,
} from "~/modules/collection/dex/domain/polldex.model";
import {
	baseSlotsOf,
	givesOf,
	isUpgradable,
	maxLevelOf,
	upgradeStorageCost,
	type Config,
} from "~/modules/run/config/domain/config.model";
import {
	figureLabel,
	rollOddsLabel,
} from "~/modules/run/config/application/configChip.viewmodel";
import { versionOddsFor } from "~/modules/run/shop/domain/draft.model";
import { kbLabel } from "~/shared/lib/storage";
import type { UnlockPathCaption } from "~/modules/run/config/domain/unlockCaption.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import { percentOf } from "~/modules/run/build/domain/coverageRatio.model";

import type { KantoColor } from "~/ui/kanto-theme/colors";
import {
	gatesLabelOf,
	type DexAuditRow,
	type DexAuditsProps,
} from "~/ui/kanto-theme/DexAudits.ui";
import type {
	DexConfigRow,
	DexConfigsData,
	DexUnlockPath,
	DexVersionRung,
} from "~/ui/kanto-theme/DexConfigs.ui";
import type { DexPollRow, DexPollsProps } from "~/ui/kanto-theme/DexPolls.ui";
import {
	heldOutcomeOf,
	WON_OUTCOME,
	type DexRunRow,
	type DexRunsProps,
} from "~/ui/kanto-theme/DexRuns.ui";
import {
	gateNoteOf,
	SWEPT_NOTE,
	type DexSwatchCard,
	type DexSwatchesProps,
} from "~/ui/kanto-theme/DexSwatches.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";
import type { TabItem } from "~/ui/kanto-theme/Tabs.ui";

export type DexTabId = "polls" | "configs" | "audits" | "swatches" | "runs";

export type DexTab = TabItem & { id: DexTabId; color: KantoColor };

/**
 * One colour per collection, so the whole screen reads as the tab you opened.
 *
 * Configs is the exception that proves it: a card grid is almost entirely
 * badges, and viridian is the one tab colour that tints the ground hard enough
 * to swallow them. Pallet sets no ground chroma, so the badges keep their own
 * colours and a gain still reads green against them.
 */
export const DEX_TABS = [
	{ id: "polls", label: "polls", color: "cerulean" },
	{ id: "configs", label: "configs", color: "pallet" },
	{ id: "audits", label: "audits", color: "saffron" },
	{ id: "swatches", label: "swatches", color: "lavender" },
	{ id: "runs", label: "runs", color: "pewter" },
] as const satisfies readonly DexTab[];

const FALLBACK_TAB = DEX_TABS[0];

export const isDexTabId = (value: string): value is DexTabId =>
	DEX_TABS.some((tab) => tab.id === value);

export const dexThemeOf = (activeId: string): KantoColor =>
	(DEX_TABS.find((tab) => tab.id === activeId) ?? FALLBACK_TAB).color;

const heldOf = (held: number, total: number): string => `${held} of ${total}`;

/* ---------------------------------------------------------------- polls -- */

const POLLS_NOTE =
	"A poll enters the dex the first time it is dealt to you. Repeats show how often and how you did.";

const pollRowFor = (entry: PolldexEntry): DexPollRow => {
	if (!entry.seen || entry.question === null) {
		return { id: entry.id, locked: true };
	}

	return {
		id: entry.id,
		category: CATEGORY_METADATA[entry.categoryCode].name,
		question: entry.question,
		answered: entry.answeredCount,
		correct: entry.correctCount,
	};
};

export const dexPollsFor = (
	entries: readonly PolldexEntry[]
): DexPollsProps => {
	const coverage = polldexCoverage([...entries]);

	return {
		rows: entries.map(pollRowFor),
		count: heldOf(coverage.seen, coverage.total),
		meta: plural(
			presentCategories([...entries]).length,
			"category",
			"categories"
		),
		note: POLLS_NOTE,
	};
};

/* -------------------------------------------------------------- configs -- */

const CONFIGS_NOTE =
	"Configs in the deck can be dealt into a hand or offered in the shop. A version ladder is bought with storage inside a run and lost when the run ends. About one shop in eight the registry rolls a newer version of one installed config at its registry price: one rung up, then a coin flip per further rung until the ladder ends. Odds read from a fresh install. Locked ones name their condition.";
const CONFIGS_META = "by weight";

const pathFor = (caption: UnlockPathCaption): DexUnlockPath => ({
	text: caption.text,
	progress:
		caption.kind === "counted"
			? { count: caption.count, target: caption.target }
			: null,
});

const FIRST_VERSION = 1;

/**
 * The in-run version ladder, read straight off the catalogue. A config's level
 * is bought with storage during a run and dies with it, so there is no held
 * version to mark here: a rung is a thing to read, not a thing you own.
 *
 * `givesOf` is level-aware for exactly the upgradable set, so re-running it
 * against a synthetic level is what yields prose per rung; `figureLabel` is the
 * bare-figure fallback for a shape it does not phrase.
 *
 * `undefined` for a config with no ladder, which is most of the roster.
 */
const versionsOf = (config: Config): readonly DexVersionRung[] | undefined => {
	if (!isUpgradable(config)) return undefined;
	const odds = versionOddsFor(FIRST_VERSION, maxLevelOf(config));
	const oddsAt = (version: number): string | null => {
		const share = odds.find((rung) => rung.version === version)?.share;
		return share === undefined ? null : rollOddsLabel(share);
	};

	return Array.from({ length: maxLevelOf(config) }, (_, index) => {
		const version = index + FIRST_VERSION;
		const rung = { ...config, level: version };
		return {
			version,
			effect: givesOf(rung) ?? figureLabel(rung),
			price:
				version === FIRST_VERSION
					? null
					: kbLabel(upgradeStorageCost(version - 1)),
			odds: version === FIRST_VERSION ? null : oddsAt(version),
		};
	});
};

const configRowFor = (entry: ConfigdexEntry): DexConfigRow => {
	if (entry.state === "locked") {
		return {
			id: entry.id,
			slots: entry.slots,
			state: "locked",
			paths: [pathFor(entry.thematic), pathFor(entry.fallback)],
		};
	}

	return {
		id: entry.config.id,
		slots: baseSlotsOf(entry.config),
		state: "granted",
		name: entry.config.label,
		effect: entry.config.gives ?? entry.config.description,
		provenance: entry.provenance,
		starter: entry.starter,
		versions: versionsOf(entry.config),
	};
};

/**
 * Heaviest first across the whole roster, granted and locked alike: the header
 * says "by weight", so splitting the deck you hold from the deck you owe first
 * left the 1-weight starters sitting above every 8-weight config and read as no
 * order at all.
 */
const byWeight = (rows: readonly DexConfigRow[]): readonly DexConfigRow[] =>
	[...rows].sort((a, b) => b.slots - a.slots);

export const dexConfigsFor = (
	entries: readonly ConfigdexEntry[]
): DexConfigsData => {
	const rows = entries.map(configRowFor);

	return {
		rows: byWeight(rows),
		count: heldOf(
			rows.filter((row) => row.state === "granted").length,
			rows.length
		),
		meta: CONFIGS_META,
		note: CONFIGS_NOTE,
	};
};

/* --------------------------------------------------------------- audits -- */

const AUDITS_NOTE =
	"An audit is logged the first time it fires. Reading it here does not stop it happening again.";
const AUDITS_META = "HTTP codes";

const auditRowFor = (entry: AuditdexEntry): DexAuditRow => {
	const gates = gatesLabelOf(entry.gates);

	if (entry.tier === "unseen") return { id: entry.id, gates, locked: true };

	return {
		id: entry.id,
		gates,
		code: entry.code,
		name: entry.title,
		rule: entry.rule,
	};
};

export const dexAuditsFor = (
	entries: readonly AuditdexEntry[]
): DexAuditsProps => ({
	rows: entries.map(auditRowFor),
	count: heldOf(
		entries.filter((entry) => entry.tier !== "unseen").length,
		entries.length
	),
	meta: AUDITS_META,
	note: AUDITS_NOTE,
});

/* ------------------------------------------------------------- swatches -- */

const SWATCHES_NOTE =
	"A swatch is earned by answering all five polls of its gate. Clearing the gate alone does not mint it.";
const SWATCHES_META = "one a gate, swept";

const swatchFillFor = (entry: GatedexEntry): SwatchFill => {
	if (entry.state === "cleared") {
		return { state: "discovered", swatch: entry.swatch };
	}
	return entry.state === "next"
		? { state: "current", swatch: entry.swatch }
		: { state: "undiscovered" };
};

const swatchCardFor = (entry: GatedexEntry): DexSwatchCard => ({
	gate: entry.gate,
	name: entry.swatch.gateName,
	swatch: swatchFillFor(entry),
	note: entry.state === "cleared" ? SWEPT_NOTE : gateNoteOf(entry.gate),
});

export const dexSwatchesFor = (
	entries: readonly GatedexEntry[]
): DexSwatchesProps => ({
	cards: entries.map(swatchCardFor),
	count: heldOf(
		entries.filter((entry) => entry.state === "cleared").length,
		entries.length
	),
	meta: SWATCHES_META,
	note: SWATCHES_NOTE,
});

/* ----------------------------------------------------------------- runs -- */

const RUNS_NOTE =
	"Coverage is the run's final score against its window. A run ends at the gate that held it.";
const NO_RUNS_META = "no climbs yet";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
	day: "2-digit",
	month: "short",
};

const dateOf = (endedAt: Date | null): string =>
	endedAt === null
		? "—"
		: new Intl.DateTimeFormat("en-GB", DATE_FORMAT).format(endedAt);

const runTrackFor = (earned: readonly number[]): readonly SwatchFill[] =>
	ALL_SWATCHES.map((swatch) =>
		earned.includes(swatch.gate)
			? { state: "discovered", swatch }
			: { state: "undiscovered" }
	);

const archiveHrefFor = (runId: number): string => `/runs/${runId}`;

const runRowFor = (entry: RunHistoryEntry): DexRunRow => ({
	runId: entry.runId,
	href: archiveHrefFor(entry.runId),
	date: dateOf(entry.endedAt),
	swatches: runTrackFor(entry.swatchGates),
	outcome: entry.won
		? WON_OUTCOME
		: heldOutcomeOf(entry.heldBy ?? String(entry.gatesCleared)),
	coverage: `${Math.round(percentOf(entry.coverage))}%`,
	band: entry.band,
});

const bestOf = (entries: readonly RunHistoryEntry[]): string =>
	entries.length === 0
		? NO_RUNS_META
		: `best reached gate ${deepestGateIn(entries)}`;

export const dexRunsFor = (
	entries: readonly RunHistoryEntry[]
): DexRunsProps => ({
	rows: entries.map(runRowFor),
	count: plural(entries.length, "run"),
	meta: bestOf(entries),
	note: RUNS_NOTE,
});
