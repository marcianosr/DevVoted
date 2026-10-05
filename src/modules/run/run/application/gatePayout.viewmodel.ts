import type { Config } from "~/modules/run/config/domain/config.model";
import type { RunState } from "~/modules/run/run/domain/run.model";

export type GatePayout = {
	readonly gateRewardPaidKb: number;
	readonly clearThisGateKb: number;
	readonly bandBonusThisGateKb: number;
	readonly overflowThisGateKb: number;
	readonly storageBeforeClearKb: number | null;
	readonly interestThisGateKb: number;
	readonly extraPickThisGateKb: number;
	readonly estimateThisGateUnits: number | null;
	readonly faucetThisGateKb: number;
	readonly escrowCommittedKb: number;
	readonly escrowRolledBackKb: number;
	readonly subscriptionBillKb: number;
	readonly upkeepBilledKb: number;
	readonly spaceDroppedTo: number | null;
	readonly autoUpgradedConfig: Config | null;
	readonly autoUpgradedByConfig: Config | null;
	readonly deletedConfigs: readonly Config[];
	readonly lapsedConfigs: readonly Config[];
	readonly clearedGateNumber: number;
	readonly caughtFatalBy: string | null;
	readonly slaUpliftKb: number;
	readonly incidentSurvivalKb: number;
};

export const gatePayoutFor = (state: RunState): GatePayout => ({
	gateRewardPaidKb: state.gateRewardKb ?? 0,
	clearThisGateKb: state.clearThisGateKb ?? 0,
	bandBonusThisGateKb: state.bandBonusThisGateKb ?? 0,
	overflowThisGateKb: state.overflowThisGateKb ?? 0,
	storageBeforeClearKb: state.storageBeforeClearKb ?? null,
	interestThisGateKb: state.interestThisGateKb ?? 0,
	extraPickThisGateKb: state.extraPickThisGateKb ?? 0,
	estimateThisGateUnits: state.estimateThisGateUnits ?? null,
	faucetThisGateKb: state.faucetThisGateKb ?? 0,
	escrowCommittedKb: state.escrowCommittedKb ?? 0,
	escrowRolledBackKb: state.escrowRolledBackKb ?? 0,
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
	clearedGateNumber: state.clearedGate ?? state.gatesCleared,
	caughtFatalBy: state.caughtFatalBy ?? null,
	slaUpliftKb: state.slaUpliftKb ?? 0,
	incidentSurvivalKb: state.incidentSurvivalKb ?? 0,
});
