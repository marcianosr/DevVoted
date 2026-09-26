import { vendorChipFor } from "~/modules/run/build/application/vendorChip.viewmodel";
import type {
	PublicBuild,
	PublicConfig,
} from "~/modules/run/build/domain/publicBuild.model";
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

export const publicBuildChipsFor = (
	build: PublicBuild
): readonly ConfigChipProps[] =>
	build.configs.map((config) =>
		publicConfigChipFor(config, build.vendorLockedConfigId)
	);
