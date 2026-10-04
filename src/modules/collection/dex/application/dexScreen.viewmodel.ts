import { HELD_OF, NEW_RUN_PRICE } from "~/shared/lib/copy";
import { plural } from "~/shared/lib/displayValue";
import { CATEGORY_METADATA, isCategoryCode } from "~/shared/lib/categories";

import type { AuditdexEntry } from "~/modules/collection/dex/domain/auditdex.model";
import type { ConfigdexEntry } from "~/modules/collection/dex/domain/configdex.model";
import type { ControldexEntry } from "~/modules/collection/dex/domain/controldex.model";
import type { GatedexEntry } from "~/modules/collection/dex/domain/gatedex.model";
import {
	deepestGateIn,
	type RunHistoryEntry,
} from "~/modules/collection/dex/domain/runHistory.model";
import {
	dexNumber,
	entryStateOf,
	filterPolldexEntries,
	formatDexNumber,
	presentCategories,
	sortByDexNumber,
	type PolldexEntry,
} from "~/modules/collection/dex/domain/polldex.model";
import {
	configTallyOf,
	pollTallyOf,
	type Tally,
} from "~/modules/collection/dex/domain/tally.model";
import {
	baseSlotsOf,
	givesOf,
	isUpgradable,
	maxLevelOf,
	type Config,
} from "~/modules/run/config/domain/config.model";
import { figureLabel } from "~/modules/run/config/application/configChip.viewmodel";
import {
	isCarriedService,
	unlockCaptionOf,
	type RegistryControlSpec,
	type ServiceLasts,
	type ServicePrice,
} from "~/modules/run/shop/domain/registryControl.model";
import type { BootCacheRung } from "~/modules/run/run/domain/rules.model";
import { formatStorage, kbLabel } from "~/shared/lib/storage";
import type { UnlockPathCaption } from "~/modules/run/config/domain/unlockCaption.model";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
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
	DexPollTile,
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

export type DexTab = TabItem & { id: DexTabId };

export const DEX_TABS = [
	{ id: "polls", label: "Polls" },
	{ id: "configs", label: "Configs" },
	{ id: "controls", label: "Services" },
	{ id: "audits", label: "Audits" },
	{ id: "swatches", label: "Swatches" },
	{ id: "runs", label: "Runs" },
] as const satisfies readonly DexTab[];

export const isDexTabId = (value: string): value is DexTabId =>
	DEX_TABS.some((tab) => tab.id === value);

const tallyLabelOf = ({ held, total }: Tally): string => HELD_OF(held, total);

const ALL_POLLS_WORD = "polls";
const SEEN_SUFFIX = " seen";

type CategoryCode = PolldexEntry["categoryCode"];

const pollRowsFor = (entries: readonly PolldexEntry[]): DexPollRow[] =>
	entries.flatMap((entry) =>
		entry.seen && entry.question !== null
			? [
					{
						id: String(entry.id),
						number: formatDexNumber(entry),
						question: entry.question,
						answered: entry.answeredCount,
						correct: entry.correctCount,
						state: entryStateOf(entry),
					},
				]
			: []
	);

const pollTileFor = (entry: PolldexEntry): DexPollTile => ({
	id: String(entry.id),
	number: String(dexNumber(entry)),
	state: entryStateOf(entry),
});

const pollDetailFor = (entry: PolldexEntry): DexPollDetail => {
	const head = {
		number: formatDexNumber(entry),
		category: CATEGORY_METADATA[entry.categoryCode].name,
		state: entryStateOf(entry),
	};

	if (!entry.seen || entry.question === null) return { ...head, locked: true };

	return {
		...head,
		question: entry.question,
		timesSeen: entry.timesSeen,
		answered: entry.answeredCount,
		correct: entry.correctCount,
	};
};

const seenFilterFor = (
	value: string,
	mark: string,
	entries: readonly PolldexEntry[]
): SegmentedItem<string> => {
	const tally = pollTallyOf(entries);

	return {
		value,
		mark,
		label: tallyLabelOf(tally),
		meter: { value: tally.held, max: tally.total },
	};
};

const categoryFiltersFor = (
	entries: readonly PolldexEntry[]
): readonly SegmentedItem<string>[] => [
	seenFilterFor(ALL_FILTER, ALL_FILTER, entries),
	...presentCategories([...entries]).map((code) =>
		seenFilterFor(
			code,
			CATEGORY_METADATA[code].name,
			filterPolldexEntries([...entries], code)
		)
	),
];

const filterNameOf = (filter: CategoryCode | "all"): string =>
	filter === "all" ? ALL_FILTER : CATEGORY_METADATA[filter].name;

export const dexPollsFor = (
	entries: readonly PolldexEntry[],
	filter: string = ALL_FILTER,
	selectedId?: string
): DexPollsData => {
	const category = isCategoryCode(filter) ? filter : "all";
	const shown = sortByDexNumber(filterPolldexEntries([...entries], category));
	const rows = pollRowsFor(shown);
	const picked =
		shown.find((entry) => String(entry.id) === selectedId) ??
		shown.find((entry) => String(entry.id) === rows[0]?.id) ??
		shown[0];

	return {
		filters: categoryFiltersFor(entries),
		filter,
		rows,
		grid: {
			label: `${filterNameOf(category)} ${shown.length} ${ALL_POLLS_WORD}`,
			seen: `${pollTallyOf(shown).held}${SEEN_SUFFIX}`,
			tiles: shown.map(pollTileFor),
		},
		selectedId: picked === undefined ? null : String(picked.id),
		detail: picked === undefined ? null : pollDetailFor(picked),
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
	tallyLabelOf(configTallyOf(entries));

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
		count: heldAmong(entries),
		meta: CONFIGS_META,
		note: CONFIGS_NOTE,
	};
};

const SERVICES_NOTE =
	"A service unlocks once, for good. Pick what a run carries at new run, paid from your archive, then press it in the shop with run storage. Boot Cache banks its storage at the start.";
const SERVICES_META = "earned once · carried per run";
const NOT_YET_SOLD = "not for sale yet";
const FREE = "free";

const LASTS_WORDS: Record<ServiceLasts, string> = {
	visit: "this visit",
	run: "rest of the run",
	endsRun: "ends the run",
	nextRun: "carries into your next run",
	atStart: "banked at the start",
	firstShop: "offered in the first shop",
};

const EVERY_SHOP = "Every shop";
const NEW_RUN = "New run";
const LINE_JOIN = " · ";
const STEP_JOIN = ", then ";

const soldWhere = (control: RegistryControlSpec): string => {
	if (control.soldIn === "archive") return NEW_RUN;
	if (control.closesAfterGates !== undefined) {
		return `Shop, gates ${control.opensAfterGates}–${control.closesAfterGates}`;
	}
	if (control.opensAfterGates > 1) {
		return `Shop from ${gateSwatchAt(control.opensAfterGates).gateName}`;
	}
	return EVERY_SHOP;
};

const serviceLineOf = (control: RegistryControlSpec): string =>
	`${soldWhere(control)}${LINE_JOIN}${LASTS_WORDS[control.lasts]}`;

const archiveRangeOf = (rungs: readonly BootCacheRung[]): string => {
	const bytes = rungs.map((rung) => rung.archiveBytes);
	return `${NEW_RUN_PRICE(formatStorage(Math.min(...bytes)))} to ${formatStorage(Math.max(...bytes))}`;
};

const priceLabelOf = (price: ServicePrice): string => {
	switch (price.kind) {
		case "doubling":
			return `from ${kbLabel(price.fromKb)}, doubling`;
		case "steps":
			return price.kbs.map((kb) => kbLabel(kb)).join(STEP_JOIN);
		case "rising":
			return `from ${kbLabel(price.fromKb)}, rising with depth`;
		case "pays":
			return `pays ${kbLabel(price.kb)}`;
		case "rungs":
			return archiveRangeOf(price.rungs);
		case "free":
			return FREE;
		case "unsold":
			return NOT_YET_SOLD;
	}
};

const rowPriceOf = (control: RegistryControlSpec): string =>
	isCarriedService(control)
		? NEW_RUN_PRICE(formatStorage(control.carryBytes))
		: priceLabelOf(control.price);

const FROM_FIRST_SHOP = "On sale in every shop from the first gate.";
const FROM_ARCHIVE = "Carried in at new run, from the archive.";

const rungsLine = (rungs: readonly BootCacheRung[]): string =>
	`Carried in at new run: ${rungs
		.map(
			(rung) =>
				`${formatStorage(rung.archiveBytes)} of archive banks ${kbLabel(rung.storageKb)}`
		)
		.join(", ")}.`;

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
	control.price.kind === "rungs"
		? rungsLine(control.price.rungs)
		: FROM_ARCHIVE;

const carriedLine = (bytes: number): string =>
	`Carried in at new run for ${formatStorage(bytes)} of archive.`;

const pressedLine = (price: ServicePrice): string =>
	`Pressed in the shop for ${priceLabelOf(price)} of run storage.`;

const availabilityOf = (control: RegistryControlSpec): string => {
	if (control.soldIn === "archive") return archiveLine(control);
	if (isCarriedService(control))
		return `${carriedLine(control.carryBytes)} ${shopLine(control)} ${pressedLine(control.price)}`;
	return shopLine(control);
};

const lockedUnlockOf = ({
	control,
	unlocked,
}: ControldexEntry): string | undefined =>
	unlocked ? undefined : unlockCaptionOf(control);

const controlRowFor = (entry: ControldexEntry): DexControlRow => {
	const { control } = entry;
	const unlock = lockedUnlockOf(entry);
	if (unlock !== undefined)
		return {
			id: control.id,
			glyph: control.glyph,
			title: REDACTED,
			detail: REDACTED,
			locked: true,
			unlock,
		};

	return {
		id: control.id,
		glyph: control.glyph,
		title: control.title,
		detail: serviceLineOf(control),
		price: rowPriceOf(control),
	};
};

const controlDetailFor = (entry: ControldexEntry): DexControlDetail => {
	const unlock = lockedUnlockOf(entry);
	return {
		label: unlock === undefined ? entry.control.title : REDACTED,
		control: controlRowFor(entry),
		availability:
			unlock === undefined
				? availabilityOf(entry.control)
				: `${unlock} to unlock it.`,
	};
};

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
		count: HELD_OF(
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
				label: HELD_OF(
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
		count: HELD_OF(
			entries.filter((entry) => entry.tier !== "unseen").length,
			entries.length
		),
		meta: AUDITS_META,
		note: AUDITS_NOTE,
	};
};

const SWATCHES_NOTE =
	"A swatch is earned by reaching 100% coverage at its gate. Clearing the gate alone does not mint it.";
const SWATCHES_META = "one a gate, swept";

const SWATCH_RULE =
	"Reach 100% coverage at this gate to mint it. Clearing the gate alone does not.";
const SWATCH_EARNED = "Minted. You reached 100% coverage.";

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
		count: HELD_OF(
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
