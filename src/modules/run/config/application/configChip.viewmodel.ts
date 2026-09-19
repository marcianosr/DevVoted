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

const SKIP_WORDS = {
	openerOnly: "opener only",
	cacheCold: "cache is cold",
	paysAtGateClear: "pays at the clear",
	paysOnPeel: "pays on a peel",
	billsAtGateClear: "bills at the clear",
	inShop: "works in the shop",
	inPrep: "works in prep",
	noAuditToSuppress: "no audit to suppress",
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

	return {};
};
