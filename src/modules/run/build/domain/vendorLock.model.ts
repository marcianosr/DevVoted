import { vendorLockerFor } from "~/modules/run/build/domain/build.model";
import {
	isPrepPhase,
	type RunState,
	withLog,
} from "~/modules/run/run/domain/run.model";

export const canVendorLock = (state: RunState): boolean => {
	if (!isPrepPhase(state)) return false;
	if (vendorLockerFor(state.build.configs) === undefined) return false;
	if (state.build.vendorLockedConfigId !== undefined) return false;
	return state.build.configs.some((config) => config.vendorLocks !== true);
};

export const commitVendorLock = (
	state: RunState,
	configId: string
): RunState => {
	if (!canVendorLock(state)) return state;
	const locker = vendorLockerFor(state.build.configs);
	if (locker === undefined || locker.id === configId) return state;
	const target = state.build.configs.find(
		(config) => config.id === configId
	);
	if (target === undefined) return state;
	return {
		...state,
		build: { ...state.build, vendorLockedConfigId: configId },
		log: withLog(
			state,
			`Locked in ${target.label} — it stops counting against your build space, and you are stuck with it.`
		),
	};
};

export const isVendorLocked = (
	state: Pick<RunState, "build">,
	configId: string
): boolean => state.build.vendorLockedConfigId === configId;
