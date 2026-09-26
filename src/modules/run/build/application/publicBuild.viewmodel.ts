import { vendorChipFor } from "~/modules/run/build/application/vendorChip.viewmodel";
import type {
	PublicBuild,
	PublicConfig,
} from "~/modules/run/build/domain/publicBuild.model";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";

/**
 * Another player's config as a chip with nothing to press: the surface that
 * shows it owns the only action, and an About per chip would bury it. The
 * vendor badge is spelled where the build spells it, so "locked in" reads the
 * same on every screen that opens a build (ADR-101).
 */
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
