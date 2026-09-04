import type { Config } from "~/modules/run/config/domain/config.model";
import { gateDemandFor } from "~/modules/run/gate/domain/gate.model";
import type { RunState } from "~/modules/run/run/domain/run.model";

export type GatePayout = {
	readonly gateRewardPaidKb: number;
	readonly storageBeforeClearKb: number | null;
	readonly interestThisGateKb: number;
	readonly extraPickThisGateKb: number;
	readonly faucetThisGateKb: number;
	readonly subscriptionBillKb: number;
	readonly planBilledKb: number;
	readonly planDowngraded: boolean;
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
		storageBeforeClearKb: state.storageBeforeClearKb ?? null,
		interestThisGateKb: state.interestThisGateKb ?? 0,
		extraPickThisGateKb: state.extraPickThisGateKb ?? 0,
		faucetThisGateKb: state.faucetThisGateKb ?? 0,
		subscriptionBillKb: state.subscriptionBillKb ?? 0,
		planBilledKb: state.planBilledKb ?? 0,
		planDowngraded: state.planDowngraded ?? false,
		autoUpgradedConfig:
			state.build.configs.find(
				(config) => config.id === state.autoUpgradedConfigId
			) ?? null,
		deletedConfigs: state.deletedConfigs ?? [],
		lapsedConfigs: state.lapsedConfigs ?? [],
		clearedGateNumber: reportedGate,
		clearedGateDemand: gateDemandFor(state.build.configs, reportedGate),
	};
};
