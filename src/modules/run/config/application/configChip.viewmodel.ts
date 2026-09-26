import type { Config } from "~/modules/run/config/domain/config.model";
import type { Coverage } from "~/modules/run/config/domain/effect.model";
import type {
	ConfigStatus,
	SkipReason,
} from "~/modules/run/config/domain/configStatus.model";
import { roundToTwoDecimals } from "~/modules/run/run/domain/rules.model";
import {
	describeConfig,
	headlineFigureOf,
	maxLevelOf,
	sellRefund,
	slotsOf,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import {
	getCategoryMetadata,
	type CategoryCode,
} from "~/shared/lib/categories";
import { kbLabel } from "~/shared/lib/storage";

import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { ConfigChipBadge } from "~/ui/kanto-theme/ConfigChip.ui";
import type { ConfigFactsProps } from "~/ui/kanto-theme/ConfigFacts.ui";
import type { UpgradeRung, UpgradesProps } from "~/ui/kanto-theme/Upgrades.ui";
import type { VersionState } from "~/ui/kanto-theme/Version.ui";

const FIRST_VERSION = 1;

export const figureLabel = (config: Config): string => {
	const figure = headlineFigureOf(config);
	if (figure === undefined) return "";
	if (figure.kind === "percent") return `+${figure.value}%`;
	if (figure.kind === "multiplier") return `×${figure.value}`;
	if (figure.kind === "coverage") return `+${figure.value} units`;
	return `+${figure.value} KB`;
};

const rungStateFor = (
	version: number,
	held: number,
	offered: number
): VersionState => {
	if (version <= held) return "owned";
	if (version === offered) return "offered";
	return "future";
};

const ROLLS_WORD = "rolls";
const EVERY_ROLL = "every roll";

export const rollOddsLabel = (share: number): string =>
	share >= 1 ? EVERY_ROLL : `1 in ${Math.round(1 / share)} ${ROLLS_WORD}`;

export type RegistryDeal = {
	price: string;
	affordable: boolean;
	onBuy?: () => void;
};

/**
 * The registry's rolled upgrade, as opposed to the shop's Upgrade press: the
 * offered rung can sit more than one above the held one, it sells at the
 * registry price, and there is no press ladder to total in a footer.
 */
export const registryUpgradesFor = (
	offer: Config,
	heldLevel: number,
	{ price, affordable, onBuy }: RegistryDeal
): UpgradesProps => {
	const offered = offer.level ?? FIRST_VERSION;

	const rungs: UpgradeRung[] = Array.from(
		{ length: maxLevelOf(offer) },
		(_, index) => {
			const version = index + 1;
			const isOffered = version === offered;
			return {
				version,
				effect: figureLabel({ ...offer, level: version }),
				state: rungStateFor(version, heldLevel, offered),
				price: isOffered ? price : undefined,
				held: version === heldLevel,
				disabled: isOffered && !affordable ? true : undefined,
			};
		}
	);

	return {
		name: offer.label,
		description: describeConfig(offer),
		rungs,
		onBuy: onBuy === undefined ? undefined : () => onBuy(),
	};
};

const PERCENT = "%";
const UNLOCKS_AT = "Unlocks at";
const COVERAGE_WORD = "coverage, you have";
const SHORT_TRAIL = "short";

/**
 * The Build panel's own upgrade, as opposed to the registry's rolled one: it
 * climbs exactly one rung, pays the `upgradeStorageCost` ladder, and answers to
 * the coverage gate the rolled offer waives.
 */
export type BuildUpgradeDeal = {
	storageKb: number;
	/** Coverage held in the config's focus category; ignored by configs without one. */
	coveragePct: number;
	onBuy?: () => void;
};

/**
 * `upgrade` refuses silently in the reducer, so the words have to be worked out
 * here or the press reads as broken. The coverage gate comes first: it is the
 * requirement a player cannot pay their way out of.
 */
export const upgradeRefusalOf = (
	config: Config,
	held: number,
	{ storageKb, coveragePct }: BuildUpgradeDeal
): string | undefined => {
	const needed = upgradeCoverageRequired(held);
	if (config.focusCategory !== undefined && coveragePct < needed) {
		const category = getCategoryMetadata(config.focusCategory).name;
		return `${UNLOCKS_AT} ${needed}${PERCENT} ${category} ${COVERAGE_WORD} ${coveragePct}${PERCENT}.`;
	}

	const price = upgradeStorageCost(held);
	if (storageKb < price) return `${kbLabel(price - storageKb)} ${SHORT_TRAIL}`;

	return undefined;
};

export const upgradesFor = (
	config: Config,
	deal?: BuildUpgradeDeal
): UpgradesProps => {
	const held = config.level ?? FIRST_VERSION;
	const max = maxLevelOf(config);
	const onBuy = deal?.onBuy;
	const refusal =
		deal === undefined || held >= max
			? undefined
			: upgradeRefusalOf(config, held, deal);

	const rungs: UpgradeRung[] = Array.from({ length: max }, (_, index) => {
		const version = index + 1;
		return {
			version,
			effect: figureLabel({ ...config, level: version }),
			state: rungStateFor(version, held, held + 1),
			price:
				version <= held ? undefined : kbLabel(upgradeStorageCost(version - 1)),
			held: version === held,
			disabled:
				version === held + 1 && refusal !== undefined ? true : undefined,
		};
	});

	return {
		name: config.label,
		description: describeConfig(config),
		rungs,
		...(refusal === undefined ? {} : { refusal }),
		...(onBuy === undefined ? {} : { onBuy: () => onBuy() }),
	};
};

const factsOf = (config: Config, note?: string): ConfigFactsProps => ({
	description: describeConfig(config),
	slots: slotsOf(config),
	version: config.level ?? 1,
	maxVersion: maxLevelOf(config),
	note,
});

export const infoFor = (config: Config, note?: string): ConfigFactsProps => ({
	...factsOf(config, note),
	sellPrice: kbLabel(sellRefund(config)),
});

/**
 * A config on a screen that only reports what already happened. It carries no
 * sell price because there is no sale to make: quoting one is the same failure
 * as hiding a price you could act on.
 */
export const settledFactsFor = (config: Config): ConfigFactsProps =>
	factsOf(config);

export const chipFor = (config: Config, note?: string) => ({
	slots: slotsOf(config),
	version: config.level,
	info: infoFor(config, note),
});

const HERE = "here";
const IDLE = "idle this poll";
const ONLY = "only";
const GAIN_COLOR: KantoColor = "viridian";
const LOSS_COLOR: KantoColor = "cinnabar";
const BUMP_COLOR: KantoColor = "vermillion";
const BUMP_WORD = "bump in";

/** Neutral: a config sitting a poll out has neither gained nor lost anything. */
const SKIP_COLOR: KantoColor = "pewter";
/** The cap is room still to spend, so it reads as a term rather than a gain. */
const CAP_COLOR: KantoColor = "saffron";
const CAP_WORDS = "KB left";
const HOLDING_COLOR: KantoColor = "saffron";
const HOLDING_WORD = "holding";
const AT_RISK = "paid on a clear, rolled back otherwise";

const SKIP_WORDS = {
	openerOnly: "opener only",
	missedOnly: "polls you have missed",
	cacheCold: "cache is cold",
	paysAtGateClear: "pays at the clear",
	paysOnPeel: "pays on a peel",
	billsAtGateClear: "bills at the clear",
	inShop: "works in the shop",
	inPrep: "works in prep",
	noAuditToSuppress: "no audit to suppress",
	armedForFatal: "armed for a fatal close",
	runCapReached: "run cap reached",
	selectAllOnly: `select-all ${ONLY}`,
	paysOnPartial: "pays on a partial",
	notThisPoll: IDLE,
} satisfies Record<Exclude<SkipReason["kind"], "otherCategories">, string>;

export const categoriesWord = (categories: readonly CategoryCode[]): string =>
	categories.map((code) => getCategoryMetadata(code).name).join(" or ");

const figureOf = (value: number): string => `${roundToTwoDecimals(value)}`;

const coverageWords = ({ mult, add }: Coverage): string =>
	[
		...(mult === 1 ? [] : [`×${figureOf(mult)}`]),
		...(add === 0 ? [] : [`${add > 0 ? "+" : ""}${figureOf(add)}`]),
	].join(" ");

const skipWords = (why: SkipReason): string =>
	why.kind !== "otherCategories"
		? SKIP_WORDS[why.kind]
		: why.categories.length === 0
			? IDLE
			: `${categoriesWord(why.categories)} ${ONLY}`;

export type PollNote = { badge?: ConfigChipBadge; detail?: string };

/**
 * What a config is worth on the poll in front of you. A build that never states
 * this leaves the payout unattributable, which is the whole of DVTD-zr20.
 */
export const pollNoteFor = (status: ConfigStatus | undefined): PollNote => {
	if (status === undefined) return {};
	// A badge, not a note: why a config is sitting the poll out is the same kind
	// of fact as what it is paying — the one thing the chip states about this
	// poll — and a card whose only state read as muted prose looked stateless.
	if (status.kind === "skipped")
		return { badge: { label: skipWords(status.why), color: SKIP_COLOR } };
	if (status.kind !== "online") return {};

	if (status.coverage !== undefined)
		return {
			badge: {
				label: `${coverageWords(status.coverage)} ${HERE}`,
				color: status.coverage.mult < 1 ? LOSS_COLOR : GAIN_COLOR,
			},
		};

	// Before the bump: a faucet's cap is the figure that moves on every answer,
	// and it is the one thing that decides whether the config pays at all.
	if (status.capLeftKb !== undefined)
		return {
			badge: {
				// The figure travels as a number, not inside the words: it drains on
				// every correct answer, and the chip animates it down from whatever it
				// last read rather than swapping one frozen string for another.
				count: status.capLeftKb,
				label: CAP_WORDS,
				color: CAP_COLOR,
			},
		};

	if (status.bumpIn !== undefined)
		return {
			badge: { label: `${BUMP_WORD} ${status.bumpIn}`, color: BUMP_COLOR },
		};

	// Saffron, not viridian: the figure is held rather than earned, and the
	// colour is the only thing on the chip that says which.
	if (status.holdingKb !== undefined)
		return {
			badge: {
				label: `${HOLDING_WORD} ${kbLabel(status.holdingKb)}`,
				color: HOLDING_COLOR,
			},
			detail: AT_RISK,
		};

	return {};
};
