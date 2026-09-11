import type { Config } from "~/modules/run/config/domain/config.model";
import {
	gateClearPayout,
	occupiedSlots,
	prefetcherFor,
} from "~/modules/run/build/domain/build.model";
import { billLedger } from "~/modules/run/config/domain/subscription.model";
import type { Audit } from "~/modules/run/gate/domain/audit.model";
import { auditAt, auditsForGate } from "~/modules/run/gate/domain/audit.model";
import {
	failPeelQuotaFor,
	peelConfigRangeFor,
} from "~/modules/run/gate/domain/gate.model";
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
import {
	DEFAULT_AUDIT_SCHEDULE,
	INTRO_GATE,
} from "~/modules/run/gate/domain/auditSchedule.model";
import {
	BASE_SLOTS,
	GATE_REWARD_KB,
	MAX_SLOTS,
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	SLICE_WINDOW,
	STORAGE_PLANS,
	VICTORY_GATE,
	coverageDemandFor,
	failPeelShareFor,
	nextSlotPriceKb,
	pinCostFor,
	isPeelFatal,
	planBillKb,
	revealsPlanTier,
	roundToOneDecimal,
	slotCashOutKb,
	storageCapFor,
} from "~/modules/run/run/domain/rules.model";
import { START_SLOT_PREMIUM } from "~/modules/run/run/domain/startSlot.model";
import {
	EXTEND_FROM_GATE,
	LOCK_COST_KB,
	MAX_EXTENSIONS,
	extendCost,
	rebuildCost,
} from "~/modules/run/shop/domain/draft.model";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { BuildProps } from "~/ui/kanto-theme/Build.ui";
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
import type { StorageRung } from "~/ui/kanto-theme/StoragePlan.ui";
import type { RegistryControlProps } from "~/ui/kanto-theme/RegistryControl.ui";
import type { ShopPlan, ShopScreenProps } from "~/ui/kanto-theme/ShopScreen.ui";
import type { UninstallProps } from "~/ui/kanto-theme/Uninstall.ui";
import type { UpgradeRung, UpgradesProps } from "~/ui/kanto-theme/Upgrades.ui";
import type { VersionState } from "~/ui/kanto-theme/Version.ui";
import type { HandProps } from "~/ui/kanto-theme/Hand.ui";
import type { HeaderFunds, HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { LedgerFigure, LedgerRow } from "~/ui/kanto-theme/Ledger.ui";
import type { PrepScreenProps } from "~/ui/kanto-theme/PrepScreen.ui";
import type { NewRunScreenProps } from "~/ui/kanto-theme/NewRunScreen.ui";
import type {
	ScreenFooterProps,
	StakeFigure,
} from "~/ui/kanto-theme/ScreenFooter.ui";
import type { PollScreenProps } from "~/ui/kanto-theme/PollScreen.ui";
import type {
	QuestionOption,
	QuestionProps,
} from "~/ui/kanto-theme/Question.ui";
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

export const createKantoPollScreenProps =
	createMockDataFactory<PollScreenProps>({
		header: createKantoHeaderProps({
			ring: createKantoCoverageRingProps({
				title: undefined,
				note: undefined,
			}),
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

export const KANTO_PLAN_TIER = 2;
export const KANTO_PLAN_PEAK_KB = 1024;
export const KANTO_PLAN_BALANCE_KB = 512;

const planRefusalOf = (tier: number, heldTier: number, balanceKb: number) => {
	const billKb = planBillKb(tier);
	if (tier <= heldTier || billKb <= balanceKb) return undefined;
	return `bills ${kbLabel(billKb)} a gate, you hold ${kbLabel(balanceKb)}`;
};

const billOf = (tier: number) => {
	const billKb = planBillKb(tier);
	return billKb === 0 ? undefined : `${kbLabel(billKb)} a gate`;
};

export const kantoStorageRungs = (
	heldTier: number = KANTO_PLAN_TIER,
	peakKb: number = KANTO_PLAN_PEAK_KB,
	balanceKb: number = KANTO_PLAN_BALANCE_KB
): StorageRung[] =>
	STORAGE_PLANS.map((plan) => {
		const revealed = revealsPlanTier(plan.tier, peakKb);
		const refusal = planRefusalOf(plan.tier, heldTier, balanceKb);

		return {
			cap: kbLabel(plan.capKb),
			bill: billOf(plan.tier),
			held: plan.tier === heldTier,
			revealed,
			refusal,
			opensAt: revealed
				? undefined
				: `opens once a run has held ${kbLabel(storageCapFor(plan.tier - 1))}`,
			onPress: plan.tier === heldTier ? undefined : noop,
		};
	});

const ZERO_KB = "0 KB";

export const planChangeFor = (
	fromTier: number,
	toTier: number,
	storageKb: number
): PlanChangeProps => {
	const toCapKb = storageCapFor(toTier);
	const burnKb = Math.max(0, storageKb - toCapKb);

	return {
		direction: toTier > fromTier ? "upgrade" : "downgrade",
		cap: kbLabel(toCapKb),
		prose:
			toTier > fromTier
				? "Renting a wider cap takes effect now. The bill lands on every clear from here."
				: "Dropping a rung takes effect now. Anything over the new cap is burnt immediately.",
		figures: [
			{
				label: "cap",
				value: `${kbLabel(storageCapFor(fromTier))} → ${kbLabel(toCapKb)}`,
			},
			{
				label: "bill a gate",
				value: `${kbLabel(planBillKb(fromTier))} → ${kbLabel(planBillKb(toTier))}`,
			},
			{
				label: "burnt now",
				value: burnKb === 0 ? ZERO_KB : kbLabel(burnKb),
				...(burnKb === 0 ? {} : { color: "cinnabar" as const }),
			},
		] satisfies ConfirmFigure[],
		onConfirm: noop,
		onCancel: noop,
	};
};

export const storagePlanCount = STORAGE_PLANS.length;

export const SHOP_PLAN_TIER = 3;
export const SHOP_PLAN_PEAK_KB = 1024;

export const kantoShopPlan = (
	heldTier: number = SHOP_PLAN_TIER,
	peakKb: number = SHOP_PLAN_PEAK_KB,
	balanceKb: number = SHOP_BALANCE_KB
): ShopPlan => {
	const billKb = planBillKb(heldTier);

	return {
		bill: billKb === 0 ? ZERO_KB : kbLabel(billKb),
		rungs: kantoStorageRungs(heldTier, peakKb, balanceKb),
	};
};

export const createKantoShopScreenProps =
	createMockDataFactory<ShopScreenProps>({
		header: kantoShopHeaderAt(),
		build: {
			configs: kantoShopBuild,
			slots: {
				used: usedSlotsOf(kantoShopBuild),
				capacity: SHOP_CAPACITY_SLOTS,
			},
			...slotDealsAt(),
		},
		registry: createKantoRegistryProps(),
		plan: kantoShopPlan(),
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
		upgrades:
			open.upgrades === undefined
				? undefined
				: { ...open.upgrades, onBuy: undefined },
	};
};

export const kantoClosedShopProps = (): ShopScreenProps => {
	const deals = slotDealsAt();
	const plan = kantoShopPlan();

	return {
		header: kantoShopHeaderAt(),
		audits: [kantoClosedShopAudit],
		build: {
			configs: kantoShopBuild.map(inertChip),
			slots: {
				used: usedSlotsOf(kantoShopBuild),
				capacity: SHOP_CAPACITY_SLOTS,
			},
			cash:
				deals.cash === undefined
					? undefined
					: { ...deals.cash, onPress: undefined },
			offer:
				deals.offer === undefined
					? undefined
					: { ...deals.offer, onPress: undefined },
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
		plan: {
			...plan,
			rungs: plan.rungs.map((rung) => ({ ...rung, onPress: undefined })),
		},
	};
};

export const FIRST_SHOP_BALANCE_KB = 64;

export const kantoFirstShopProps = (): ShopScreenProps => ({
	header: kantoShopHeaderAt(0, FIRST_SHOP_BALANCE_KB),
	build: {
		configs: [],
		slots: { used: 0, capacity: BASE_SLOTS },
		...slotDealsAt(BASE_SLOTS, FIRST_SHOP_BALANCE_KB),
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
	plan: kantoShopPlan(0, 0, FIRST_SHOP_BALANCE_KB),
});

export const TAG_SHOP_BALANCE_KB = 160;

export const kantoTagShopProps = (): ShopScreenProps => ({
	header: kantoShopHeaderAt(4, TAG_SHOP_BALANCE_KB),
	build: {
		configs: kantoShopBuild,
		slots: { used: usedSlotsOf(kantoShopBuild), capacity: SHOP_CAPACITY_SLOTS },
		...slotDealsAt(SHOP_CAPACITY_SLOTS, TAG_SHOP_BALANCE_KB),
	},
	registry: {
		offers: offersAt(TAG_SHOP_BALANCE_KB),
		slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
		controls: kantoShopControlsAt(4, TAG_SHOP_BALANCE_KB),
		note: LOCK_NOTE,
	},
	plan: kantoShopPlan(1, 512, TAG_SHOP_BALANCE_KB),
});

export const LATE_SHOP_BALANCE_KB = 704;
const LATE_SHOP_CAPACITY_SLOTS = 11;

export const kantoLateShopProps = (): ShopScreenProps => ({
	header: kantoShopHeaderAt(11, LATE_SHOP_BALANCE_KB),
	build: {
		configs: kantoShopBuild,
		slots: {
			used: usedSlotsOf(kantoShopBuild),
			capacity: LATE_SHOP_CAPACITY_SLOTS,
		},
		...slotDealsAt(LATE_SHOP_CAPACITY_SLOTS, LATE_SHOP_BALANCE_KB),
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
	plan: kantoShopPlan(4, 3072, LATE_SHOP_BALANCE_KB),
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

export const NEW_RUN_BUILD_NOTE =
	"Four slots are free. Anything wider is opened from the archive, and hands back in full until you start.";

export const NEW_RUN_HAND_NOTE = `The hand costs no storage, only room. ${capitalised(numberWord(RECOMMENDED_SIZE))} are marked as advice; nothing is required, and the smallest three always fit together.`;

export const NEW_RUN_EMPTY_LABEL = "nothing installed yet";
export const NEW_RUN_RESTING = "pick one config and you can play";
export const SUGGESTED_LABEL = "suggested";
const SUGGESTED_COLOR = "cerulean" as const;
const ARCHIVE_WORD = "archive";
const OPEN_VERB = "open";

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

const archivePriceKb = (slotsBought: number) => {
	const rung = nextSlotPriceKb(slotsBought);
	return rung === undefined ? undefined : rung * START_SLOT_PREMIUM;
};

const archiveLabel = (kb: number) => `${kbLabel(kb)} ${ARCHIVE_WORD}`;

export const newRunSlotDealsAt = (
	slotsBought = 0,
	archiveKb: number = NEW_RUN_ARCHIVE_KB
): { cash?: SlotCash; offer?: SlotOfferProps } => {
	const capacity = BASE_SLOTS + slotsBought;
	const priceKb = archivePriceKb(slotsBought);
	const refundKb = archivePriceKb(slotsBought - 1);
	const affordable = priceKb !== undefined && priceKb <= archiveKb;

	return {
		cash:
			refundKb === undefined
				? undefined
				: {
						refund: `${signedKbLabel(refundKb)} ${ARCHIVE_WORD}`,
						onPress: noop,
					},
		offer:
			priceKb === undefined
				? undefined
				: {
						slot: capacity + 1,
						price: archiveLabel(priceKb),
						verb: OPEN_VERB,
						refusal: affordable ? undefined : shortfallOf(priceKb, archiveKb),
						onPress: affordable ? noop : undefined,
					},
	};
};

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

export const kantoGateZeroFooter = (canStart = false): ScreenFooterProps => {
	const peels = failPeelShareFor(START_GATE) > 0;
	const audited = START_GATE >= INTRO_GATE;

	return {
		stakes: [
			{
				label: `gate ${START_GATE} asks`,
				figures: [
					{ label: `${coverageDemandFor(START_GATE)}% coverage` },
					{
						label: `+${kbLabel(GATE_REWARD_KB)} on a clear`,
						color: "viridian",
					},
					{
						label: `${peels ? "peels" : "no peel"} ${SEPARATOR} ${audited ? "audited" : "no audits"}`,
					},
				] satisfies StakeFigure[],
			},
		],
		action: {
			label: `start gate ${START_GATE}`,
			icon: "gate",
			onPress: canStart ? noop : undefined,
		},
		refusal: canStart
			? undefined
			: "A bare build never clears, so the run will not start until one config is installed.",
	};
};

export const createKantoNewRunScreenProps =
	createMockDataFactory<NewRunScreenProps>({
		header: kantoNewRunHeader(),
		build: {
			configs: [],
			slots: { used: 0, capacity: BASE_SLOTS },
			emptyLabel: NEW_RUN_EMPTY_LABEL,
			resting: NEW_RUN_RESTING,
			...newRunSlotDealsAt(),
		},
		hand: kantoHandProps(),
		footer: kantoGateZeroFooter(),
		buildNote: NEW_RUN_BUILD_NOTE,
	});

export const kantoNewRunAt = (
	installedIds: readonly string[],
	slotsBought = 0,
	archiveKb: number = NEW_RUN_ARCHIVE_KB
): NewRunScreenProps => {
	const capacity = BASE_SLOTS + slotsBought;
	const configs = kantoNewRunBuild(installedIds);

	return {
		header: kantoNewRunHeader(archiveKb),
		build: {
			configs,
			slots: { used: usedSlotsOf(configs), capacity },
			emptyLabel: NEW_RUN_EMPTY_LABEL,
			resting: NEW_RUN_RESTING,
			...newRunSlotDealsAt(slotsBought, archiveKb),
		},
		hand: kantoHandProps(installedIds, capacity),
		footer: kantoGateZeroFooter(installedIds.length > 0),
		buildNote: NEW_RUN_BUILD_NOTE,
	};
};

const AUDITS_TITLE = "Audits";
const GATE_TITLE_TRAIL = "gate";

export const PREP_SHOP_LABEL = "change it in the shop";
const SUMMIT_LINE = "the summit — nothing after this";
const PEEL_HINT = "Drop configs or minify them — your pick.";
const FATAL_HINT = "A peel this deep can end the run.";
const FREE_MISS = "costs nothing";
const FATAL_MISS = "ends the run";
const SEALED: LedgerFigure = { locked: true };

export const PREP_COMMUNITY_LABEL = "Community";
const START_LEAD = "Start";
const CLEAR_LABEL = "clear";
const COVERAGE_WORD = "coverage";
const MISS_LABEL = "miss";
const BILL_LEAD = "bills";
const BILL_TRAIL = "on a clear";
const NO_AUDITS = "none this gate";
const AUDIT_COUNT_TRAIL = "this gate";

const coverageFigure = (held: number) => roundToOneDecimal(held).toFixed(1);

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

const missFigureFor = (
	range: { fewest: number; most: number },
	quota: number,
	slots: number
): StakeFigure => {
	if (quota === 0) return { label: FREE_MISS };
	if (isPeelFatal(quota, slots))
		return { label: FATAL_MISS, color: "cinnabar" };
	if (range.fewest === range.most) {
		return { label: `peels ${range.fewest} configs`, color: "cinnabar" };
	}
	return {
		label: `peels ${range.fewest} or ${range.most} configs`,
		color: "cinnabar",
	};
};

const missNoteFor = (
	quota: number,
	slots: number,
	audits: readonly Audit[]
): string | undefined => {
	if (quota === 0) return undefined;

	const deepener = audits.find((audit) => audit.peelShareOnFail !== undefined);
	const fatal = isPeelFatal(quota, slots);
	if (deepener === undefined && !fatal) return undefined;

	const deepened =
		deepener === undefined
			? ""
			: `, deepened by ${deepener.code} ${deepener.name}`;
	const hint = fatal ? FATAL_HINT : PEEL_HINT;

	return `${quota} of your ${slots} occupied slots${deepened}. ${hint}`;
};

export type PrepFrame = {
	gate: number;
	configs: readonly Config[];
	chips: readonly ConfigChipProps[];
	capacity: number;
	balanceKb: number;
	coverageHeld: number;
	planTier: number;
	window: PrepWindow;
	answered?: number;
};

export const kantoPrepAt = ({
	gate,
	configs,
	chips,
	capacity,
	balanceKb,
	coverageHeld,
	planTier,
	window,
	answered = 0,
}: PrepFrame): PrepScreenProps => {
	const swatch = gateSwatchAt(gate);
	const audits = auditsForGate(gate, DEFAULT_AUDIT_SCHEDULE);
	const slots = occupiedSlots(configs);
	const quota = failPeelQuotaFor(configs, gate, DEFAULT_AUDIT_SCHEDULE);
	const range = peelConfigRangeFor(configs, quota);
	const prefetcher = prefetcherFor(configs);
	const demand = coverageDemandFor(gate);

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
			coverage: {
				label: COVERAGE_WORD,
				held: coverageFigure(coverageHeld),
				demand: `${demand}%`,
				meter: { value: coverageHeld, max: demand },
			},
		},
		build: {
			configs: chips,
			slots: { used: slots, capacity },
		},
		shop: { label: PREP_SHOP_LABEL, icon: "shop", onPress: noop },
		polls: {
			title: `${swatch.gateName} ${GATE_TITLE_TRAIL}`,
			heading: "gate",
			badge: prefetcher?.label,
			rows: pollRowsFor(gate, window, prefetcher !== undefined),
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
			stakes: [
				{
					label: CLEAR_LABEL,
					figures: [
						{
							label: signedKbLabel(
								gateClearPayout(configs, SLICE_WINDOW, gate)
							),
							color: "viridian",
						},
						{
							label: `${swatch.gateName} swatch`,
							swatch: { state: "current", swatch },
						},
					],
				},
				{ label: MISS_LABEL, figures: [missFigureFor(range, quota, slots)] },
			],
			action: {
				label: `${START_LEAD} ${swatch.gateName}`,
				icon: "gate",
				onPress: noop,
			},
			note: missNoteFor(quota, slots, audits),
		},
	};
};

const prepChip = (config: Config, badge: ConfigChipBadge): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	version: config.level,
	badges: [badge],
	info: infoFor(config),
});

const gain = (config: Config): ConfigChipBadge => ({
	label: figureLabel(config),
	color: "viridian",
});

const ability = (label: string): ConfigChipBadge => ({
	label,
	color: "pewter",
});

const reveals = (label: string): ConfigChipBadge => ({
	label,
	color: "cerulean",
});

const LAVENDER_GATE = 4;
const LAVENDER_BALANCE_KB = 102;
const LAVENDER_CAPACITY = 8;
const LAVENDER_PLAN_TIER = 1;

const JS_V2 = { ...CONFIGS.js, level: 2 };
const TELEMETRY_V2 = { ...CONFIGS.telemetry, level: 2 };

const LAVENDER_CONFIGS: readonly Config[] = [
	JS_V2,
	CONFIGS.eslint,
	CONFIGS.deprecated,
	CONFIGS.ts,
];

const LAVENDER_CHIPS: readonly ConfigChipProps[] = [
	prepChip(JS_V2, gain(JS_V2)),
	prepChip(CONFIGS.eslint, ability("cross out")),
	prepChip(CONFIGS.deprecated, gain(CONFIGS.deprecated)),
	prepChip(CONFIGS.ts, gain(CONFIGS.ts)),
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
		chips: LAVENDER_CHIPS,
		capacity: LAVENDER_CAPACITY,
		balanceKb: LAVENDER_BALANCE_KB,
		coverageHeld: 0,
		planTier: LAVENDER_PLAN_TIER,
		window: LAVENDER_WINDOW,
	});

export const kantoPrepPrefetched = (): PrepScreenProps =>
	kantoPrepAt({
		gate: LAVENDER_GATE,
		configs: [...LAVENDER_CONFIGS, CONFIGS.prefetch],
		chips: [...LAVENDER_CHIPS, prepChip(CONFIGS.prefetch, reveals("reveals"))],
		capacity: 12,
		balanceKb: LAVENDER_BALANCE_KB,
		coverageHeld: 0,
		planTier: LAVENDER_PLAN_TIER,
		window: LAVENDER_WINDOW,
	});

const CHAMPION_BALANCE_KB = 1945;
const CHAMPION_CAPACITY = 24;
const CHAMPION_PLAN_TIER = 3;

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

const CHAMPION_CHIPS: readonly ConfigChipProps[] = [
	prepChip(JS_V2, gain(JS_V2)),
	prepChip(CONFIGS.ts, gain(CONFIGS.ts)),
	prepChip(CONFIGS.py, gain(CONFIGS.py)),
	prepChip(CONFIGS.eslint, ability("cross out")),
	prepChip(TELEMETRY_V2, ability("peek")),
	prepChip(CONFIGS.prefetch, reveals("reveals")),
	prepChip(CONFIGS.indexedDb, gain(CONFIGS.indexedDb)),
	prepChip(CONFIGS.freemium, ability("half price")),
	prepChip(CONFIGS.overclock, gain(CONFIGS.overclock)),
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
		chips: CHAMPION_CHIPS,
		capacity: CHAMPION_CAPACITY,
		balanceKb: CHAMPION_BALANCE_KB,
		coverageHeld: 92.5,
		planTier: CHAMPION_PLAN_TIER,
		window: CHAMPION_WINDOW,
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
		chips: [
			prepChip(CONFIGS.js, gain(CONFIGS.js)),
			prepChip(CONFIGS.codeCoverage, gain(CONFIGS.codeCoverage)),
		],
		capacity: BASE_SLOTS,
		balanceKb: 0,
		coverageHeld: 0,
		planTier: 0,
		window: LAVENDER_WINDOW,
	});

export const kantoPrepFatal = (): PrepScreenProps =>
	kantoPrepAt({
		gate: VICTORY_GATE,
		configs: [JS_V2],
		chips: [prepChip(JS_V2, gain(JS_V2))],
		capacity: CHAMPION_CAPACITY,
		balanceKb: CHAMPION_BALANCE_KB,
		coverageHeld: 210,
		planTier: CHAMPION_PLAN_TIER,
		window: CHAMPION_WINDOW,
	});
