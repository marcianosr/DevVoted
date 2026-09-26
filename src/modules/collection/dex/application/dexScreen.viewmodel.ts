import { plural } from "~/shared/lib/displayValue";
import { CATEGORY_METADATA } from "~/shared/lib/categories";

import type { AuditdexEntry } from "~/modules/collection/dex/domain/auditdex.model";
import {
	grantedCountIn,
	type ConfigdexEntry,
} from "~/modules/collection/dex/domain/configdex.model";
import type { ControldexEntry } from "~/modules/collection/dex/domain/controldex.model";
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
	type Config,
} from "~/modules/run/config/domain/config.model";
import { figureLabel } from "~/modules/run/config/application/configChip.viewmodel";
import { extendCost, rebuildCost } from "~/modules/run/shop/domain/draft.model";
import {
	unlockCaptionOf,
	type RegistryControlId,
} from "~/modules/run/shop/domain/registryControl.model";
import {
	PIN_FROM_GATE,
	pinCostFor,
} from "~/modules/run/run/domain/rules.model";
import { kbLabel } from "~/shared/lib/storage";
import type { UnlockPathCaption } from "~/modules/run/config/domain/unlockCaption.model";
import { WEIGHT } from "~/shared/lib/copy";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import { percentOf } from "~/modules/run/build/domain/coverageRatio.model";

import type { KantoColor } from "~/ui/kanto-theme/colors";
import {
	gatesLabelOf,
	type DexAuditRow,
	type DexAuditsProps,
} from "~/ui/kanto-theme/DexAudits.ui";
import type { ConfigUnlockPath } from "~/ui/kanto-theme/ConfigUnlock.ui";
import type {
	DexConfigCard,
	DexConfigsData,
	DexWeightGroup,
} from "~/ui/kanto-theme/DexConfigs.ui";
import type {
	DexControlRow,
	DexControlsProps,
} from "~/ui/kanto-theme/DexControls.ui";
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

export type DexTabId =
	"polls" | "configs" | "controls" | "audits" | "swatches" | "runs";

export type DexTab = TabItem & { id: DexTabId; color: KantoColor };

export const DEX_TABS = [
	{ id: "polls", label: "polls", color: "cerulean" },
	{ id: "configs", label: "configs", color: "pallet" },
	{ id: "controls", label: "services", color: "seafoam" },
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

const CONFIGS_NOTE =
	"Configs in the deck can be dealt into a hand or offered in the shop. A version ladder is bought with storage inside a run and lost when the run ends, so the tag names the top of that ladder, never a version you hold. A locked config states its weight and how to unlock it; its name and effect show once it is earned.";
const CONFIGS_META = "by weight";
const LADDER_SEPARATOR = " · ";
const FIRST_VERSION = 1;
const FIGURE_COLOR: KantoColor = "viridian";

const pathFor = (caption: UnlockPathCaption): ConfigUnlockPath => ({
	text: caption.text,
	progress:
		caption.kind === "counted"
			? { count: caption.count, target: caption.target }
			: null,
});

const maxVersionOf = (config: Config): number | undefined =>
	isUpgradable(config) ? maxLevelOf(config) : undefined;

const figureOf = (config: Config): string | undefined => {
	const figure = figureLabel(config);
	return figure === "" ? undefined : figure;
};

export const noteOf = (
	provenance: string,
	maxVersion: number | undefined
): string =>
	maxVersion === undefined
		? provenance
		: `${provenance}${LADDER_SEPARATOR}v${FIRST_VERSION} of ${maxVersion}`;

const grantedCardFor = (
	entry: Extract<ConfigdexEntry, { state: "granted" }>
): DexConfigCard => {
	const slots = baseSlotsOf(entry.config);
	const maxVersion = maxVersionOf(entry.config);
	const figure = figureOf(entry.config);

	return {
		id: entry.config.id,
		name: entry.config.label,
		slots,
		version: maxVersion,
		badges:
			figure === undefined ? [] : [{ label: figure, color: FIGURE_COLOR }],
		info: {
			description: givesOf(entry.config) ?? entry.config.description,
			slots,
			note: noteOf(entry.provenance, maxVersion),
		},
	};
};

const cardFor = (entry: ConfigdexEntry): DexConfigCard => {
	if (entry.state === "locked") {
		return {
			id: entry.id,
			locked: true,
			slots: entry.slots,
			unlock: [pathFor(entry.thematic), pathFor(entry.fallback)],
		};
	}

	return grantedCardFor(entry);
};

const isGranted = (card: DexConfigCard) => card.locked !== true;

const weightOf = (entry: ConfigdexEntry): number =>
	entry.state === "locked" ? entry.slots : baseSlotsOf(entry.config);

const groupOf = (
	weight: number,
	cards: readonly DexConfigCard[]
): DexWeightGroup => {
	const granted = cards.filter(isGranted);
	const rest = cards.filter((card) => !isGranted(card));

	return {
		weight,
		label: `${WEIGHT} ${weight}`,
		held: heldOf(granted.length, cards.length),
		chips: [...granted, ...rest],
	};
};

const byWeight = (
	entries: readonly ConfigdexEntry[]
): readonly DexWeightGroup[] =>
	[...new Set(entries.map(weightOf))]
		.sort((a, b) => b - a)
		.map((weight) =>
			groupOf(
				weight,
				entries.filter((entry) => weightOf(entry) === weight).map(cardFor)
			)
		);

export const dexConfigsFor = (
	entries: readonly ConfigdexEntry[]
): DexConfigsData => ({
	groups: byWeight(entries),
	count: heldOf(grantedCountIn(entries), entries.length),
	meta: CONFIGS_META,
	note: CONFIGS_NOTE,
});

const SERVICES_NOTE =
	"A service is unlocked once, for good. A registry service is then bought in the shop with the run's own storage, as often as you can pay; a run service is bought once a run, before it, from the archive. The git tag is bought in the shop today and carries into your next run.";
const SERVICES_META = "registry, then run";
const NOT_YET_SOLD = "not for sale yet";
const FREE = "free";

const SERVICE_LINES: Record<RegistryControlId, string> = {
	rebuild: "Registry · this visit",
	extend: "Registry · rest of the run",
	hotReload: "Registry · this visit",
	returnPolicy: "Registry · this visit",
	abandon: "Registry · ends the run",
	pin: "Run · carries into your next run",
	bootCache: "Next run · consumed on start",
	dockerImage: "Next run · spent in the first shop",
};

const CONTROL_PRICES: Record<RegistryControlId, string> = {
	rebuild: `from ${kbLabel(rebuildCost(0))}, doubling`,
	extend: `${kbLabel(extendCost(0))}, then ${kbLabel(extendCost(1))}`,
	hotReload: NOT_YET_SOLD,
	returnPolicy: NOT_YET_SOLD,
	abandon: FREE,
	pin: `from ${kbLabel(pinCostFor(PIN_FROM_GATE))}, rising with depth`,
	bootCache: NOT_YET_SOLD,
	dockerImage: NOT_YET_SOLD,
};

const controlRowFor = ({
	control,
	unlocked,
}: ControldexEntry): DexControlRow => {
	const row = {
		id: control.id,
		glyph: control.glyph,
		title: control.title,
		detail: SERVICE_LINES[control.id],
	};
	const unlock = unlockCaptionOf(control);
	return unlocked || unlock === undefined
		? { ...row, price: CONTROL_PRICES[control.id] }
		: { ...row, locked: true, unlock };
};

export const dexControlsFor = (
	entries: readonly ControldexEntry[]
): DexControlsProps => ({
	rows: entries.map(controlRowFor),
	count: heldOf(
		entries.filter((entry) => entry.unlocked).length,
		entries.length
	),
	meta: SERVICES_META,
	note: SERVICES_NOTE,
});

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
