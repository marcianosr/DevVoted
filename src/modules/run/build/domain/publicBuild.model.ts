import { slotsOf } from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";

/** One installed config as Postgres projects it out of the blob: nothing the roster can restate. */
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

/** A build as any other player may read it (ADR-100): what is installed, never what was answered. */
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
