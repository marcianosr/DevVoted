import type { Config } from "~/modules/run/config/domain/config.model";
import { gateDemandFor } from "~/modules/run/gate/domain/gate.model";
import type { RunState } from "~/modules/run/run/domain/run.model";

/** What the gate just cleared paid, and what it took back. */
export type GatePayout = {
	readonly gateRewardPaidKb: number;
	/** Priced off the balance and the window, so the ledger reads them from the reducer rather than recomputing. */
	readonly interestThisGateKb: number;
	readonly extraPickThisGateKb: number;
	readonly faucetThisGateKb: number;
	readonly gateBillPaidKb: number;
	readonly planDowngraded: boolean;
	readonly subscriptionBillKb: number;
	readonly autoUpgradedConfig: Config | null;
	/** Deprecated's exits: faded to x1 and removed themselves. */
	readonly deletedConfigs: readonly Config[];
	/** Freemium's exits: the subscription went unpaid. */
	readonly lapsedConfigs: readonly Config[];
	readonly clearedGateNumber: number;
	/** `gateStake` always describes the gate ahead, which on a clear is the next one. */
	readonly clearedGateDemand: number;
};

export const gatePayoutFor = (state: RunState): GatePayout => {
	const reportedGate = state.clearedGate ?? state.gatesCleared;
	return {
		gateRewardPaidKb: state.gateRewardKb ?? 0,
		interestThisGateKb: state.interestThisGateKb ?? 0,
		extraPickThisGateKb: state.extraPickThisGateKb ?? 0,
		faucetThisGateKb: state.faucetThisGateKb ?? 0,
		gateBillPaidKb: state.gateBillKb ?? 0,
		planDowngraded: state.planDowngraded ?? false,
		subscriptionBillKb: state.subscriptionBillKb ?? 0,
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
