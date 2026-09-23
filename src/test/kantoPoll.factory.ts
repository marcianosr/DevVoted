import type { Config } from "~/modules/run/config/domain/config.model";
import {
	chipFor,
	figureLabel,
	infoFor,
	upgradesFor,
} from "~/modules/run/config/application/configChip.viewmodel";

export { chipFor, infoFor, upgradesFor };
import { type AuditId, auditAt } from "~/modules/run/gate/domain/audit.model";
import {
	AB_ARMS,
	CONFIG_SIZES,
	abArmLabel,
	DRAFT_COST_PER_SLOT_KB,
	draftCost,
	sellRefund,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { lintCost, peekCost } from "~/modules/run/run/domain/paidAction.model";
import { recommendedPicks } from "~/modules/run/config/domain/hand.model";
import {
	BASE_SLOTS,
	BUILD_SPACE_RUNGS,
	MAX_PARTIAL_SHARE,
	rungIndexFitting,
	upkeepForSpace,
	MIN_PARTIAL_SHARE,
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	SHARE_STEP,
	SLICE_WINDOW,
	VICTORY_GATE,
	pinCostFor,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
import {
	BASE_UNIT,
	floorAt,
	percentOf,
	coverageGainPercentFor,
	MULTIPLE_CREDIT,
	SINGLE_CREDIT,
	gainPerCorrectFor,
	healthyAt,
	okAt,
	ratioOf,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	EXTEND_FROM_GATE,
	LOCK_COST_KB,
	MAX_EXTENSIONS,
	extendCost,
	rebuildCost,
} from "~/modules/run/shop/domain/draft.model";
import { kbLabel } from "~/shared/lib/storage";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { BuildProps, BuildWeight } from "~/ui/kanto-theme/Build.ui";
import type { BuildFooterProps } from "~/ui/kanto-theme/BuildFooter.ui";
import type {
	ConfigChipBadge,
	ConfigChipProps,
} from "~/ui/kanto-theme/ConfigChip.ui";
import type { RegistryProps } from "~/ui/kanto-theme/Registry.ui";
import type { SlotTrackFill } from "~/ui/kanto-theme/SlotTrack.ui";
import type {
	WeightTrackFill,
	WeightTrackProps,
} from "~/ui/kanto-theme/WeightTrack.ui";
import type { RegistryControlProps } from "~/ui/kanto-theme/RegistryControl.ui";
import type { ShopScreenProps } from "~/ui/kanto-theme/ShopScreen.ui";
import type { UninstallProps } from "~/ui/kanto-theme/Uninstall.ui";
import type { PrepScreenProps } from "~/ui/kanto-theme/PrepScreen.ui";
import type { NewRunScreenProps } from "~/ui/kanto-theme/NewRunScreen.ui";
import type { ScreenFooterProps } from "~/ui/kanto-theme/ScreenFooter.ui";
import type { PollFactsProps } from "~/ui/kanto-theme/PollFacts.ui";
import type { PollScreenProps } from "~/ui/kanto-theme/PollScreen.ui";
import type {
	QuestionOption,
	QuestionProps,
} from "~/ui/kanto-theme/Question.ui";
import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";
import type { LeadLine } from "~/ui/kanto-theme/Lead.ui";
import type { CoverageRingProps } from "~/ui/kanto-theme/CoverageRing.ui";

import { createMockDataFactory } from "~/test/createMockDataFactory";
import {
	gateSwatchAt,
	pollPayoutRows,
	trackTo,
} from "~/test/swatchTrack.factory";

const SAMPLE_GATE = 9;
const BALANCE_KB = 1843;

const LEAK = auditAt("memory-leak", SAMPLE_GATE);
const OUTAGE = auditAt("dependency-outage", SAMPLE_GATE);

export const kantoAudits = [
	{
		code: LEAK.code,
		name: LEAK.name,
		cue: "leaking 16 KB a poll · 32 KB on a miss",
	},
	{
		code: OUTAGE.code,
		name: OUTAGE.name,
		cue: "Intellisense is out this attempt",
	},
] satisfies AuditProps[];

export const configSizes: readonly number[] = CONFIG_SIZES;

export const LINT_USES = 2;
export const PEEK_USES = 2;

const noop = () => {};

const UNINSTALL_BALANCE_KB = 704;
const UNINSTALL_SLOTS_USED = 7;
const UNINSTALL_CAPACITY = 10;

export const uninstallFor = (config: Config): UninstallProps => {
	const refund = sellRefund(config);
	const slots = slotsOf(config);

	return {
		name: config.label,
		slots,
		prose: "Removing it frees its room and refunds half the draft price.",
		figures: [
			{ label: "refund", value: `+${kbLabel(refund)}`, color: "viridian" },
			{
				label: "balance",
				value: `${UNINSTALL_BALANCE_KB} → ${kbLabel(UNINSTALL_BALANCE_KB + refund)}`,
			},
			{
				label: "slots used",
				value: `${UNINSTALL_SLOTS_USED} → ${UNINSTALL_SLOTS_USED - slots} of ${UNINSTALL_CAPACITY}`,
			},
		],
	};
};

export const kantoRunningConfigs = [
	{
		name: ".ts",
		badges: [{ label: "×2", color: "viridian" }],
		...chipFor({ ...CONFIGS.ts, level: 4 }),
	},
	{
		name: "AGENTS.md",
		badges: [{ label: "×2", color: "viridian" }],
		...chipFor(CONFIGS.agentsMd),
	},
	{
		name: "Cache",
		badges: [{ label: "×1.75", color: "viridian" }],
		...chipFor(CONFIGS.cache),
	},
	{
		name: "Code Coverage",
		badges: [{ label: "+0.5", color: "viridian" }],
		...chipFor(CONFIGS.codeCoverage),
	},
	{
		name: "A/B Test",
		badges: [
			{
				label: `arm ${abArmLabel("coverage")}`,
				armed: true,
				hint: `A/B Test · switch to arm ${abArmLabel("storage")}`,
				onPress: noop,
			},
			{ label: "×1.25", color: "viridian" },
		],
		...chipFor(CONFIGS.abTest, AB_ARMS.coverage.gives),
	},
	{
		name: "Deprecated",
		badges: [{ label: "×2 fading", color: "vermillion" }],
		...chipFor(
			CONFIGS.deprecated,
			"At ×2 now — deleted from the build two clears from here."
		),
	},
	{
		name: "Dependabot",
		badges: [{ label: "bump in 2", color: "vermillion" }],
		...chipFor(CONFIGS.dependabot),
	},
	{
		name: "ESLint",
		badges: [
			{
				label: `lint ${kbLabel(lintCost(LINT_USES))}`,
				hint: `ESLint · cross out a wrong answer · ${kbLabel(lintCost(LINT_USES))}`,
				onPress: noop,
			},
		],
		...chipFor(CONFIGS.eslint),
	},
	{
		name: "Telemetry",
		badges: [
			{
				label: `peek ${kbLabel(peekCost(PEEK_USES))}`,
				hint: `Telemetry · see how the community answered · ${kbLabel(peekCost(PEEK_USES))}`,
				onPress: noop,
			},
		],
		...chipFor(
			{ ...CONFIGS.telemetry, level: 2 },
			"v2 names the sample size, so 100% of two cannot fool you."
		),
	},
	{
		name: "Intellisense",
		badges: [{ label: "424", color: "cinnabar" }],
		lost: true,
		...chipFor(CONFIGS.intellisense),
	},
] satisfies ConfigChipProps[];

export const kantoSkippedConfigs = [
	{
		name: "Cold Start",
		badges: [{ label: "spent", color: "pewter" }],
		skipped: true,
		...chipFor(CONFIGS.coldStart, "the run's cap is spent"),
	},
	{
		name: "IndexedDB",
		badges: [{ label: "capped", color: "pewter" }],
		skipped: true,
		...chipFor(CONFIGS.indexedDb, "the faucet is capped for this gate"),
	},
	{
		name: "Unit Tests",
		badges: [{ label: "at the clear", color: "pewter" }],
		skipped: true,
		...chipFor({ ...CONFIGS.unitTests, level: 3 }, "pays at the gate clear"),
	},
	{
		name: "Moore's Law",
		badges: [{ label: "at the clear", color: "pewter" }],
		skipped: true,
		...chipFor({ ...CONFIGS.mooresLaw, level: 2 }, "pays at the gate clear"),
	},
	{
		name: "Stylelint",
		badges: [{ label: "CSS only", color: "pewter" }],
		skipped: true,
		...chipFor(CONFIGS.stylelint, "this poll is not CSS"),
	},
] satisfies ConfigChipProps[];

export const kantoPollOptions = [
	{ id: "option-1", letter: "A", label: "Partial<T>" },
	{ id: "option-2", letter: "B", label: "Optional<T>" },
	{ id: "option-3", letter: "C", label: "Maybe<T>" },
] satisfies QuestionOption[];

export const BALANCE_WORD = "balance";

export const createKantoHeaderProps = createMockDataFactory<HeaderProps>({
	swatch: gateSwatchAt(SAMPLE_GATE),
	swatches: trackTo(SAMPLE_GATE),
	funds: fundsOf(BALANCE_KB, BALANCE_WORD),
});

export const createKantoBuildProps = createMockDataFactory<BuildProps>({
	configs: kantoRunningConfigs,
	skipped: kantoSkippedConfigs,
	skippedNote: "nothing to do on this poll",
});

export const createKantoBuildFooterProps =
	createMockDataFactory<BuildFooterProps>({
		build: createKantoBuildProps(),
		counts: { ready: 2, applies: 7, offline: 1, changing: 2 },
	});

export const createKantoQuestionProps = createMockDataFactory<QuestionProps>({
	answerType: "single",
	question: "Which utility type makes every property optional?",
	options: kantoPollOptions,
});

export const KANTO_COVERAGE_HELD = 74;

export const createKantoCoverageRingProps =
	createMockDataFactory<CoverageRingProps>({
		held: KANTO_COVERAGE_HELD,
		demand: percentOf(healthyAt(SAMPLE_GATE)),
		title: `Coverage toward ${gateSwatchAt(SAMPLE_GATE).gateName}`,
		note: "Pick an answer to see where it puts you.",
	});

export const KANTO_COVERAGE_BAR_HELD = 70;
export const createKantoCoverageBarProps =
	createMockDataFactory<CoverageBarProps>({
		held: KANTO_COVERAGE_BAR_HELD,
		floor: percentOf(floorAt(SAMPLE_GATE)),
		ok: percentOf(okAt(SAMPLE_GATE)),
		healthy: percentOf(healthyAt(SAMPLE_GATE)),
	});

export const KANTO_RUN_PAYOUTS = [
	[1, 2, 0, 0, 1],
	[1, 0.5, 0, 1.5, 0],
	[2, 1, 0, 0, 1],
	[1, 0, 2, 0.5, 0],
	[2, 2, 0, 0, 0],
	[1, 1, 0.5, 0, 1],
	[2, 0, 1.5, 0, 0],
	[1, 1, 1, 0, 0.5],
	[0, 2, 0.5, 0, 0],
	[1, 2, 0.5, undefined, undefined],
] as const satisfies readonly (readonly (number | undefined)[])[];

const KANTO_UNITS_HELD = KANTO_RUN_PAYOUTS.flat().reduce<number>(
	(sum, paid) => sum + (paid ?? 0),
	0
);

export const kantoCoverageLead = (): LeadLine => [
	"You have scored ",
	{ figure: `${KANTO_UNITS_HELD}`, gain: true },
	" units across ",
	{ figure: `${scoringSlotsAt(SAMPLE_GATE)}` },
	" slots, which is ",
	{ figure: `${KANTO_COVERAGE_BAR_HELD.toFixed(1)}%`, gain: true },
	" coverage.",
];

/**
 * The mock's own numbers: a poll 31% of the room cracked on their first deal,
 * dealt to this account twice and missed both times.
 */
export const createKantoPollFactsProps = createMockDataFactory<
	Omit<PollFactsProps, "trailing">
>({
	difficulty: {
		badge: "brutal",
		tone: "cinnabar",
		figure: "31%",
		text: "got it right first time",
	},
	history: {
		badge: "seen before",
		tone: "saffron",
		text: "answered twice · you missed it both times, last on 4 Aug",
	},
});

export const createKantoPollScreenProps =
	createMockDataFactory<PollScreenProps>({
		header: createKantoHeaderProps(),
		coverage: {
			bar: createKantoCoverageBarProps(),
			lead: kantoCoverageLead(),
			paid: {
				rows: pollPayoutRows(KANTO_RUN_PAYOUTS).slice(-1),
			},
		},
		pollLabel: "Poll 4 out of 5",
		category: "TypeScript",
		categoryColor: "cinnabar",
		wrongCost: "0.77",
		buildFooter: createKantoBuildFooterProps(),
		question: createKantoQuestionProps(),
		audits: kantoAudits,
		facts: createKantoPollFactsProps(),
		hint: "tap any config to open it · press A, B or C to answer",
	});

const SEPARATOR = "·";
export const SHOP_BALANCE_KB = 96;
export const SHOP_CAPACITY_SLOTS = 10;

export const offerFor = (
	config: Config,
	balance: number = SHOP_BALANCE_KB
): ConfigChipProps => {
	const priceKb = draftCost(config);

	return offerChipFor(config, {
		priceKb,
		affordable: priceKb <= balance,
		onInstall: noop,
	});
};

const FIRST_VERSION = 1;

export const upgradeOfferFor = (
	offer: Config,
	balance: number = SHOP_BALANCE_KB,
	heldLevel: number = FIRST_VERSION
): ConfigChipProps => {
	const priceKb = draftCost(offer);

	return upgradeChipFor(offer, heldLevel, {
		priceKb,
		affordable: priceKb <= balance,
		onInstall: noop,
	});
};

const offersAt = (balance: number): ConfigChipProps[] => [
	offerFor(CONFIGS.intellisense, balance),
	offerFor(CONFIGS.indexedDb, balance),
	upgradeOfferFor({ ...CONFIGS.ts, level: 3 }, balance),
	offerFor(CONFIGS.planningPoker, balance),
	offerFor(CONFIGS.prefetch, balance),
];

export const kantoRegistryOffers: readonly ConfigChipProps[] =
	offersAt(SHOP_BALANCE_KB);

export const kantoShopBuild = [
	{
		name: ".ts",
		badges: [{ label: "×1.5", color: "viridian" }],
		onUninstall: noop,
		...chipFor({ ...CONFIGS.ts, level: 2 }),
	},
	{
		name: "Code Coverage",
		badges: [{ label: "+0.5", color: "viridian" }],
		onUninstall: noop,
		...chipFor(CONFIGS.codeCoverage),
	},
	{
		name: "Unit Tests",
		badges: [{ label: "+96 KB", color: "viridian" }],
		onUninstall: noop,
		...chipFor({ ...CONFIGS.unitTests, level: 3 }),
	},
	{
		name: "Moore's Law",
		badges: [{ label: "+4%", color: "viridian" }],
		onUninstall: noop,
		...chipFor({ ...CONFIGS.mooresLaw, level: 2 }),
	},
	{
		name: "Telemetry",
		badges: [{ label: "with sample size", color: "viridian" }],
		onUninstall: noop,
		...chipFor({ ...CONFIGS.telemetry, level: 2 }),
	},
] satisfies ConfigChipProps[];

export const usedSlotsOf = (configs: readonly ConfigChipProps[]) =>
	configs.reduce((total, config) => total + (config.slots ?? 0), 0);

export const kantoTrackFills: readonly SlotTrackFill[] = kantoShopBuild.map(
	({ name, slots }) => ({ name, slots: slots ?? 0 })
);

export const kantoWeightFills: readonly WeightTrackFill[] = kantoTrackFills;

export const kantoBuildWeight = usedSlotsOf(kantoShopBuild);

export const KANTO_BUILD_SPACE = 8;

export const createKantoWeightTrackProps =
	createMockDataFactory<WeightTrackProps>({
		fills: kantoWeightFills,
		held: KANTO_BUILD_SPACE,
	});

export const baseSlots = BASE_SLOTS;

const shortfallOf = (priceKb: number, balanceKb: number) =>
	`${kbLabel(priceKb - balanceKb)} short`;

const controlOf = (
	glyph: string,
	title: string,
	detail: string,
	priceKb: number,
	balance: number
): RegistryControlProps => ({
	glyph,
	title,
	detail,
	price: kbLabel(priceKb),
	refusal: priceKb <= balance ? undefined : shortfallOf(priceKb, balance),
	onPress: noop,
});

export const kantoShopControlsAt = (
	cleared: number = SAMPLE_GATE,
	balance: number = SHOP_BALANCE_KB,
	extensionsBought = 0,
	rebuildsUsed = 0
): RegistryControlProps[] => [
	controlOf(
		"↻",
		"Rebuild the registry",
		"deals a fresh set of offers",
		rebuildCost(rebuildsUsed),
		balance
	),
	...(cleared >= EXTEND_FROM_GATE && extensionsBought < MAX_EXTENSIONS
		? [
				controlOf(
					"+",
					"Extend the registry",
					"one more offer, now and every shop after",
					extendCost(extensionsBought),
					balance
				),
			]
		: []),
	...(cleared >= PIN_FROM_GATE && cleared <= PIN_UNTIL_GATE
		? [
				controlOf(
					"⚑",
					`git tag ${SEPARATOR} gate ${cleared + 1}`,
					"if this run dies, the next resumes here",
					pinCostFor(cleared),
					balance
				),
			]
		: []),
];

export const kantoRegistryControls = kantoShopControlsAt();

export const SHOP_UNITS_HELD = 41;

export const kantoShopHeaderAt = (
	cleared: number = SAMPLE_GATE,
	balance: number = SHOP_BALANCE_KB
): HeaderProps => ({
	swatch: gateSwatchAt(cleared),
	swatches: trackTo(cleared + 1),
	funds: fundsOf(balance, BALANCE_WORD),
	title: `Shop ${SEPARATOR} cleared ${gateSwatchAt(cleared).gateName}`,
	note: `gate ${cleared} cleared`,
});

export const kantoNextGateAt = (
	cleared: number = SAMPLE_GATE,
	unitsHeld: number = SHOP_UNITS_HELD,
	unitsPerCorrect = BASE_UNIT
) => nextGateFor(cleared, unitsHeld, unitsPerCorrect);

const openChip = (chip: ConfigChipProps) => {
	if (chip.locked === true) throw new Error("fixture chips are never redacted");
	return chip;
};

export const lockBadgeFor = (name: string, held = false): ConfigChipBadge => ({
	label: `lock ${SEPARATOR} ${kbLabel(LOCK_COST_KB)}`,
	armed: held,
	hint: held
		? `Release the lock on ${name}`
		: `Hold ${name} for the next shop ${SEPARATOR} ${kbLabel(LOCK_COST_KB)}`,
	onPress: noop,
});

export const withLockBadge = (
	offer: ConfigChipProps,
	held = false
): ConfigChipProps => {
	const open = openChip(offer);
	return { ...open, badges: [lockBadgeFor(open.name, held), ...open.badges] };
};

export const kantoLockedRegistryOffers: readonly ConfigChipProps[] =
	kantoRegistryOffers.map((offer, index) => {
		const open = openChip(offer);
		if (open.upgrades !== undefined) return open;
		return withLockBadge(open, index === 0);
	});

export const kantoShopUninstalls: Readonly<Record<string, UninstallProps>> = {
	".ts": uninstallFor({ ...CONFIGS.ts, level: 2 }),
	"Code Coverage": uninstallFor(CONFIGS.codeCoverage),
	"Unit Tests": uninstallFor({ ...CONFIGS.unitTests, level: 3 }),
	"Moore's Law": uninstallFor({ ...CONFIGS.mooresLaw, level: 2 }),
	Telemetry: uninstallFor({ ...CONFIGS.telemetry, level: 2 }),
};

export const createKantoRegistryProps = createMockDataFactory<RegistryProps>({
	offers: kantoRegistryOffers,
	slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
});

export const kantoShopWeight = (): BuildWeight => ({
	held: KANTO_BUILD_SPACE,
	perGateKb: upkeepForSpace(KANTO_BUILD_SPACE),
	next: BUILD_SPACE_RUNGS[rungIndexFitting(kantoBuildWeight) + 1],
});

export const createKantoShopScreenProps =
	createMockDataFactory<ShopScreenProps>({
		header: kantoShopHeaderAt(),
		nextGate: kantoNextGateAt(),
		controls: kantoRegistryControls,
		build: {
			configs: kantoShopBuild,
			weight: kantoShopWeight(),
		},
		registry: createKantoRegistryProps(),
	});

const READ_ONLY = auditAt("read-only", SAMPLE_GATE);

export const kantoClosedShopAudit = {
	code: READ_ONLY.code,
	name: READ_ONLY.name,
	cue: "nothing can be bought, sold or switched before this gate",
} satisfies AuditProps;

const inertBadge = (badge: ConfigChipBadge): ConfigChipBadge =>
	"onPress" in badge ? { ...badge, disabled: true } : badge;

const inertChip = (chip: ConfigChipProps): ConfigChipProps => {
	const open = openChip(chip);
	return {
		...open,
		badges: open.badges.map(inertBadge),
		onUninstall: undefined,
		install:
			open.install === undefined
				? undefined
				: { ...open.install, disabled: true },
		upgrades:
			open.upgrades === undefined
				? undefined
				: { ...open.upgrades, onBuy: undefined },
	};
};

export const kantoClosedShopProps = (): ShopScreenProps => {
	return {
		header: kantoShopHeaderAt(),
		nextGate: kantoNextGateAt(),
		controls: kantoShopControlsAt().map((control) => ({
			...control,
			disabled: true,
		})),
		audits: [kantoClosedShopAudit],
		build: {
			configs: kantoShopBuild.map(inertChip),
			weight: kantoShopWeight(),
		},
		registry: {
			offers: kantoRegistryOffers.map(inertChip),
			slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
		},
	};
};

export const FIRST_SHOP_BALANCE_KB = 64;

export const kantoFirstShopProps = (): ShopScreenProps => ({
	header: kantoShopHeaderAt(0, FIRST_SHOP_BALANCE_KB),
	nextGate: kantoNextGateAt(0, 0),
	controls: kantoShopControlsAt(0, FIRST_SHOP_BALANCE_KB),
	build: {
		configs: [],
		weight: kantoShopWeight(),
	},
	registry: {
		offers: [
			offerFor(CONFIGS.intellisense, FIRST_SHOP_BALANCE_KB),
			offerFor(CONFIGS.indexedDb, FIRST_SHOP_BALANCE_KB),
			offerFor(CONFIGS.ts, FIRST_SHOP_BALANCE_KB),
			offerFor(CONFIGS.planningPoker, FIRST_SHOP_BALANCE_KB),
			offerFor(CONFIGS.prefetch, FIRST_SHOP_BALANCE_KB),
		],
		slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
	},
});

export const TAG_SHOP_BALANCE_KB = 160;

export const kantoTagShopProps = (): ShopScreenProps => ({
	header: kantoShopHeaderAt(4, TAG_SHOP_BALANCE_KB),
	nextGate: kantoNextGateAt(4, 16),
	controls: kantoShopControlsAt(4, TAG_SHOP_BALANCE_KB),
	build: {
		configs: kantoShopBuild,
		weight: kantoShopWeight(),
	},
	registry: {
		offers: offersAt(TAG_SHOP_BALANCE_KB),
		slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
	},
});

export const LATE_SHOP_BALANCE_KB = 704;

export const kantoLateShopProps = (): ShopScreenProps => ({
	header: kantoShopHeaderAt(11, LATE_SHOP_BALANCE_KB),
	nextGate: kantoNextGateAt(11, 58),
	controls: kantoShopControlsAt(11, LATE_SHOP_BALANCE_KB, MAX_EXTENSIONS),
	build: {
		configs: kantoShopBuild,
		weight: kantoShopWeight(),
	},
	registry: {
		offers: [
			...offersAt(LATE_SHOP_BALANCE_KB),
			offerFor(CONFIGS.cache, LATE_SHOP_BALANCE_KB),
			offerFor(CONFIGS.agentsMd, LATE_SHOP_BALANCE_KB),
		],
		slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
	},
});

export const NEW_RUN_ARCHIVE_KB = 512;
const START_GATE = 0;

const NUMBER_WORDS: Readonly<Record<number, string>> = {
	1: "one",
	2: "two",
	3: "three",
	4: "four",
	5: "five",
	12: "twelve",
	13: "thirteen",
};

const numberWord = (count: number) => NUMBER_WORDS[count] ?? String(count);

export const NEW_RUN_EMPTY_LABEL = "nothing installed yet";
export const SUGGESTED_LABEL = "suggested";
const SUGGESTED_COLOR = "cerulean" as const;
const ARCHIVE_WORD = "archive";

export const kantoNewRunHeader = (
	archiveKb: number = NEW_RUN_ARCHIVE_KB
): HeaderProps => ({
	swatch: gateSwatchAt(START_GATE),
	swatches: trackTo(START_GATE),
	funds: fundsOf(archiveKb, ARCHIVE_WORD),
	title: "New run",
	subtitle: `gate ${START_GATE} ${SEPARATOR} ${gateSwatchAt(START_GATE).gateName}`,
});

const NEW_RUN_HAND: readonly Config[] = [
	CONFIGS.js,
	CONFIGS.codeCoverage,
	CONFIGS.unitTests,
	CONFIGS.coldStart,
	CONFIGS.eslint,
];

const suggestedIdsIn = (
	hand: readonly Config[],
	capacity: number
): ReadonlySet<string> =>
	new Set(recommendedPicks(hand, capacity).map((config) => config.id));

export const kantoHandCards = (
	installedIds: readonly string[] = [],
	capacity: number = BASE_SLOTS,
	suggested = true
): ConfigChipProps[] => {
	const installed = new Set(installedIds);
	const usedSlots = NEW_RUN_HAND.filter((config) =>
		installed.has(config.id)
	).reduce((total, config) => total + slotsOf(config), 0);
	const marks = suggested
		? suggestedIdsIn(NEW_RUN_HAND, capacity)
		: new Set<string>();

	return NEW_RUN_HAND.map((config) => {
		const held = installed.has(config.id);
		const fits = slotsOf(config) <= capacity - usedSlots;
		const marked = !held && marks.has(config.id);

		return {
			name: config.label,
			slots: slotsOf(config),
			badges: marked
				? [{ label: SUGGESTED_LABEL, color: SUGGESTED_COLOR }]
				: [],
			skipped: held || !fits,
			install: held ? undefined : { onPress: noop, disabled: !fits },
			info: infoFor(config),
		};
	});
};

export const kantoNewRunRegistry = (
	installedIds: readonly string[] = [],
	capacity: number = BASE_SLOTS,
	suggested = true
): RegistryProps =>
	newRunRegistryFor(kantoHandCards(installedIds, capacity, suggested));

export const kantoNewRunBuild = (
	installedIds: readonly string[]
): ConfigChipProps[] =>
	NEW_RUN_HAND.filter((config) => installedIds.includes(config.id)).map(
		(config) => ({
			name: config.label,
			badges: [{ label: figureLabel(config), color: "viridian" as const }],
			onUninstall: noop,
			...chipFor(config),
		})
	);

export const kantoGateZeroFooter = (canStart = false): ScreenFooterProps =>
	newRunFooterFor(canStart ? noop : undefined);

import {
	BAND_OUTCOMES_NOTE,
	BAND_OUTCOMES_TITLE,
} from "~/modules/run/gate/application/bandOutcomes.viewmodel";
import {
	NEW_RUN_REGISTRY_NOTE,
	newRunFooterFor,
	newRunRegistryFor,
} from "~/modules/run/build/application/newRunScreen.viewmodel";
import { PEEL_KB_PER_SLOT } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import {
	nextGateFor,
	offerChipFor,
	upgradeChipFor,
} from "~/modules/run/shop/application/shopScreen.viewmodel";
import { failPeelQuotaFor } from "~/modules/run/gate/domain/gate.model";
import { gateClearPayout } from "~/modules/run/build/domain/build.model";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import {
	fundsOf,
	PREP_COMMUNITY_LABEL,
	PREP_POLLS_TITLE,
	type PrepWindow,
	prepPropsFor,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { CategoryCode } from "~/shared/lib/categories";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";

export const SCORING = {
	single: SINGLE_CREDIT,
	multiple: MULTIPLE_CREDIT,
	partialRungs: [MIN_PARTIAL_SHARE, SHARE_STEP * 2, MAX_PARTIAL_SHARE] as const,
};

export {
	fundsOf,
	type PrepWindow,
	BAND_OUTCOMES_NOTE,
	BAND_OUTCOMES_TITLE,
	PREP_COMMUNITY_LABEL,
	PREP_POLLS_TITLE,
};

const LAVENDER_GATE = 4;
const LAVENDER_BALANCE_KB = 102;
const LAVENDER_BUILD_SPACE = 8;
const LAVENDER_STREAK = 6;

const JS_V2 = { ...CONFIGS.js, level: 2 };
const TELEMETRY_V2 = { ...CONFIGS.telemetry, level: 2 };

const LAVENDER_CONFIGS: readonly Config[] = [
	JS_V2,
	CONFIGS.eslint,
	CONFIGS.deprecated,
	CONFIGS.agentsMd,
	CONFIGS.ts,
];

const LAVENDER_WINDOW: PrepWindow = {
	answerTypes: { single: 1, multiple: 4 },
	optionCounts: [4, 4, 5, 6, 4],
	categories: ["ts", "ts", "ts", "js", "js"],
	nextCategories: ["git", "git", "git", "git", "git"],
};

const roundedPercentOf = (ratio: number) => roundToOneDecimal(percentOf(ratio));

const prepLadderAt = (gate: number) => ({
	floor: roundedPercentOf(floorAt(gate)),
	ok: roundedPercentOf(okAt(gate)),
	healthy: roundedPercentOf(healthyAt(gate)),
});

const prepPayoutAt =
	(gate: number, configs: readonly Config[], streak: number) =>
	(correct: number) =>
		gateClearPayout(configs, correct, gate, streak);

const prepPeelKbAt = (
	gate: number,
	configs: readonly Config[],
	audits: readonly AuditId[]
) => failPeelQuotaFor(configs, gate, { [gate]: audits }) * PEEL_KB_PER_SLOT;

const prepAuditViewAt = (gate: number, id: AuditId): AuditView => {
	const audit = auditAt(id, gate);
	return {
		id,
		code: audit.code,
		name: audit.name,
		description: audit.description,
		answerCue: audit.answerCue,
		suppressed: false,
	};
};

/** The summit fixture keeps the trio the Champion used to deal, now as three locked incidents. */
export const KANTO_CHAMPION_AUDITS: readonly AuditId[] = [
	"timeout",
	"strip",
	"payload-too-large",
];

const ANSWERED_CATEGORY: CategoryCode = "js";

const answeredPollAt = (index: number, right: boolean): AnsweredPoll => ({
	id: `kanto-answered-${index}`,
	question: `Poll ${index + 1}`,
	category: ANSWERED_CATEGORY,
	outcome: right ? "correct" : "wrong",
	picked: [],
});

const spreadsEvenly = (index: number, right: number, total: number) =>
	Math.floor((index * right) / total) <
	Math.floor(((index + 1) * right) / total);

/** The gates already cleared, holding enough right answers to be worth `coverageHeld`. */
export const kantoAnsweredThrough = (
	gate: number,
	coverageHeld: number
): AnsweredPoll[] => {
	const asked = SLICE_WINDOW * gate;
	if (asked === 0) return [];

	const right = Math.round(ratioOf(coverageHeld) * scoringSlotsAt(gate));

	return Array.from({ length: asked }, (_, index) =>
		answeredPollAt(index, spreadsEvenly(index, right, asked))
	);
};

/** This window's own answers, `right` of `answered` of them correct. */
const kantoWindowAnswers = (
	gate: number,
	answered: number,
	right: number
): AnsweredPoll[] =>
	Array.from({ length: answered }, (_, index) =>
		answeredPollAt(SLICE_WINDOW * gate + index, index < right)
	);

export type KantoPrepFrame = {
	gate: number;
	configs: readonly Config[];
	balanceKb: number;
	coverageHeld: number;
	buildSpace: number;
	window: PrepWindow;
	streak?: number;
	answered?: number;
	windowCorrect?: number;
	/** Defaults to `coverageHeld`, which is right for a window yet to be played. */
	openingHeld?: number;
	/** Incidents rivals locked onto this gate. A gate nobody attacked is clean. */
	audits?: readonly AuditId[];
};

export const kantoPrepAt = ({
	gate,
	configs,
	balanceKb,
	coverageHeld,
	buildSpace,
	window,
	streak = 0,
	answered = 0,
	windowCorrect = 0,
	openingHeld,
	audits = [],
}: KantoPrepFrame): PrepScreenProps =>
	prepPropsFor({
		gate,
		answeredPolls: kantoAnsweredThrough(gate, coverageHeld),
		answeredThisGate: kantoWindowAnswers(gate, answered, windowCorrect),
		configs,
		audits: audits.map((id) => prepAuditViewAt(gate, id)),
		balanceKb,
		buildSpace,
		window,
		bar: { ...prepLadderAt(gate), held: coverageHeld },
		openingHeld: openingHeld ?? coverageHeld,
		coverageGainPercent: coverageGainPercentFor(
			gainPerCorrectFor(configs),
			gate
		),
		peelKb: prepPeelKbAt(gate, configs, audits),
		payout: prepPayoutAt(gate, configs, streak),
	});

export const newRunBuildNote = () =>
	`The first ${numberWord(BASE_SLOTS)} weight is free. Past that the build bills you at every gate close, and the shop rents more room from the Cascade gate on.`;

export const kantoNewRunAt = (
	installedIds: readonly string[],
	balanceKb: number = NEW_RUN_ARCHIVE_KB
): NewRunScreenProps => ({
	header: kantoNewRunHeader(balanceKb),
	build: {
		configs: kantoNewRunBuild(installedIds),
		weight: { held: BASE_SLOTS, perGateKb: upkeepForSpace(BASE_SLOTS) },
		emptyLabel: NEW_RUN_EMPTY_LABEL,
	},
	registry: kantoNewRunRegistry(installedIds, BASE_SLOTS),
	footer: kantoGateZeroFooter(installedIds.length > 0),
	buildNote: newRunBuildNote(),
	registryNote: NEW_RUN_REGISTRY_NOTE,
});

export const createKantoNewRunScreenProps =
	createMockDataFactory<NewRunScreenProps>(kantoNewRunAt([]));

/** The new run registry's note, re-exported: a ui/*.spec may not reach for it. */
export const newRunRegistryNote = NEW_RUN_REGISTRY_NOTE;

/** The prep screen's own ladder, re-exported: a ui/*.spec may not reach for it. */
export const kantoPrepLadder = prepLadderAt;
export const KANTO_PREP_GATE = LAVENDER_GATE;
export const KANTO_PREP_SUMMIT_GATE = VICTORY_GATE;

const LAVENDER_AUDITS: readonly AuditId[] = ["not-found"];

export const kantoPrepSealed = (): PrepScreenProps =>
	kantoPrepAt({
		gate: LAVENDER_GATE,
		configs: LAVENDER_CONFIGS,
		balanceKb: LAVENDER_BALANCE_KB,
		coverageHeld: 0,
		buildSpace: LAVENDER_BUILD_SPACE,
		window: LAVENDER_WINDOW,
		streak: LAVENDER_STREAK,
		audits: LAVENDER_AUDITS,
	});

export const kantoPrepPrefetched = (): PrepScreenProps =>
	kantoPrepAt({
		gate: LAVENDER_GATE,
		configs: [...LAVENDER_CONFIGS, CONFIGS.prefetch],
		balanceKb: LAVENDER_BALANCE_KB,
		coverageHeld: 0,
		buildSpace: LAVENDER_BUILD_SPACE,
		window: LAVENDER_WINDOW,
		streak: LAVENDER_STREAK,
	});

const CHAMPION_BALANCE_KB = 1945;
const CHAMPION_BUILD_SPACE = 16;
const CHAMPION_STREAK = 10;

const CHAMPION_CONFIGS: readonly Config[] = [
	JS_V2,
	CONFIGS.ts,
	CONFIGS.py,
	CONFIGS.eslint,
	TELEMETRY_V2,
	CONFIGS.prefetch,
	CONFIGS.indexedDb,
	CONFIGS.freemium,
	CONFIGS.overclock,
];

const CHAMPION_WINDOW: PrepWindow = {
	answerTypes: { single: 1, multiple: 4 },
	optionCounts: [4, 5, 6, 5, 6],
	categories: ["js", "js", "css", "css", "java"],
	nextCategories: [],
};

export const kantoPrepChampion = (): PrepScreenProps =>
	kantoPrepAt({
		gate: VICTORY_GATE,
		configs: CHAMPION_CONFIGS,
		balanceKb: CHAMPION_BALANCE_KB,
		coverageHeld: 92.5,
		buildSpace: CHAMPION_BUILD_SPACE,
		window: CHAMPION_WINDOW,
		streak: CHAMPION_STREAK,
		answered: 2,
		windowCorrect: 2,
		audits: KANTO_CHAMPION_AUDITS,
	});

const SPENT_NOTE = `today's ${SLICE_WINDOW} polls are spent`;
const SPENT_REFUSAL = "Tomorrow's polls open in 7h 14m.";

export const kantoPrepSpent = (): PrepScreenProps => {
	const props = kantoPrepSealed();

	return {
		...props,
		header: { ...props.header, note: SPENT_NOTE },
		footer: {
			...props.footer,
			action: { label: props.footer.action.label },
			refusal: SPENT_REFUSAL,
		},
	};
};

export const kantoPrepCalibration = (): PrepScreenProps =>
	kantoPrepAt({
		gate: 0,
		configs: [CONFIGS.js, CONFIGS.codeCoverage],
		balanceKb: 0,
		coverageHeld: 0,
		buildSpace: BASE_SLOTS,
		window: LAVENDER_WINDOW,
	});

/** Boulder opened from a thin Pallet: two units of ten read 20%, under the 30% floor. */
export const kantoPrepSecondGate = (): PrepScreenProps =>
	kantoPrepAt({
		gate: 1,
		configs: [CONFIGS.js, CONFIGS.codeCoverage],
		balanceKb: 121,
		coverageHeld: 20,
		buildSpace: BASE_SLOTS,
		window: LAVENDER_WINDOW,
	});

export const kantoPrepFatal = (): PrepScreenProps =>
	kantoPrepAt({
		gate: VICTORY_GATE,
		configs: [JS_V2],
		balanceKb: CHAMPION_BALANCE_KB,
		coverageHeld: 62,
		buildSpace: CHAMPION_BUILD_SPACE,
		window: CHAMPION_WINDOW,
	});
