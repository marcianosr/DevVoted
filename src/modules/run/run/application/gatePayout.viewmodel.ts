import type { Config } from "~/modules/run/config/domain/config.model";
import {
	percentOf,
	runCoverageOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	type GateHoldReason,
	type GateLadder,
	gateLadderFor,
} from "~/modules/run/gate/domain/gate.model";
import { type RunState, scheduleOf } from "~/modules/run/run/domain/run.model";
import { roundToOneDecimal } from "~/modules/run/run/domain/rules.model";

export type GatePayout = {
	readonly gateRewardPaidKb: number;
	readonly clearThisGateKb: number;
	readonly overflowThisGateKb: number;
	readonly streakAtClose: number | null;
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
	readonly clearedGateLadder: GateLadder;
	readonly clearedCoverageHeld: number;
	/** Why the gate in front held, while it is held. */
	readonly heldBy: GateHoldReason | null;
	readonly caughtFatalBy: string | null;
	readonly slaUpliftKb: number;
	/** What surviving rivals' audits paid on this clear, inside the reward. */
	readonly incidentSurvivalKb: number;
	/** Whether this clear armed or upgraded the run's attack (ADR-099). */
	readonly attackEarned: boolean;
};

export const gatePayoutFor = (state: RunState): GatePayout => {
	const reportedGate = state.clearedGate ?? state.gatesCleared;
	return {
		gateRewardPaidKb: state.gateRewardKb ?? 0,
		clearThisGateKb: state.clearThisGateKb ?? 0,
		overflowThisGateKb: state.overflowThisGateKb ?? 0,
		streakAtClose: state.streakAtClose ?? null,
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
		clearedGateNumber: reportedGate,
		clearedGateLadder: gateLadderFor(
			state.build.configs,
			reportedGate,
			scheduleOf(state)
		),
		clearedCoverageHeld: roundToOneDecimal(
			percentOf(runCoverageOf(state.bankedUnits, reportedGate))
		),
		heldBy: state.heldBy ?? null,
		caughtFatalBy: state.caughtFatalBy ?? null,
		slaUpliftKb: state.slaUpliftKb ?? 0,
		incidentSurvivalKb: state.incidentSurvivalKb ?? 0,
		attackEarned: state.attackEarnedAtGate === reportedGate,
	};
};
