import type { Config } from "~/modules/run/config/domain/config.model";
import {
	percentOf,
	runCoverageOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	type GateLadder,
	gateLadderFor,
} from "~/modules/run/gate/domain/gate.model";
import { type RunState, scheduleOf } from "~/modules/run/run/domain/run.model";
import { roundToOneDecimal } from "~/modules/run/run/domain/rules.model";

export type GatePayout = {
	readonly gateRewardPaidKb: number;
	readonly storageBeforeClearKb: number | null;
	readonly interestThisGateKb: number;
	readonly extraPickThisGateKb: number;
	readonly estimateThisGateUnits: number | null;
	readonly faucetThisGateKb: number;
	readonly subscriptionBillKb: number;
	readonly upkeepBilledKb: number;
	readonly spaceDroppedTo: number | null;
	readonly autoUpgradedConfig: Config | null;
	readonly autoUpgradedByConfig: Config | null;
	readonly deletedConfigs: readonly Config[];
	readonly lapsedConfigs: readonly Config[];
	readonly clearedGateNumber: number;
	readonly clearedGateLadder: GateLadder;
	readonly clearedCoverageHeld: number;
};

export const gatePayoutFor = (state: RunState): GatePayout => {
	const reportedGate = state.clearedGate ?? state.gatesCleared;
	return {
		gateRewardPaidKb: state.gateRewardKb ?? 0,
		storageBeforeClearKb: state.storageBeforeClearKb ?? null,
		interestThisGateKb: state.interestThisGateKb ?? 0,
		extraPickThisGateKb: state.extraPickThisGateKb ?? 0,
		estimateThisGateUnits: state.estimateThisGateUnits ?? null,
		faucetThisGateKb: state.faucetThisGateKb ?? 0,
		subscriptionBillKb: state.subscriptionBillKb ?? 0,
		upkeepBilledKb: state.upkeepBilledKb ?? 0,
		spaceDroppedTo: state.spaceDroppedTo ?? null,
		autoUpgradedConfig:
			state.build.configs.find(
				(config) => config.id === state.autoUpgradedConfigId
			) ?? null,
		autoUpgradedByConfig:
			state.build.configs.find(
				(config) => config.id === state.autoUpgradedByConfigId
			) ?? null,
		deletedConfigs: state.deletedConfigs ?? [],
		lapsedConfigs: state.lapsedConfigs ?? [],
		clearedGateNumber: reportedGate,
		clearedGateLadder: gateLadderFor(
			state.build.configs,
			reportedGate,
			scheduleOf(state)
		),
		clearedCoverageHeld: roundToOneDecimal(
			percentOf(runCoverageOf(state.bankedUnits, reportedGate))
		),
	};
};
