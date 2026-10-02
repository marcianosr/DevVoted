import {
	configsUnlockedBy,
	type ObjectiveCount,
	type UnlockGrant,
} from "~/modules/run/config/domain/configUnlock.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { closesAGate } from "~/modules/run/run/domain/closeGains.model";
import { isRunOver, type RunState } from "~/modules/run/run/domain/run.model";
import {
	servicesUnlockedBy,
	type ServiceUnlockGrant,
} from "~/modules/run/shop/domain/registryControl.model";

export type ObjectiveGrants = {
	readonly configs: readonly UnlockGrant[];
	readonly services: readonly ServiceUnlockGrant[];
};

export const objectiveGrantsFor = (
	counts: readonly ObjectiveCount[]
): ObjectiveGrants => ({
	configs: configsUnlockedBy(counts),
	services: servicesUnlockedBy(counts),
});

export type AccountGrants = {
	readonly swatchIds: readonly string[];
	readonly firstInstalledConfigIds: readonly string[];
	readonly pinnedGate: number | null;
	readonly storageWatermarkKb: number | null;
	readonly titlesDue: boolean;
};

const configsNewlyInstalled = (
	before: RunState,
	after: RunState
): readonly string[] => {
	const held = new Set(before.build.configs.map((config) => config.id));
	return after.build.configs
		.map((config) => config.id)
		.filter((configId) => !held.has(configId));
};

const swatchesNewlyEarned = (
	before: RunState,
	after: RunState
): readonly string[] => {
	const held = before.swatchGatesEarned ?? [];
	return (after.swatchGatesEarned ?? [])
		.filter((gate) => !held.includes(gate))
		.flatMap((gate) => {
			const swatch = swatchForGate(gate);
			return swatch ? [swatch.id] : [];
		});
};

const pinNewlyPlanted = (before: RunState, after: RunState): number | null =>
	after.pinPlantedAtGate !== undefined &&
	after.pinPlantedAtGate !== before.pinPlantedAtGate
		? after.pinPlantedAtGate
		: null;

const watermarkRaised = (before: RunState, after: RunState): number | null => {
	const peak = after.peakStorageKb ?? 0;
	return peak > (before.peakStorageKb ?? 0) ? peak : null;
};

export const accountGrantsOf = (
	before: RunState,
	after: RunState
): AccountGrants => ({
	swatchIds: swatchesNewlyEarned(before, after),
	firstInstalledConfigIds: configsNewlyInstalled(before, after),
	pinnedGate: pinNewlyPlanted(before, after),
	storageWatermarkKb: watermarkRaised(before, after),
	titlesDue: closesAGate(before, after) || isRunOver(after.status),
});
