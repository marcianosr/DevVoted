import type { Config } from "~/modules/run/config/domain/config.model";
import {
	occupiedSlots,
	prefetcherFor,
} from "~/modules/run/build/domain/build.model";
import { billLedger } from "~/modules/run/config/domain/subscription.model";
import type { Audit } from "~/modules/run/gate/domain/audit.model";
import { auditAt, auditsForGate } from "~/modules/run/gate/domain/audit.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";
import {
	AB_ARMS,
	CONFIG_SIZES,
	abArmLabel,
	describeConfig,
	DRAFT_COST_PER_SLOT_KB,
	draftCost,
	headlineFigureOf,
	isUpgradable,
	maxLevelOf,
	sellRefund,
	slotsOf,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { lintCost, peekCost } from "~/modules/run/run/domain/paidAction.model";
import {
	RECOMMENDED_SIZE,
	recommendedPicks,
} from "~/modules/run/config/domain/hand.model";
import { DEFAULT_AUDIT_SCHEDULE } from "~/modules/run/gate/domain/auditSchedule.model";
import {
	BASE_SLOTS,
	MAX_SLOTS,
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	SLICE_WINDOW,
	VICTORY_GATE,
	coverageDemandFor,
	nextSlotPriceKb,
	pinCostFor,
	planBillKb,
	roundToOneDecimal,
	slotCashOutKb,
	storageCapFor,
} from "~/modules/run/run/domain/rules.model";
import {
	MULTIPLE_GAIN,
	SINGLE_GAIN,
	coverageMultiplierOf,
	floorAt,
	gainPerCorrectFor,
	gainPerMissFor,
	gatePayoutKb,
	healthyAt,
	okAt,
	rightsToClear,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	EXTEND_FROM_GATE,
	LOCK_COST_KB,
	MAX_EXTENSIONS,
	extendCost,
	rebuildCost,
} from "~/modules/run/shop/domain/draft.model";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { BuildProps, BuildWeight } from "~/ui/kanto-theme/Build.ui";
import type { BuildFooterProps } from "~/ui/kanto-theme/BuildFooter.ui";
import type {
	ConfigChipBadge,
	ConfigChipProps,
} from "~/ui/kanto-theme/ConfigChip.ui";
import type { ConfigInfoProps } from "~/ui/kanto-theme/ConfigInfo.ui";
import type { RegistryProps } from "~/ui/kanto-theme/Registry.ui";
import type { SlotCash } from "~/ui/kanto-theme/SlotBox.ui";
import type { SlotOfferProps } from "~/ui/kanto-theme/SlotOffer.ui";
import type { SlotTrackFill } from "~/ui/kanto-theme/SlotTrack.ui";
import type { ConfirmFigure } from "~/ui/kanto-theme/Confirm.ui";
import type { PlanChangeProps } from "~/ui/kanto-theme/PlanChange.ui";
import type {
	UpkeepRung,
	WeightTrackFill,
	WeightTrackProps,
} from "~/ui/kanto-theme/WeightTrack.ui";
import type { WeightOfferProps } from "~/ui/kanto-theme/WeightOffer.ui";
import type { RegistryControlProps } from "~/ui/kanto-theme/RegistryControl.ui";
import type { ShopScreenProps } from "~/ui/kanto-theme/ShopScreen.ui";
import type { UninstallProps } from "~/ui/kanto-theme/Uninstall.ui";
import type { UpgradeRung, UpgradesProps } from "~/ui/kanto-theme/Upgrades.ui";
import type { VersionState } from "~/ui/kanto-theme/Version.ui";
import type { HandProps } from "~/ui/kanto-theme/Hand.ui";
import type { HeaderFunds, HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { LedgerFigure, LedgerRow } from "~/ui/kanto-theme/Ledger.ui";
import type {
	BandOutcome,
	BandOutcomesProps,
} from "~/ui/kanto-theme/BandOutcomes.ui";
import type { PrepScreenProps } from "~/ui/kanto-theme/PrepScreen.ui";
import type { NewRunScreenProps } from "~/ui/kanto-theme/NewRunScreen.ui";
import type { ScreenFooterProps } from "~/ui/kanto-theme/ScreenFooter.ui";
import type { PollScreenProps } from "~/ui/kanto-theme/PollScreen.ui";
import type {
	QuestionOption,
	QuestionProps,
} from "~/ui/kanto-theme/Question.ui";
import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";
import type { CoverageRingProps } from "~/ui/kanto-theme/CoverageRing.ui";
import type { TrailProps } from "~/ui/kanto-theme/Trail.ui";

import { createMockDataFactory } from "~/test/createMockDataFactory";
import { gateSwatchAt, trackTo } from "~/test/swatchTrack.factory";

const SAMPLE_GATE = 9;
const GATE_COUNT = 12;
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

export const infoFor = (config: Config, note?: string): ConfigInfoProps => ({
	name: config.label,
	description: describeConfig(config),
	slots: slotsOf(config),
	sellPrice: kbLabel(sellRefund(config)),
	version: config.level ?? 1,
	maxVersion: maxLevelOf(config),
	note,
});

export const configSizes: readonly number[] = CONFIG_SIZES;

export const LINT_USES = 2;
export const PEEK_USES = 2;

const noop = () => {};

const FIRST_VERSION = 1;

const figureLabel = (config: Config): string => {
	const figure = headlineFigureOf(config);
	if (figure === undefined) return "";
	if (figure.kind === "percent") return `+${figure.value}%`;
	if (figure.kind === "multiplier") return `×${figure.value}`;
	return `+${figure.value} KB`;
};

const rungStateFor = (version: number, held: number): VersionState => {
	if (version <= held) return "owned";
	if (version === held + 1) return "offered";
	return "future";
};

export const upgradesFor = (config: Config): UpgradesProps => {
	const held = config.level ?? FIRST_VERSION;
	const max = maxLevelOf(config);

	const rungs: UpgradeRung[] = Array.from({ length: max }, (_, index) => {
		const version = index + 1;
		return {
			version,
			effect: figureLabel({ ...config, level: version }),
			state: rungStateFor(version, held),
			price:
				version <= held ? undefined : kbLabel(upgradeStorageCost(version - 1)),
			held: version === held,
		};
	});

	const toMaxKb = rungs
		.filter((rung) => rung.price !== undefined)
		.reduce((total, rung) => total + upgradeStorageCost(rung.version - 1), 0);

	if (toMaxKb === 0) {
		return { name: config.label, description: config.description, rungs };
	}

	return {
		name: config.label,
		description: config.description,
		rungs,
		toMax: { version: max, price: kbLabel(toMaxKb) },
	};
};

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

const chipFor = (config: Config, note?: string) => ({
	slots: slotsOf(config),
	version: config.level,
	upgrades: isUpgradable(config) ? upgradesFor(config) : undefined,
	info: infoFor(config, note),
});

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

export const fundsOf = (kb: number, label: string): HeaderFunds => {
	const [amount, unit] = kbLabel(kb).split(" ");
	return { amount, unit, label };
};

export const createKantoHeaderProps = createMockDataFactory<HeaderProps>({
	swatch: gateSwatchAt(SAMPLE_GATE),
	gateCount: GATE_COUNT,
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
		counts: { usable: 2, running: 7, offline: 1, changing: 2 },
	});

export const createKantoTrailProps = createMockDataFactory<TrailProps>({
	count: 5,
	current: 4,
	verdicts: ["correct", "partial", "wrong"],
});

export const createKantoQuestionProps = createMockDataFactory<QuestionProps>({
	category: "TypeScript",
	answerType: "single",
	question: "Which utility type makes every property optional?",
	options: kantoPollOptions,
	categoryColor: "cinnabar",
	wrongCost: "0.77",
});

export const KANTO_COVERAGE_HELD = 148;

export const createKantoCoverageRingProps =
	createMockDataFactory<CoverageRingProps>({
		held: KANTO_COVERAGE_HELD,
		demand: coverageDemandFor(SAMPLE_GATE),
		title: `Coverage toward ${gateSwatchAt(SAMPLE_GATE).gateName}`,
		note: "Pick an answer to see where it puts you.",
	});

const AS_PERCENT = 100;

export const KANTO_COVERAGE_BAR_HELD = 70;
export const KANTO_COVERAGE_BAR_NOTE =
	"Coverage starts at zero. Five polls to prove the build again.";

export const createKantoCoverageBarProps =
	createMockDataFactory<CoverageBarProps>({
		held: KANTO_COVERAGE_BAR_HELD,
		floor: floorAt(SAMPLE_GATE) * AS_PERCENT,
		ok: okAt(SAMPLE_GATE) * AS_PERCENT,
		healthy: healthyAt(SAMPLE_GATE) * AS_PERCENT,
		note: KANTO_COVERAGE_BAR_NOTE,
	});

export const createKantoPollScreenProps =
	createMockDataFactory<PollScreenProps>({
		header: createKantoHeaderProps({
			bar: createKantoCoverageBarProps(),
		}),
		buildFooter: createKantoBuildFooterProps(),
		trail: createKantoTrailProps(),
		question: createKantoQuestionProps(),
		audits: kantoAudits,
		hint: "tap any config to open it · press A, B or C to answer",
	});

const SEPARATOR = "·";
export const SHOP_BALANCE_KB = 96;
export const SHOP_CAPACITY_SLOTS = 10;
const UNAFFORDABLE_COLOR = "pewter" as const;

export const offerFor = (
	config: Config,
	balance: number = SHOP_BALANCE_KB
): ConfigChipProps => {
	const price = draftCost(config);
	const label = kbLabel(price);
	const affordable = price <= balance;

	return {
		name: config.label,
		slots: slotsOf(config),
		badges: [
			affordable
				? {
						label,
						hint: `Install ${config.label} ${SEPARATOR} ${label}`,
						onPress: noop,
					}
				: { label, color: UNAFFORDABLE_COLOR },
		],
		skipped: !affordable,
		info: infoFor(config),
	};
};

export const upgradeOfferFor = (config: Config): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	version: config.level,
	badges: [],
	upgrades: { ...upgradesFor(config), onBuy: noop },
	info: infoFor(config),
});

const offersAt = (balance: number): ConfigChipProps[] => [
	offerFor(CONFIGS.intellisense, balance),
	offerFor(CONFIGS.indexedDb, balance),
	upgradeOfferFor({ ...CONFIGS.ts, level: 2 }),
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

export const KANTO_UPKEEP_RUNGS = [
	{ weight: 4, kb: 0 },
	{ weight: 6, kb: 16 },
	{ weight: 8, kb: 32 },
	{ weight: 12, kb: 64 },
	{ weight: 16, kb: 128 },
	{ weight: 24, kb: 256 },
	{ weight: 32, kb: 512 },
] as const satisfies readonly UpkeepRung[];

export const KANTO_WEIGHT_AXIS_MAX = 20;

const BASE_FREE_WEIGHT = 4;

export const kantoUpkeepRungs = (
	freeWeight: number = BASE_FREE_WEIGHT
): UpkeepRung[] =>
	KANTO_UPKEEP_RUNGS.map((rung) => ({
		weight: rung.weight + (freeWeight - BASE_FREE_WEIGHT),
		kb: rung.kb,
	}));

export const kantoWeightFills: readonly WeightTrackFill[] = kantoTrackFills;

export const kantoBuildWeight = usedSlotsOf(kantoShopBuild);

export const createKantoWeightTrackProps =
	createMockDataFactory<WeightTrackProps>({
		fills: kantoWeightFills,
		rungs: KANTO_UPKEEP_RUNGS,
		max: KANTO_WEIGHT_AXIS_MAX,
	});

export const baseSlots = BASE_SLOTS;
export const maxSlots = MAX_SLOTS;

const shortfallOf = (priceKb: number, balanceKb: number) =>
	`${kbLabel(priceKb - balanceKb)} short`;

export const slotDealsAt = (
	capacity: number = SHOP_CAPACITY_SLOTS,
	balance: number = SHOP_BALANCE_KB
): { cash?: SlotCash; offer?: SlotOfferProps } => {
	const priceKb = nextSlotPriceKb(capacity - BASE_SLOTS);
	const refundKb = slotCashOutKb(capacity);
	const affordable = priceKb !== undefined && priceKb <= balance;

	return {
		cash:
			refundKb === undefined
				? undefined
				: { refund: signedKbLabel(refundKb), onPress: noop },
		offer:
			priceKb === undefined
				? undefined
				: {
						slot: capacity + 1,
						price: kbLabel(priceKb),
						refusal: affordable ? undefined : shortfallOf(priceKb, balance),
						onPress: affordable ? noop : undefined,
					},
	};
};

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

export const LOCK_NOTE = "locking offers needs yarn.lock in the build";

export const kantoShopHeaderAt = (
	cleared: number = SAMPLE_GATE,
	balance: number = SHOP_BALANCE_KB
): HeaderProps => {
	const next = gateSwatchAt(cleared + 1);

	return {
		swatch: gateSwatchAt(cleared),
		gateCount: GATE_COUNT,
		swatches: trackTo(cleared + 1),
		funds: fundsOf(balance, BALANCE_WORD),
		title: `Shop ${SEPARATOR} cleared ${gateSwatchAt(cleared).gateName}`,
		note: `next gate ${next.gate} ${SEPARATOR} ${next.gateName} ${SEPARATOR} to pass ${coverageDemandFor(next.gate)}%`,
	};
};

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
	controls: kantoRegistryControls,
	note: LOCK_NOTE,
});

export const KANTO_PLAN_TIER = 0;
export const KANTO_PLAN_PEAK_KB = 1024;
export const KANTO_PLAN_BALANCE_KB = 512;

export const KANTO_WEIGHT_PLANS = [
	{ free: 4, priceKb: 0 },
	{ free: 8, priceKb: 256 },
	{ free: 12, priceKb: 768 },
	{ free: 16, priceKb: 2048 },
] as const;

export const storagePlanCount = KANTO_WEIGHT_PLANS.length;

const planRefusalOf = (priceKb: number, balanceKb: number) =>
	priceKb <= balanceKb ? undefined : shortfallOf(priceKb, balanceKb);

const pursedLabel = (kb: number, purse?: string) =>
	purse === undefined ? kbLabel(kb) : `${kbLabel(kb)} ${purse}`;

export const freeWeightAt = (heldTier: number = KANTO_PLAN_TIER): number =>
	KANTO_WEIGHT_PLANS[Math.min(heldTier, storagePlanCount - 1)].free;

export const kantoWeightOffers = (
	heldTier: number = KANTO_PLAN_TIER,
	peakKb: number = KANTO_PLAN_PEAK_KB,
	balanceKb: number = KANTO_PLAN_BALANCE_KB,
	purse?: string
): WeightOfferProps[] =>
	KANTO_WEIGHT_PLANS.slice(heldTier + 1).flatMap(
		(plan, above): WeightOfferProps[] => {
			if (peakKb < plan.priceKb)
				return [
					{
						to: plan.free,
						opensAt: `opens once a run has held ${kbLabel(plan.priceKb)}`,
					},
				];
			if (above > 0) return [];

			const refusal = planRefusalOf(plan.priceKb, balanceKb);
			return [
				{
					from: freeWeightAt(heldTier),
					to: plan.free,
					price: pursedLabel(plan.priceKb, purse),
					refusal,
					onPress: refusal === undefined ? noop : undefined,
				},
			];
		}
	);

const AXIS_HEADROOM = 12;

export const kantoShopWeight = (
	heldTier: number = KANTO_PLAN_TIER,
	peakKb: number = KANTO_PLAN_PEAK_KB,
	balanceKb: number = KANTO_PLAN_BALANCE_KB,
	purse?: string
): BuildWeight => ({
	rungs: kantoUpkeepRungs(freeWeightAt(heldTier)),
	max: Math.max(KANTO_WEIGHT_AXIS_MAX, freeWeightAt(heldTier) + AXIS_HEADROOM),
	offers: kantoWeightOffers(heldTier, peakKb, balanceKb, purse),
});

export const planChangeFor = (
	fromTier: number,
	toTier: number,
	balanceKb: number
): PlanChangeProps => {
	const from = freeWeightAt(fromTier);
	const to = freeWeightAt(toTier);
	const priceKb =
		KANTO_WEIGHT_PLANS[Math.min(toTier, storagePlanCount - 1)].priceKb;

	return {
		weight: String(to),
		prose:
			"Bought once, and it lasts the run. Every upkeep rung moves up with it, so the weight you already carry gets cheaper.",
		figures: [
			{ label: "free weight", value: `${from} → ${to}` },
			{ label: "costs", value: kbLabel(priceKb), color: "cinnabar" as const },
			{ label: "you hold", value: kbLabel(balanceKb) },
		] satisfies ConfirmFigure[],
		onConfirm: noop,
		onCancel: noop,
	};
};

export const SHOP_PLAN_TIER = 0;
export const SHOP_PLAN_PEAK_KB = 1024;

export const createKantoShopScreenProps =
	createMockDataFactory<ShopScreenProps>({
		header: kantoShopHeaderAt(),
		build: {
			configs: kantoShopBuild,
			weight: kantoShopWeight(SHOP_PLAN_TIER, SHOP_PLAN_PEAK_KB),
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

const inertOffer = (offer: WeightOfferProps): WeightOfferProps =>
	offer.opensAt === undefined ? { ...offer, onPress: undefined } : offer;

const inertChip = (chip: ConfigChipProps): ConfigChipProps => {
	const open = openChip(chip);
	return {
		...open,
		badges: open.badges.map(inertBadge),
		onUninstall: undefined,
		upgrades:
			open.upgrades === undefined
				? undefined
				: { ...open.upgrades, onBuy: undefined },
	};
};

export const kantoClosedShopProps = (): ShopScreenProps => {
	const weight = kantoShopWeight(SHOP_PLAN_TIER, SHOP_PLAN_PEAK_KB);

	return {
		header: kantoShopHeaderAt(),
		audits: [kantoClosedShopAudit],
		build: {
			configs: kantoShopBuild.map(inertChip),
			weight: { ...weight, offers: (weight.offers ?? []).map(inertOffer) },
		},
		registry: {
			offers: kantoRegistryOffers.map(inertChip),
			slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
			controls: kantoShopControlsAt().map((control) => ({
				...control,
				disabled: true,
			})),
			note: LOCK_NOTE,
		},
	};
};

export const FIRST_SHOP_BALANCE_KB = 64;

export const kantoFirstShopProps = (): ShopScreenProps => ({
	header: kantoShopHeaderAt(0, FIRST_SHOP_BALANCE_KB),
	build: {
		configs: [],
		weight: kantoShopWeight(0, 0, FIRST_SHOP_BALANCE_KB),
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
		controls: kantoShopControlsAt(0, FIRST_SHOP_BALANCE_KB),
		note: LOCK_NOTE,
	},
});

export const TAG_SHOP_BALANCE_KB = 160;

export const kantoTagShopProps = (): ShopScreenProps => ({
	header: kantoShopHeaderAt(4, TAG_SHOP_BALANCE_KB),
	build: {
		configs: kantoShopBuild,
		weight: kantoShopWeight(1, 512, TAG_SHOP_BALANCE_KB),
	},
	registry: {
		offers: offersAt(TAG_SHOP_BALANCE_KB),
		slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
		controls: kantoShopControlsAt(4, TAG_SHOP_BALANCE_KB),
		note: LOCK_NOTE,
	},
});

export const LATE_SHOP_BALANCE_KB = 704;

export const kantoLateShopProps = (): ShopScreenProps => ({
	header: kantoShopHeaderAt(11, LATE_SHOP_BALANCE_KB),
	build: {
		configs: kantoShopBuild,
		weight: kantoShopWeight(2, 3072, LATE_SHOP_BALANCE_KB),
	},
	registry: {
		offers: [
			...offersAt(LATE_SHOP_BALANCE_KB),
			offerFor(CONFIGS.cache, LATE_SHOP_BALANCE_KB),
			offerFor(CONFIGS.agentsMd, LATE_SHOP_BALANCE_KB),
		],
		slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
		controls: kantoShopControlsAt(11, LATE_SHOP_BALANCE_KB, MAX_EXTENSIONS),
		note: LOCK_NOTE,
	},
});

export const NEW_RUN_ARCHIVE_KB = 512;
const START_GATE = 0;
const RUN_GATE_COUNT = VICTORY_GATE + 1;

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

const capitalised = (word: string) =>
	`${word.charAt(0).toUpperCase()}${word.slice(1)}`;

const RUN_SHAPE_NOTE = `${numberWord(RUN_GATE_COUNT)} gates, one a day — today's ${numberWord(SLICE_WINDOW)} polls are waiting`;

export const NEW_RUN_HAND_NOTE = `The hand costs no storage, only room. ${capitalised(numberWord(RECOMMENDED_SIZE))} are marked as advice; nothing is required, and the smallest three always fit together.`;

export const NEW_RUN_EMPTY_LABEL = "nothing installed yet";
export const SUGGESTED_LABEL = "suggested";
const SUGGESTED_COLOR = "cerulean" as const;
const ARCHIVE_WORD = "archive";

export const kantoNewRunHeader = (
	archiveKb: number = NEW_RUN_ARCHIVE_KB
): HeaderProps => ({
	swatch: gateSwatchAt(START_GATE),
	gateCount: RUN_GATE_COUNT,
	swatches: trackTo(START_GATE),
	funds: fundsOf(archiveKb, ARCHIVE_WORD),
	title: "New run",
	subtitle: `gate ${START_GATE} ${SEPARATOR} ${gateSwatchAt(START_GATE).gateName}`,
	note: RUN_SHAPE_NOTE,
	noteAt: "track",
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

export const handCardsLeft = (cards: readonly ConfigChipProps[]): number =>
	cards.filter((card) => card.locked !== true && card.install !== undefined)
		.length;

export const kantoHandProps = (
	installedIds: readonly string[] = [],
	capacity: number = BASE_SLOTS,
	suggested = true
): HandProps => {
	const cards = kantoHandCards(installedIds, capacity, suggested);
	return { cards, left: handCardsLeft(cards), note: NEW_RUN_HAND_NOTE };
};

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

export const kantoGateZeroFooter = (canStart = false): ScreenFooterProps => ({
	action: {
		label: `start gate ${START_GATE}`,
		icon: "gate",
		onPress: canStart ? noop : undefined,
	},
});

const AUDITS_TITLE = "Audits";

const SUMMIT_LINE = "the summit — nothing after this";
const SEALED: LedgerFigure = { locked: true };

export const PREP_COMMUNITY_LABEL = "Community";
const START_LEAD = "Start";

export const PREP_OUTCOMES_TITLE = "Where you finish decides everything";
export const PREP_TAKES_TITLE = "What it takes";
export const PREP_POLLS_TITLE = "The five polls";
const PREP_CAPTION =
	"Coverage starts at zero. Five polls to prove the build again, and the check fires once when the gate shuts.";
const PREP_POLLS_NOTE =
	"Categories matter more than usual now: a matching config pays ×1.25 on top of your build.";
export const PREP_LOCK_NOTE = "Starting locks this build for the window.";
const RIGHT_ANSWER_LABEL = "Each right answer";
const WRONG_ANSWER_LABEL = "Each wrong answer";
const PAYS_NOTHING = "Nothing";
const BELOW_FULL = AS_PERCENT - 1;
const RANGE_DASH = "–";
const BILL_LEAD = "bills";
const BILL_TRAIL = "on a clear";
const NO_AUDITS = "none this gate";
const AUDIT_COUNT_TRAIL = "this gate";

const categoryTally = (codes: readonly CategoryCode[]): LedgerFigure[] => {
	const counts = codes.reduce<Map<CategoryCode, number>>(
		(tally, code) => tally.set(code, (tally.get(code) ?? 0) + 1),
		new Map()
	);

	return [...counts.entries()]
		.sort(([, one], [, other]) => other - one)
		.map(([code, count]) => ({
			label: `${CATEGORY_METADATA[code].name.toLowerCase()} ${count}`,
		}));
};

const answerTypeFigures = (split: {
	single: number;
	multiple: number;
}): LedgerFigure[] =>
	[
		{ label: `${split.single} single`, count: split.single },
		{ label: `${split.multiple} multiple`, count: split.multiple },
	]
		.filter((figure) => figure.count > 0)
		.map(({ label }) => ({ label }));

const percentOf = (ratio: number) => roundToOneDecimal(ratio * AS_PERCENT);

const spanLabel = (low: number, high: number, unit: string) =>
	`${low} ${RANGE_DASH} ${high}${unit}`;

const signedSpan = (low: number, high: number, sign: string) =>
	`${sign}${percentOf(low)} ${RANGE_DASH} ${percentOf(high)}%`;

const nextGateLine = (gate: number, gateName: string) =>
	swatchForGate(gate + 1) === undefined
		? `The ${gateName} swatch is yours and the run is won.`
		: `The ${gateName} swatch is yours and gate ${gate + 1} opens tomorrow.`;

const outcomesFor = (
	gate: number,
	gateName: string,
	weight: number,
	streak: number
): BandOutcome[] => {
	const healthy = percentOf(healthyAt(gate));
	const ok = percentOf(okAt(gate));
	const floor = percentOf(floorAt(gate));
	const kb = (held: number) =>
		gatePayoutKb(held / AS_PERCENT, gate, weight, streak);
	const pays = (low: number, high: number) =>
		`${kbLabel(kb(low))} ${RANGE_DASH} ${kbLabel(kb(high))}`;

	return [
		{
			band: "perfect",
			range: `${AS_PERCENT}%`,
			outcome: `The bar is full. ${nextGateLine(gate, gateName)} The gate pays a bonus on top.`,
			pays: kbLabel(kb(AS_PERCENT)),
		},
		{
			band: "healthy",
			range: spanLabel(healthy, BELOW_FULL, "%"),
			outcome: `Gate cleared. ${nextGateLine(gate, gateName)}`,
			pays: pays(healthy, BELOW_FULL),
		},
		...(ok > healthy - 1
			? []
			: [
					{
						band: "ok" as const,
						range: spanLabel(ok, healthy - 1, "%"),
						outcome: `You survive and get paid, but the gate stays shut. ${gateName} runs again on five fresh polls.`,
						pays: pays(ok, healthy - 1),
					},
				]),
		...(floor > ok - 1
			? []
			: [
					{
						band: "shaky" as const,
						range: spanLabel(floor, ok - 1, "%"),
						outcome:
							"Still alive, barely. Same gate again, on a broken streak and a thin balance.",
						pays: pays(floor, ok - 1),
					},
				]),
		...(floor <= 0
			? []
			: [
					{
						band: "danger" as const,
						range: `under ${floor}%`,
						outcome:
							"The run ends the moment the gate shuts. No retry, no peel.",
						pays: PAYS_NOTHING,
					},
				]),
	];
};

export const NEW_RUN_OUTCOMES_TITLE = "Objectives and rewards";
const NEW_RUN_PEAK_KB = 512;
const NEW_RUN_STREAK = 0;
const UNREACHABLE_NOTE = "No run of five polls reaches the line on this build.";

const newRunPeakKb = (archiveKb: number) =>
	Math.max(NEW_RUN_PEAK_KB, archiveKb);

export const newRunBuildNote = (heldTier: number = KANTO_PLAN_TIER) =>
	`The first ${numberWord(freeWeightAt(heldTier))} weight is free. Past that the build bills you at every gate close, and the ${ARCHIVE_WORD} buys the free line up before you start.`;

const installedConfigsIn = (installedIds: readonly string[]): Config[] =>
	NEW_RUN_HAND.filter((config) => installedIds.includes(config.id));

const reachNoteFor = (configs: readonly Config[]) => {
	const rights = rightsToClear(START_GATE, SLICE_WINDOW, configs);
	if (rights === undefined) return UNREACHABLE_NOTE;

	const polls = rights === 1 ? "poll reaches" : "polls reach";
	return `${capitalised(numberWord(rights))} correct ${polls} the line.`;
};

export const kantoNewRunOutcomes = (
	installedIds: readonly string[] = []
): BandOutcomesProps => {
	const configs = installedConfigsIn(installedIds);
	const weight = configs.reduce((total, config) => total + slotsOf(config), 0);

	return {
		title: NEW_RUN_OUTCOMES_TITLE,
		bar: {
			held: 0,
			floor: percentOf(floorAt(START_GATE)),
			ok: percentOf(okAt(START_GATE)),
			healthy: percentOf(healthyAt(START_GATE)),
			note: reachNoteFor(configs),
		},
		outcomes: outcomesFor(
			START_GATE,
			gateSwatchAt(START_GATE).gateName,
			weight,
			NEW_RUN_STREAK
		),
	};
};

const newRunWeight = (heldTier: number, archiveKb: number) =>
	kantoShopWeight(heldTier, newRunPeakKb(archiveKb), archiveKb, ARCHIVE_WORD);

export const kantoNewRunAt = (
	installedIds: readonly string[],
	heldTier = KANTO_PLAN_TIER,
	archiveKb: number = NEW_RUN_ARCHIVE_KB
): NewRunScreenProps => ({
	header: kantoNewRunHeader(archiveKb),
	build: {
		configs: kantoNewRunBuild(installedIds),
		weight: newRunWeight(heldTier, archiveKb),
		emptyLabel: NEW_RUN_EMPTY_LABEL,
	},
	hand: kantoHandProps(installedIds, freeWeightAt(heldTier)),
	outcomes: kantoNewRunOutcomes(installedIds),
	footer: kantoGateZeroFooter(installedIds.length > 0),
	buildNote: newRunBuildNote(heldTier),
});

export const createKantoNewRunScreenProps =
	createMockDataFactory<NewRunScreenProps>(kantoNewRunAt([]));

const takesRowsFor = (
	gate: number,
	configs: readonly Config[]
): LedgerRow[] => [
	{
		label: RIGHT_ANSWER_LABEL,
		tags: [
			{
				label: signedSpan(
					gainPerCorrectFor(configs, undefined, "single"),
					gainPerCorrectFor(configs, undefined, "multiple"),
					"+"
				),
				color: "viridian",
			},
		],
		detail: `${percentOf(SINGLE_GAIN)}${RANGE_DASH}${percentOf(MULTIPLE_GAIN)} base × ${coverageMultiplierOf(configs)} build`,
	},
	{
		label: WRONG_ANSWER_LABEL,
		figures: [
			{
				label: signedSpan(
					gainPerMissFor(gate, configs, undefined, "single"),
					gainPerMissFor(gate, configs, undefined, "multiple"),
					"−"
				),
				color: "cinnabar",
			},
		],
	},
];

export type PrepWindow = {
	answerTypes: { single: number; multiple: number };
	optionCounts: readonly number[];
	categories: readonly CategoryCode[];
	nextCategories: readonly CategoryCode[];
};

const pollRowsFor = (
	gate: number,
	window: PrepWindow,
	revealed: boolean
): LedgerRow[] => {
	if (!revealed) {
		return [
			{ label: "answer types", figures: [SEALED] },
			{ label: "options each", figures: [SEALED] },
			{
				label: "categories",
				figures: window.categories.map(() => SEALED),
			},
		];
	}

	const summit = swatchForGate(gate + 1) === undefined;

	return [
		{ label: "answer types", figures: answerTypeFigures(window.answerTypes) },
		{
			label: "options each",
			figures: window.optionCounts.map((count) => ({ label: `${count}` })),
		},
		{ label: "categories", figures: categoryTally(window.categories) },
		{
			label: "next gate",
			figures: summit
				? [{ label: SUMMIT_LINE, tone: "quiet" }]
				: categoryTally(window.nextCategories),
		},
	];
};

const auditPropsFor = (audit: Audit): AuditProps => ({
	code: audit.code,
	name: audit.name,
	cue: audit.answerCue ?? audit.description,
});

const auditsMetaOf = (count: number) =>
	count === 0 ? NO_AUDITS : `${count} ${AUDIT_COUNT_TRAIL}`;

const auditBillFor = (
	configs: readonly Config[],
	gate: number,
	storageKb: number,
	planTier: number
): { bill?: string; note?: string } => {
	const ledger = billLedger({
		configs,
		gate,
		storageKb,
		planCapKb: storageCapFor(planTier),
		planBillKb: planBillKb(planTier),
	});

	if (ledger.totalKb === 0) return {};

	return {
		bill: `${BILL_LEAD} ${signedKbLabel(-ledger.totalKb)} ${BILL_TRAIL}`,
		note:
			ledger.shortfallKb === 0
				? undefined
				: `${kbLabel(ledger.shortfallKb)} short — what you cannot pay lapses.`,
	};
};

export type PrepFrame = {
	gate: number;
	configs: readonly Config[];
	balanceKb: number;
	coverageHeld: number;
	planTier: number;
	window: PrepWindow;
	streak?: number;
	answered?: number;
};

export const kantoPrepAt = ({
	gate,
	configs,
	balanceKb,
	coverageHeld,
	planTier,
	window,
	streak = 0,
	answered = 0,
}: PrepFrame): PrepScreenProps => {
	const swatch = gateSwatchAt(gate);
	const audits = auditsForGate(gate, DEFAULT_AUDIT_SCHEDULE);
	const weight = occupiedSlots(configs);
	const prefetcher = prefetcherFor(configs);

	return {
		header: {
			swatch,
			gateCount: RUN_GATE_COUNT,
			swatches: trackTo(gate),
			funds: fundsOf(balanceKb, BALANCE_WORD),
			swatchState: "current",
			badge:
				audits.length === 0
					? undefined
					: `${audits.length} ${audits.length === 1 ? "audit" : "audits"}`,
			note:
				answered === 0
					? `today's ${SLICE_WINDOW} polls are ready`
					: `${answered} of ${SLICE_WINDOW} answered`,
			noteAt: "track",
			bar: {
				held: coverageHeld,
				floor: percentOf(floorAt(gate)),
				ok: percentOf(okAt(gate)),
				healthy: percentOf(healthyAt(gate)),
				marks: "bands",
				note: PREP_CAPTION,
			},
		},
		outcomes: {
			title: PREP_OUTCOMES_TITLE,
			outcomes: outcomesFor(gate, swatch.gateName, weight, streak),
		},
		takes: {
			title: PREP_TAKES_TITLE,
			rows: takesRowsFor(gate, configs),
		},
		polls: {
			title: PREP_POLLS_TITLE,
			badge: prefetcher?.label,
			rows: pollRowsFor(gate, window, prefetcher !== undefined),
			note: PREP_POLLS_NOTE,
		},
		audits: {
			title: AUDITS_TITLE,
			meta: auditsMetaOf(audits.length),
			...auditBillFor(configs, gate, balanceKb, planTier),
			alerts: audits.map(auditPropsFor),
		},
		footer: {
			aside: {
				label: PREP_COMMUNITY_LABEL,
				icon: "community",
				onPress: noop,
			},
			action: {
				label: `${START_LEAD} ${swatch.gateName}`,
				icon: "gate",
				onPress: noop,
			},
			note: PREP_LOCK_NOTE,
			noteAt: "row",
		},
	};
};

const LAVENDER_GATE = 4;
const LAVENDER_BALANCE_KB = 102;
const LAVENDER_PLAN_TIER = 1;
const LAVENDER_STREAK = 6;

const JS_V2 = { ...CONFIGS.js, level: 2 };
const TELEMETRY_V2 = { ...CONFIGS.telemetry, level: 2 };

const LAVENDER_CONFIGS: readonly Config[] = [
	JS_V2,
	CONFIGS.eslint,
	CONFIGS.deprecated,
	CONFIGS.ts,
];

const LAVENDER_WINDOW: PrepWindow = {
	answerTypes: { single: 1, multiple: 4 },
	optionCounts: [4, 4, 5, 6, 4],
	categories: ["ts", "ts", "ts", "js", "js"],
	nextCategories: ["git", "git", "git", "git", "git"],
};

export const kantoPrepSealed = (): PrepScreenProps =>
	kantoPrepAt({
		gate: LAVENDER_GATE,
		configs: LAVENDER_CONFIGS,
		balanceKb: LAVENDER_BALANCE_KB,
		coverageHeld: 0,
		planTier: LAVENDER_PLAN_TIER,
		window: LAVENDER_WINDOW,
		streak: LAVENDER_STREAK,
	});

export const kantoPrepPrefetched = (): PrepScreenProps =>
	kantoPrepAt({
		gate: LAVENDER_GATE,
		configs: [...LAVENDER_CONFIGS, CONFIGS.prefetch],
		balanceKb: LAVENDER_BALANCE_KB,
		coverageHeld: 0,
		planTier: LAVENDER_PLAN_TIER,
		window: LAVENDER_WINDOW,
		streak: LAVENDER_STREAK,
	});

const CHAMPION_BALANCE_KB = 1945;
const CHAMPION_PLAN_TIER = 3;
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
		planTier: CHAMPION_PLAN_TIER,
		window: CHAMPION_WINDOW,
		streak: CHAMPION_STREAK,
		answered: 2,
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
		planTier: 0,
		window: LAVENDER_WINDOW,
	});

export const kantoPrepFatal = (): PrepScreenProps =>
	kantoPrepAt({
		gate: VICTORY_GATE,
		configs: [JS_V2],
		balanceKb: CHAMPION_BALANCE_KB,
		coverageHeld: 62,
		planTier: CHAMPION_PLAN_TIER,
		window: CHAMPION_WINDOW,
	});
