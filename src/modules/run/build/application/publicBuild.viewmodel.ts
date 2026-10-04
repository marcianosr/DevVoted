import { vendorChipFor } from "~/modules/run/build/application/vendorChip.viewmodel";
import type {
	PublicBuild,
	PublicConfig,
} from "~/modules/run/build/domain/publicBuild.model";
import {
	describeConfig,
	maxLevelOf,
} from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import type { ConfigFactsProps } from "~/ui/kanto-theme/ConfigFacts.ui";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";

export const publicConfigChipFor = (
	config: PublicConfig,
	vendorLockedConfigId?: string
): ConfigChipProps => ({
	name: config.label,
	slots: config.slots,
	...(config.level === undefined ? {} : { version: config.level }),
	badges: vendorChipFor(
		config.id === vendorLockedConfigId ? { locked: true } : undefined
	).badges,
});

const factsFor = (config: PublicConfig): ConfigFactsProps | undefined => {
	const roster = CONFIG_LIST.find((entry) => entry.id === config.id);
	if (roster === undefined) return undefined;
	const settled = {
		...roster,
		...(config.level === undefined ? {} : { level: config.level }),
		minified: config.minified === true,
	};
	return {
		description: describeConfig(settled),
		slots: config.slots,
		maxVersion: maxLevelOf(roster),
		...(config.level === undefined ? {} : { version: config.level }),
	};
};

export const publicConfigCardFor = (
	config: PublicConfig,
	vendorLockedConfigId?: string
): ConfigChipProps => {
	const info = factsFor(config);
	return {
		name: config.label,
		slots: config.slots,
		...(config.level === undefined ? {} : { version: config.level }),
		...(info === undefined ? {} : { info }),
		badges: vendorChipFor(
			config.id === vendorLockedConfigId ? { locked: true } : undefined
		).badges,
	};
};

export const publicBuildChipsFor = (
	build: PublicBuild
): readonly ConfigChipProps[] =>
	build.configs.map((config) =>
		publicConfigChipFor(config, build.vendorLockedConfigId)
	);

export const publicBuildCardsFor = (
	build: PublicBuild
): readonly ConfigChipProps[] =>
	build.configs.map((config) =>
		publicConfigCardFor(config, build.vendorLockedConfigId)
	);
