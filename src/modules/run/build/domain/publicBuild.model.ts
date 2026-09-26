import { slotsOf } from "~/modules/run/config/domain/config.model";
import { spaceFitting } from "~/modules/run/run/domain/rules.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";

export type InstalledConfigRef = {
	readonly id: string;
	readonly level: number | null;
	readonly minified: boolean | null;
};

export type StoredPublicBuild = {
	readonly configs: readonly InstalledConfigRef[];
	readonly vendorLockedConfigId: string | null;
};

export type PublicConfig = {
	readonly id: string;
	readonly label: string;
	readonly slots: number;
	readonly level?: number;
};

export type PublicBuild = {
	readonly configs: readonly PublicConfig[];
	readonly vendorLockedConfigId?: string;
};

const publicConfigOf = (ref: InstalledConfigRef): PublicConfig | undefined => {
	const current = CONFIG_LIST.find((config) => config.id === ref.id);
	if (current === undefined) return undefined;
	return {
		id: current.id,
		label: current.label,
		slots: slotsOf({ ...current, minified: ref.minified === true }),
		...(ref.level === null ? {} : { level: ref.level }),
	};
};

const known = (configs: readonly InstalledConfigRef[]): PublicConfig[] =>
	configs.flatMap((ref) => {
		const config = publicConfigOf(ref);
		return config === undefined ? [] : [config];
	});

export const publicBuildOf = ({
	configs,
	vendorLockedConfigId,
}: StoredPublicBuild): PublicBuild => {
	const installed = known(configs);
	const lockStands =
		vendorLockedConfigId !== null &&
		installed.some((config) => config.id === vendorLockedConfigId);
	return {
		configs: installed,
		...(lockStands ? { vendorLockedConfigId } : {}),
	};
};

export const publicWeightOf = (build: PublicBuild): number =>
	build.configs.reduce((total, config) => total + config.slots, 0);

export const publicSpaceOf = (build: PublicBuild): number =>
	spaceFitting(
		build.configs
			.filter((config) => config.id !== build.vendorLockedConfigId)
			.reduce((total, config) => total + config.slots, 0)
	);
