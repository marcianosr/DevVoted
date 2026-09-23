import type { Config } from "~/modules/run/config/domain/config.model";
import type {
	ConfigStatus,
	Coverage,
	SkipReason,
} from "~/modules/run/config/domain/effect.model";
import { roundToTwoDecimals } from "~/modules/run/run/domain/rules.model";
import type { CategoryCode } from "~/shared/lib/categories";
import {
	describeConfig,
	headlineFigureOf,
	maxLevelOf,
	sellRefund,
	slotsOf,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { kbLabel } from "~/shared/lib/storage";

import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { ConfigChipBadge } from "~/ui/kanto-theme/ConfigChip.ui";
import type { ConfigInfoProps } from "~/ui/kanto-theme/ConfigInfo.ui";
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

export const upgradesFor = (config: Config): UpgradesProps => {
	const held = config.level ?? FIRST_VERSION;
	const max = maxLevelOf(config);

	const rungs: UpgradeRung[] = Array.from({ length: max }, (_, index) => {
		const version = index + 1;
		return {
			version,
			effect: figureLabel({ ...config, level: version }),
			state: rungStateFor(version, held, held + 1),
			price:
				version <= held ? undefined : kbLabel(upgradeStorageCost(version - 1)),
			held: version === held,
		};
	});

	const toMaxKb = rungs
		.filter((rung) => rung.price !== undefined)
		.reduce((total, rung) => total + upgradeStorageCost(rung.version - 1), 0);

	if (toMaxKb === 0) {
		return { name: config.label, description: describeConfig(config), rungs };
	}

	return {
		name: config.label,
		description: describeConfig(config),
		rungs,
		toMax: { version: max, price: kbLabel(toMaxKb) },
	};
};

export const infoFor = (config: Config, note?: string): ConfigInfoProps => ({
	name: config.label,
	description: describeConfig(config),
	slots: slotsOf(config),
	sellPrice: kbLabel(sellRefund(config)),
	version: config.level ?? 1,
	maxVersion: maxLevelOf(config),
	note,
});

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
	categories.map((code) => code.toUpperCase()).join(" or ");

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
	if (status.kind === "skipped") return { detail: skipWords(status.why) };
	if (status.kind !== "online") return {};

	if (status.coverage !== undefined)
		return {
			badge: {
				label: `${coverageWords(status.coverage)} ${HERE}`,
				color: status.coverage.mult < 1 ? LOSS_COLOR : GAIN_COLOR,
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
