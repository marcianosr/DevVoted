import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import {
	CONFIG_GROUP_ORDER,
	type ConfigGroup,
	configGroupOf,
} from "~/modules/run/config/domain/configGroup.model";
import {
	settledChipFor,
	settledFactsFor,
} from "~/modules/run/config/application/configChip.viewmodel";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	BALANCE_WORD,
	fundsOf,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import {
	BASE_SLOTS,
	BOOT_CACHE_RUNGS,
} from "~/modules/run/run/domain/rules.model";
import type { WarmBoot } from "~/modules/run/run/domain/run.model";
import {
	type WarmBootPick,
	warmBootOrderOf,
} from "~/modules/run/run/domain/warmBoot.model";
import {
	isCarriedService,
	isServiceUnlocked,
	REGISTRY_CONTROL_LIST,
	REGISTRY_CONTROLS,
	type RegistryControlId,
	type RegistryControlSpec,
	registryControlOf,
} from "~/modules/run/shop/domain/registryControl.model";
import { shortfallOf } from "~/modules/run/shop/application/shopScreen.viewmodel";
import { plural } from "~/shared/lib/displayValue";
import {
	archiveLabel,
	formatStorage,
	kbLabel,
	STORAGE_UNITS,
} from "~/shared/lib/storage";
import {
	type VendorLockChip,
	vendorChipFor,
} from "~/modules/run/build/application/vendorChip.viewmodel";

import type { BuildProps } from "~/ui/kanto-theme/Build.ui";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { LeadLine } from "~/ui/kanto-theme/Lead.ui";
import type {
	RegistryGroup,
	RegistryProps,
} from "~/ui/kanto-theme/Registry.ui";
import type {
	NewRunScreenProps,
	RegistryFilter,
} from "~/ui/kanto-theme/NewRunScreen.ui";
import type { ActionTone } from "~/ui/kanto-theme/Action.ui";
import type { ScreenFooterProps } from "~/ui/kanto-theme/ScreenFooter.ui";
import type { WarmBootProps, WarmBootRow } from "~/ui/kanto-theme/WarmBoot.ui";

const START_GATE = 0;
const FREE_UPKEEP = 0;

const NEW_RUN_TITLE = "New run";
const FREE_PRICE = "free";
export const EMPTY_LABEL = "nothing installed yet";
export const INSTALLED_LABEL = "Installed";
export const CONFIG_GROUP_LABELS = {
	coverage: "Coverage",
	storage: "Storage",
	answerHelp: "Answer help",
	risk: "Risk",
	misc: "Misc",
} as const satisfies Record<ConfigGroup, string>;
const START_LABEL = `${gateSwatchAt(START_GATE).gateName} gate prep`;
const CONFIG_WORD = "config";
const WEIGHT_WORD = "weight";
export const NEW_RUN_BUILD_NOTE: LeadLine = [
	"Select configs up to ",
	{ figure: `${BASE_SLOTS}` },
	` ${WEIGHT_WORD} units`,
];
const READING_JOIN = " · ";
export const BARE_BUILD_REMEDY = `install at least one ${CONFIG_WORD}`;

export type NewRunBuild = { configs: number; held: number; slots: number };

export const newRunPressNoteOf = (build: NewRunBuild): string =>
	build.configs === 0 ? BARE_BUILD_REMEDY : buildReadingOf(build);

export const buildReadingOf = ({ configs, held, slots }: NewRunBuild): string =>
	`${plural(configs, CONFIG_WORD)}${READING_JOIN}${held}/${slots} ${WEIGHT_WORD}`;

export const newRunHeaderFor = (balanceKb: number): HeaderProps => ({
	swatch: gateSwatchAt(START_GATE),
	swatches: swatchTrackFor([], START_GATE),
	funds: fundsOf(balanceKb, BALANCE_WORD),
	title: NEW_RUN_TITLE,
});

export type HandCard = {
	config: Config;
	held: boolean;
	fits: boolean;
	onPress: () => void;
};

export const handCardFor = ({
	config,
	held,
	fits,
	onPress,
}: HandCard): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	badges: [],
	skipped: held || !fits,
	install: held
		? { label: INSTALLED_LABEL, disabled: true }
		: { onPress, disabled: !fits },
	info: settledFactsFor(config),
});

export const newRunGroupsFor = (
	hand: readonly HandCard[]
): readonly RegistryGroup[] =>
	CONFIG_GROUP_ORDER.map((group) => ({
		id: group,
		label: CONFIG_GROUP_LABELS[group],
		offers: hand
			.filter((card) => configGroupOf(card.config) === group)
			.map(handCardFor),
	})).filter((group) => group.offers.length > 0);

const FILTER_MIN_GROUPS = 2;
export const EVERY_GROUP = "all";
export const EVERY_GROUP_LABEL = "All";

export const newRunFilterFor = (
	groups: readonly RegistryGroup[],
	picked: string | undefined,
	onPick: (group: string | undefined) => void
): RegistryFilter | undefined =>
	groups.length < FILTER_MIN_GROUPS
		? undefined
		: {
				items: [
					{
						value: EVERY_GROUP,
						label: EVERY_GROUP_LABEL,
						count: groups.reduce((sum, group) => sum + group.offers.length, 0),
					},
					...groups.map(({ id, label, offers }) => ({
						value: id,
						label,
						count: offers.length,
					})),
				],
				value: picked ?? EVERY_GROUP,
				onSelect: (value) => onPick(value === EVERY_GROUP ? undefined : value),
			};

export const newRunBuildFor = (
	configs: readonly Config[],
	held: number,
	onUninstall: (configId: string) => void,
	vendorLockFor: (configId: string) => VendorLockChip | undefined = () =>
		undefined,
	panels: Pick<BuildProps, "openInfo" | "onToggleInfo" | "onToggleAll"> = {}
): BuildProps => ({
	configs: configs.map((config) => ({
		name: config.label,
		...settledChipFor(config),
		...vendorChipFor(vendorLockFor(config.id), () => onUninstall(config.id)),
	})),
	weight: { held, perGateKb: FREE_UPKEEP },
	emptyLabel: EMPTY_LABEL,
	...panels,
});

export const newRunRegistryFor = (
	groups: readonly RegistryGroup[],
	picked?: string,
	panels: Pick<RegistryProps, "openInfo" | "onToggleInfo" | "onToggleAll"> = {}
): RegistryProps => {
	const showing = groups.filter(
		(group) => picked === undefined || group.id === picked
	);

	return {
		offers: showing.flatMap((group) => group.offers),
		groups: showing,
		slotPrice: FREE_PRICE,
		...panels,
	};
};

const COMMIT_TONE: ActionTone = "commit";
const ARCHIVE_WORD = "archive";

const startLabelOf = (spend?: string): string =>
	spend === undefined
		? START_LABEL
		: `${START_LABEL}${READING_JOIN}${spend} ${ARCHIVE_WORD}`;

export const newRunFooterFor = (
	onStart?: () => void,
	refusal?: string,
	build: NewRunBuild = { configs: 0, held: 0, slots: BASE_SLOTS },
	spend?: string
): ScreenFooterProps => ({
	action: {
		label: startLabelOf(spend),
		swatch: { state: "current", swatch: gateSwatchAt(START_GATE) },
		onPress: onStart,
		...(spend === undefined ? {} : { tone: COMMIT_TONE }),
	},
	note: newRunPressNoteOf(build),
	...(refusal === undefined ? {} : { refusal }),
});

export type WarmBootDraft = {
	readonly rung: number | null;
	readonly serviceIds: readonly RegistryControlId[];
};

export type WarmBootDeal = {
	readonly archiveKb: number;
	readonly unlockedServiceIds: readonly string[];
	readonly draft: WarmBootDraft;
	readonly onPickRung: (rung: number | null) => void;
	readonly onToggleService: (id: RegistryControlId) => void;
};

export const EMPTY_WARM_BOOT_DRAFT: WarmBootDraft = {
	rung: null,
	serviceIds: [],
};

export const WARM_BOOT_NOTE =
	"Picked here, paid from the archive when you start. Nothing is spent until then.";
const CARRY_WORD = "carry";
const AFTER_WORD = "after";
const SPENT_WORD = "spent";
const BANKED_WORD = "banked";
const NOTHING = 0;
const BOOT_CACHE = REGISTRY_CONTROLS.bootCache;

export const draftPickOf = (draft: WarmBootDraft): WarmBootPick => ({
	...(draft.rung === null ? {} : { bootCacheRung: draft.rung }),
	serviceIds: draft.serviceIds,
});

export const isDrafted = (draft: WarmBootDraft): boolean =>
	draft.rung !== null || draft.serviceIds.length > NOTHING;

const draftBytesOf = (draft: WarmBootDraft): number =>
	warmBootOrderOf(draftPickOf(draft)).archiveBytes;

export const warmBootSpendOf = (draft: WarmBootDraft): string | undefined =>
	isDrafted(draft) ? formatStorage(draftBytesOf(draft)) : undefined;

const toKb = (bytes: number): number => Math.floor(bytes / STORAGE_UNITS.KB);

const rungTitleOf = (storageKb: number): string =>
	`${BOOT_CACHE.title}${READING_JOIN}${kbLabel(storageKb)}`;

type PickRow = {
	readonly id: string;
	readonly control: RegistryControlSpec;
	readonly title: string;
	readonly priceBytes: number;
	readonly picked: boolean;
	readonly onToggle: () => void;
};

const pickRowFor = (row: PickRow, roomBytes: number): WarmBootRow => {
	const short = !row.picked && row.priceBytes > roomBytes;
	return {
		id: row.id,
		glyph: row.control.glyph,
		title: row.title,
		detail: row.control.detail,
		price: formatStorage(row.priceBytes),
		...(short
			? { refusal: shortfallOf(toKb(row.priceBytes), toKb(roomBytes)) }
			: {}),
		pick: {
			label: `${CARRY_WORD} ${row.title}`,
			checked: row.picked,
			onToggle: row.onToggle,
			disabled: short,
		},
	};
};

const bootCacheRowsFor = (
	deal: WarmBootDeal,
	roomBytes: number
): readonly WarmBootRow[] =>
	BOOT_CACHE_RUNGS.map((rung, index) =>
		pickRowFor(
			{
				id: `${BOOT_CACHE.id}-${index}`,
				control: BOOT_CACHE,
				title: rungTitleOf(rung.storageKb),
				priceBytes: rung.archiveBytes,
				picked: deal.draft.rung === index,
				onToggle: () =>
					deal.onPickRung(deal.draft.rung === index ? null : index),
			},
			roomBytes
		)
	);

const pickedRungBytesOf = (draft: WarmBootDraft): number =>
	draft.rung === null ? NOTHING : (BOOT_CACHE_RUNGS[draft.rung]?.archiveBytes ?? NOTHING);

export const warmBootPanelFor = (
	deal: WarmBootDeal
): WarmBootProps | undefined => {
	const archiveBytes = deal.archiveKb * STORAGE_UNITS.KB;
	const draftBytes = draftBytesOf(deal.draft);
	const room = archiveBytes - draftBytes;
	const unlocked = (control: RegistryControlSpec) =>
		isServiceUnlocked(control, deal.unlockedServiceIds);
	const bootRows = unlocked(BOOT_CACHE)
		? bootCacheRowsFor(deal, room + pickedRungBytesOf(deal.draft))
		: [];
	const serviceRows = REGISTRY_CONTROL_LIST.filter(isCarriedService)
		.filter(unlocked)
		.map((control) =>
		pickRowFor(
			{
				id: control.id,
				control,
				title: control.title,
				priceBytes: control.carryBytes,
				picked: deal.draft.serviceIds.includes(control.id),
				onToggle: () => deal.onToggleService(control.id),
			},
			room
		)
	);
	const rows = [...bootRows, ...serviceRows];
	if (rows.length === NOTHING) return undefined;

	return {
		rows,
		meta:
			draftBytes === NOTHING
				? archiveLabel(archiveBytes)
				: `${archiveLabel(archiveBytes)}${READING_JOIN}${formatStorage(room)} ${AFTER_WORD}`,
		note: WARM_BOOT_NOTE,
	};
};

export const bootedPanelFor = (
	boot: WarmBoot,
	archiveKb: number
): WarmBootProps => {
	const bootRows: readonly WarmBootRow[] =
		boot.storageKb > NOTHING
			? [
					{
						id: BOOT_CACHE.id,
						glyph: BOOT_CACHE.glyph,
						title: `${rungTitleOf(boot.storageKb)} ${BANKED_WORD}`,
						detail: BOOT_CACHE.detail,
					},
				]
			: [];
	const serviceRows = boot.serviceIds.map((id) => {
		const control = registryControlOf(id);
		return {
			id,
			glyph: control.glyph,
			title: control.title,
			detail: control.detail,
			price: formatStorage(control.carryBytes ?? NOTHING),
		};
	});

	return {
		rows: [...bootRows, ...serviceRows],
		meta: `${SPENT_WORD} ${formatStorage(boot.archiveBytes)}${READING_JOIN}${archiveLabel(archiveKb * STORAGE_UNITS.KB)}`,
	};
};

export const NEW_RUN_BALANCE_WORD = BALANCE_WORD;
export type { NewRunScreenProps, RegistryProps };
