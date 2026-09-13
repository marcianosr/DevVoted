import type { Config } from "~/modules/run/config/domain/config.model";
import {
	describeConfig,
	headlineFigureOf,
	maxLevelOf,
	sellRefund,
	slotsOf,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { kbLabel } from "~/shared/lib/storage";

import type { ConfigInfoProps } from "~/ui/kanto-theme/ConfigInfo.ui";
import type { UpgradeRung, UpgradesProps } from "~/ui/kanto-theme/Upgrades.ui";
import type { VersionState } from "~/ui/kanto-theme/Version.ui";

const FIRST_VERSION = 1;

export const figureLabel = (config: Config): string => {
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
