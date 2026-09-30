import { plural } from "~/shared/lib/displayValue";
import { CATEGORY_METADATA, isCategoryCode } from "~/shared/lib/categories";

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
	filterPolldexEntries,
	formatDexNumber,
	polldexCoverage,
	presentCategories,
	sortByDexNumber,
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
	type CarriedServiceId,
	isCarriedService,
	REGISTRY_CONTROLS,
	unlockCaptionOf,
	type RegistryControlId,
	type RegistryControlSpec,
} from "~/modules/run/shop/domain/registryControl.model";
import { carryLabelOf } from "~/modules/run/shop/application/shopScreen.viewmodel";
import {
	BOOT_CACHE_RUNGS,
	PIN_FROM_GATE,
	SKIP_SHOP_KB,
	PIN_UNTIL_GATE,
	pinCostFor,
} from "~/modules/run/run/domain/rules.model";
import { formatStorage, kbLabel } from "~/shared/lib/storage";
import type { UnlockPathCaption } from "~/modules/run/config/domain/unlockCaption.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import { percentOf } from "~/modules/run/build/domain/coverageRatio.model";

import type { KantoColor } from "~/ui/kanto-theme/colors";
import {
	gatesLabelOf,
	type DexAuditDetail,
	type DexAuditRow,
	type DexAuditsData,
} from "~/ui/kanto-theme/DexAudits.ui";
import type { ConfigUnlockPath } from "~/ui/kanto-theme/ConfigUnlock.ui";
import type {
	DexConfigCard,
	DexConfigDetail,
	DexConfigRow,
	DexConfigsData,
} from "~/ui/kanto-theme/DexConfigs.ui";
import type {
	DexControlDetail,
	DexControlRow,
	DexControlsData,
} from "~/ui/kanto-theme/DexControls.ui";
import type {
	DexPollDetail,
	DexPollRow,
	DexPollsData,
} from "~/ui/kanto-theme/DexPolls.ui";
import {
	heldOutcomeOf,
	WON_OUTCOME,
	type DexRunDetail,
	type DexRunRow,
	type DexRunsData,
} from "~/ui/kanto-theme/DexRuns.ui";
import {
	gateNoteOf,
	SWEPT_NOTE,
	type DexSwatchDetail,
	type DexSwatchRow,
	type DexSwatchesData,
} from "~/ui/kanto-theme/DexSwatches.ui";
import { REDACTED } from "~/ui/kanto-theme/Redaction.ui";
import type { SegmentedItem } from "~/ui/kanto-theme/Segmented.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";
import type { TabItem } from "~/ui/kanto-theme/Tabs.ui";

export type DexTabId =
	"polls" | "configs" | "controls" | "audits" | "swatches" | "runs";

export type DexTab = TabItem & { id: DexTabId; color: KantoColor };

export const DEX_TABS = [
	{ id: "polls", label: "Polls", color: "cerulean" },
	{ id: "configs", label: "Configs", color: "pallet" },
	{ id: "controls", label: "Services", color: "seafoam" },
	{ id: "audits", label: "Audits", color: "saffron" },
	{ id: "swatches", label: "Swatches", color: "lavender" },
	{ id: "runs", label: "Runs", color: "pewter" },
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
	const number = formatDexNumber(entry);

	if (!entry.seen || entry.question === null) {
		return { id: String(entry.id), number, locked: true };
	}

	return {
		id: String(entry.id),
		number,
		question: entry.question,
		answered: entry.answeredCount,
		correct: entry.correctCount,
	};
};

const pollDetailFor = (entry: PolldexEntry): DexPollDetail => {
	const head = {
		number: formatDexNumber(entry),
		category: CATEGORY_METADATA[entry.categoryCode].name,
	};

	if (!entry.seen || entry.question === null) return { ...head, locked: true };

	return {
		...head,
		question: entry.question,
		timesSeen: entry.timesSeen,
		answered: entry.answeredCount,
		correct: entry.correctCount,
		accuracy: entry.accuracy,
	};
};

const categoryFiltersFor = (
	entries: readonly PolldexEntry[]
): readonly SegmentedItem<string>[] => [
	{ value: ALL_FILTER, label: ALL_FILTER },
	...presentCategories([...entries]).map((code) => {
		const coverage = polldexCoverage(filterPolldexEntries([...entries], code));

		return {
			value: code,
			mark: CATEGORY_METADATA[code].name,
			label: heldOf(coverage.seen, coverage.total),
		};
	}),
];

export const dexPollsFor = (
	entries: readonly PolldexEntry[],
	filter: string = ALL_FILTER,
	selectedId?: string
): DexPollsData => {
	const categories = presentCategories([...entries]);
	const coverage = polldexCoverage([...entries]);
	const shown = sortByDexNumber(
		filterPolldexEntries([...entries], isCategoryCode(filter) ? filter : "all")
	);
	const picked =
		shown.find((entry) => String(entry.id) === selectedId) ?? shown[0];

	return {
		filters: categoryFiltersFor(entries),
		filter,
		rows: shown.map(pollRowFor),
		selectedId: picked === undefined ? null : String(picked.id),
		detail: picked === undefined ? null : pollDetailFor(picked),
		count: heldOf(coverage.seen, coverage.total),
		meta: plural(categories.length, "category", "categories"),
		note: POLLS_NOTE,
	};
};

const CONFIGS_NOTE =
	"Configs in the deck can be dealt into a hand or offered in the shop. A version ladder is bought with storage inside a run and lost when the run ends, so the tag names the top of that ladder, never a version you hold. A locked config states its weight and how to unlock it; its name and effect show once it is earned.";
const CONFIGS_META = "by weight";

export const ALL_FILTER = "all";
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

const weightOf = (entry: ConfigdexEntry): number =>
	entry.state === "locked" ? entry.slots : baseSlotsOf(entry.config);

const idOf = (entry: ConfigdexEntry): string =>
	entry.state === "locked" ? entry.id : entry.config.id;

const isGranted = (entry: ConfigdexEntry): boolean => entry.state !== "locked";

const grantedFirst = (entry: ConfigdexEntry): number =>
	isGranted(entry) ? 0 : 1;

const lightestFirst = (
	entries: readonly ConfigdexEntry[]
): readonly ConfigdexEntry[] =>
	[...entries].sort(
		(a, b) => weightOf(a) - weightOf(b) || grantedFirst(a) - grantedFirst(b)
	);

const heldAmong = (entries: readonly ConfigdexEntry[]): string =>
	heldOf(entries.filter(isGranted).length, entries.length);

const atWeight = (
	entries: readonly ConfigdexEntry[],
	weight: number
): readonly ConfigdexEntry[] =>
	entries.filter((entry) => weightOf(entry) === weight);

const weightFiltersFor = (
	entries: readonly ConfigdexEntry[]
): readonly SegmentedItem<string>[] => [
	{ value: ALL_FILTER, label: ALL_FILTER },
	...[...new Set(entries.map(weightOf))]
		.sort((a, b) => a - b)
		.map((weight) => ({
			value: String(weight),
			mark: String(weight),
			label: heldAmong(atWeight(entries, weight)),
		})),
];

const keptBy = (
	entries: readonly ConfigdexEntry[],
	filter: string
): readonly ConfigdexEntry[] =>
	filter === ALL_FILTER
		? entries
		: entries.filter((entry) => String(weightOf(entry)) === filter);

const rowFor = (entry: ConfigdexEntry): DexConfigRow => {
	if (entry.state === "locked") {
		return { id: entry.id, slots: entry.slots, locked: true };
	}

	return {
		id: entry.config.id,
		slots: baseSlotsOf(entry.config),
		name: entry.config.label,
		figure: figureOf(entry.config),
		version: maxVersionOf(entry.config),
	};
};

const detailFor = (entry: ConfigdexEntry): DexConfigDetail => ({
	label: entry.state === "locked" ? REDACTED : entry.config.label,
	card: cardFor(entry),
});

export const dexConfigsFor = (
	entries: readonly ConfigdexEntry[],
	filter: string = ALL_FILTER,
	selectedId?: string
): DexConfigsData => {
	const shown = lightestFirst(keptBy(entries, filter));
	const picked = shown.find((entry) => idOf(entry) === selectedId) ?? shown[0];

	return {
		filters: weightFiltersFor(entries),
		filter,
		rows: shown.map(rowFor),
		selectedId: picked === undefined ? null : idOf(picked),
		detail: picked === undefined ? null : detailFor(picked),
		count: heldOf(grantedCountIn(entries), entries.length),
		meta: CONFIGS_META,
		note: CONFIGS_NOTE,
	};
};

const SERVICES_NOTE =
	"A service is unlocked once, for good. What a run carries is picked at new run and paid from the archive; a carried service is then pressed in the shop for the run's own storage, at its ladder. Boot Cache banks its storage at the start. Rebuild, Skip the shop and kill -9 ride along free.";
const SERVICES_META = "earned once · carried per run";
const NOT_YET_SOLD = "not for sale yet";
const FREE = "free";

const SERVICE_LINES: Record<RegistryControlId, string> = {
	rebuild: "Every shop · this visit",
	skipShop: "Every shop · this visit",
	extend: "Shop from Cascade · rest of the run",
	hotReload: "Every shop · this visit",
	returnPolicy: "Every shop · this visit",
	abandon: "Every shop · ends the run",
	pin: `Shop, gates ${PIN_FROM_GATE}–${PIN_UNTIL_GATE} · carries into your next run`,
	bootCache: "New run · banked at the start",
	dockerImage: "New run · offered in the first shop",
};

const rungBytes = BOOT_CACHE_RUNGS.map((rung) => rung.archiveBytes);

const CONTROL_PRICES: Record<RegistryControlId, string> = {
	rebuild: `from ${kbLabel(rebuildCost(0))}, doubling`,
	skipShop: `pays ${kbLabel(SKIP_SHOP_KB)}`,
	extend: carryLabelOf(REGISTRY_CONTROLS.extend.carryBytes),
	hotReload: NOT_YET_SOLD,
	returnPolicy: NOT_YET_SOLD,
	abandon: FREE,
	pin: carryLabelOf(REGISTRY_CONTROLS.pin.carryBytes),
	bootCache: `${carryLabelOf(Math.min(...rungBytes))} to ${formatStorage(Math.max(...rungBytes))}`,
	dockerImage: NOT_YET_SOLD,
};

const PRESS_PRICES: Record<CarriedServiceId, string> = {
	extend: `${kbLabel(extendCost(0))}, then ${kbLabel(extendCost(1))}`,
	pin: `from ${kbLabel(pinCostFor(PIN_FROM_GATE))}, rising with depth`,
};

const FROM_FIRST_SHOP = "On sale in every shop from the first gate.";
const FROM_ARCHIVE = "Carried in at new run, from the archive.";
const BOOT_CACHE_LINE = `Carried in at new run: ${BOOT_CACHE_RUNGS.map(
	(rung) =>
		`${formatStorage(rung.archiveBytes)} of archive banks ${kbLabel(rung.storageKb)}`
).join(", ")}.`;

type ShopSale = Extract<RegistryControlSpec, { soldIn: "shop" }>;
type ArchiveSale = Extract<RegistryControlSpec, { soldIn: "archive" }>;

const opensLine = (opensAfterGates: number): string =>
	opensAfterGates === 0
		? FROM_FIRST_SHOP
		: `On sale in the shop once you have cleared gate ${opensAfterGates}.`;

const shopLine = (control: ShopSale): string =>
	control.closesAfterGates === undefined
		? opensLine(control.opensAfterGates)
		: `${opensLine(control.opensAfterGates)} It stops being offered after gate ${control.closesAfterGates}.`;

const archiveLine = (control: ArchiveSale): string =>
	control.id === REGISTRY_CONTROLS.bootCache.id
		? BOOT_CACHE_LINE
		: FROM_ARCHIVE;

const carriedLine = (bytes: number): string =>
	`Carried in at new run for ${formatStorage(bytes)} of archive.`;

const pressedLine = (id: CarriedServiceId): string =>
	`Pressed in the shop for ${PRESS_PRICES[id]} of run storage.`;

const availabilityOf = (control: RegistryControlSpec): string => {
	if (control.soldIn === "archive") return archiveLine(control);
	if (isCarriedService(control))
		return `${carriedLine(control.carryBytes)} ${shopLine(control)} ${pressedLine(control.id)}`;
	return shopLine(control);
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

const controlDetailFor = (entry: ControldexEntry): DexControlDetail => ({
	label: entry.control.title,
	control: controlRowFor(entry),
	availability: availabilityOf(entry.control),
});

export const dexControlsFor = (
	entries: readonly ControldexEntry[],
	selectedId?: string
): DexControlsData => {
	const picked =
		entries.find((entry) => entry.control.id === selectedId) ?? entries[0];

	return {
		rows: entries.map(controlRowFor),
		selectedId: picked === undefined ? null : picked.control.id,
		detail: picked === undefined ? null : controlDetailFor(picked),
		count: heldOf(
			entries.filter((entry) => entry.unlocked).length,
			entries.length
		),
		meta: SERVICES_META,
		note: SERVICES_NOTE,
	};
};

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

const auditDetailFor = (entry: AuditdexEntry): DexAuditDetail => {
	const gates = gatesLabelOf(entry.gates);

	if (entry.tier === "unseen") return { label: REDACTED, gates, locked: true };

	return {
		label: String(entry.code),
		gates,
		code: entry.code,
		name: entry.title,
		rule: entry.rule,
	};
};

const gateFiltersFor = (
	entries: readonly AuditdexEntry[]
): readonly SegmentedItem<string>[] => [
	{ value: ALL_FILTER, label: ALL_FILTER },
	...[...new Set(entries.flatMap((entry) => entry.gates))]
		.sort((a, b) => a - b)
		.map((gate) => {
			const firing = entries.filter((entry) => entry.gates.includes(gate));

			return {
				value: String(gate),
				mark: String(gate),
				label: heldOf(
					firing.filter((entry) => entry.tier !== "unseen").length,
					firing.length
				),
			};
		}),
];

export const dexAuditsFor = (
	entries: readonly AuditdexEntry[],
	filter: string = ALL_FILTER,
	selectedId?: string
): DexAuditsData => {
	const shown =
		filter === ALL_FILTER
			? entries
			: entries.filter((entry) => entry.gates.includes(Number(filter)));
	const picked = shown.find((entry) => entry.id === selectedId) ?? shown[0];

	return {
		filters: gateFiltersFor(entries),
		filter,
		rows: shown.map(auditRowFor),
		selectedId: picked === undefined ? null : picked.id,
		detail: picked === undefined ? null : auditDetailFor(picked),
		count: heldOf(
			entries.filter((entry) => entry.tier !== "unseen").length,
			entries.length
		),
		meta: AUDITS_META,
		note: AUDITS_NOTE,
	};
};

const SWATCHES_NOTE =
	"A swatch is earned by answering all five polls of its gate. Clearing the gate alone does not mint it.";
const SWATCHES_META = "one a gate, swept";

const SWATCH_RULE =
	"Answer all five polls of this gate to mint it. Clearing the gate alone does not.";
const SWATCH_EARNED = "Minted. You answered all five.";

const swatchFillFor = (entry: GatedexEntry): SwatchFill => {
	if (entry.state === "cleared") {
		return { state: "discovered", swatch: entry.swatch };
	}
	return entry.state === "next"
		? { state: "current", swatch: entry.swatch }
		: { state: "undiscovered" };
};

const swatchRowFor = (entry: GatedexEntry): DexSwatchRow => ({
	id: String(entry.gate),
	name: entry.swatch.gateName,
	swatch: swatchFillFor(entry),
	note: entry.state === "cleared" ? SWEPT_NOTE : gateNoteOf(entry.gate),
});

const swatchDetailFor = (entry: GatedexEntry): DexSwatchDetail => ({
	label: entry.swatch.gateName,
	swatch: swatchFillFor(entry),
	note: gateNoteOf(entry.gate),
	rule: entry.state === "cleared" ? SWATCH_EARNED : SWATCH_RULE,
});

export const dexSwatchesFor = (
	entries: readonly GatedexEntry[],
	selectedId?: string
): DexSwatchesData => {
	const picked =
		entries.find((entry) => String(entry.gate) === selectedId) ?? entries[0];

	return {
		rows: entries.map(swatchRowFor),
		selectedId: picked === undefined ? null : String(picked.gate),
		detail: picked === undefined ? null : swatchDetailFor(picked),
		count: heldOf(
			entries.filter((entry) => entry.state === "cleared").length,
			entries.length
		),
		meta: SWATCHES_META,
		note: SWATCHES_NOTE,
	};
};

export const RUNS_NOTE =
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

export const runTrackFor = (earned: readonly number[]): readonly SwatchFill[] =>
	ALL_SWATCHES.map((swatch) =>
		earned.includes(swatch.gate)
			? { state: "discovered", swatch }
			: { state: "undiscovered" }
	);

const archiveHrefFor = (runId: number): string => `/runs/${runId}`;

export const runRowFor = (entry: RunHistoryEntry): DexRunRow => ({
	id: String(entry.runId),
	date: dateOf(entry.endedAt),
	swatches: runTrackFor(entry.swatchGates),
	outcome: entry.won
		? WON_OUTCOME
		: heldOutcomeOf(entry.heldBy ?? String(entry.gatesCleared)),
	coverage: `${Math.round(percentOf(entry.coverage))}%`,
	band: entry.band,
});

export const runDetailFor = (entry: RunHistoryEntry): DexRunDetail => {
	const row = runRowFor(entry);

	return {
		label: row.date,
		swatches: row.swatches,
		outcome: row.outcome,
		coverage: row.coverage,
		band: row.band,
		href: archiveHrefFor(entry.runId),
	};
};

const bestOf = (entries: readonly RunHistoryEntry[]): string =>
	entries.length === 0
		? NO_RUNS_META
		: `best reached gate ${deepestGateIn(entries)}`;

export const dexRunsFor = (
	entries: readonly RunHistoryEntry[],
	selectedId?: string
): DexRunsData => {
	const picked =
		entries.find((entry) => String(entry.runId) === selectedId) ?? entries[0];

	return {
		rows: entries.map(runRowFor),
		selectedId: picked === undefined ? null : String(picked.runId),
		detail: picked === undefined ? null : runDetailFor(picked),
		count: plural(entries.length, "run"),
		meta: bestOf(entries),
		note: RUNS_NOTE,
	};
};
