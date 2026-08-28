import type { Config } from "~/modules/run/config/domain/config.model";
import { gateDemandFor } from "~/modules/run/gate/domain/gate.model";
import type { RunState } from "~/modules/run/run/domain/run.model";

export type GatePayout = {
	readonly gateRewardPaidKb: number;
	readonly interestThisGateKb: number;
	readonly extraPickThisGateKb: number;
	readonly faucetThisGateKb: number;
	readonly subscriptionBillKb: number;
	readonly spotRentKb: number;
	readonly rentDefaulted: boolean;
	readonly autoUpgradedConfig: Config | null;
	readonly deletedConfigs: readonly Config[];
	readonly lapsedConfigs: readonly Config[];
	readonly clearedGateNumber: number;
	readonly clearedGateDemand: number;
};

export const gatePayoutFor = (state: RunState): GatePayout => {
	const reportedGate = state.clearedGate ?? state.gatesCleared;
	return {
		gateRewardPaidKb: state.gateRewardKb ?? 0,
		interestThisGateKb: state.interestThisGateKb ?? 0,
		extraPickThisGateKb: state.extraPickThisGateKb ?? 0,
		faucetThisGateKb: state.faucetThisGateKb ?? 0,
		subscriptionBillKb: state.subscriptionBillKb ?? 0,
		spotRentKb: state.spotRentKb ?? 0,
		rentDefaulted: state.rentDefaulted ?? false,
		autoUpgradedConfig:
			state.pipeline.configs.find(
				(config) => config.id === state.autoUpgradedConfigId
			) ?? null,
		deletedConfigs: state.deletedConfigs ?? [],
		lapsedConfigs: state.lapsedConfigs ?? [],
		clearedGateNumber: reportedGate,
		clearedGateDemand: gateDemandFor(state.pipeline.configs, reportedGate),
	};
};
