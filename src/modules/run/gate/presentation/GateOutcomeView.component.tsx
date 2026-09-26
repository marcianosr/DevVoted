import { useState } from "react";

import { coverageGainPercentFor } from "~/modules/run/build/domain/coverageRatio.model";
import { runPaidFor } from "~/modules/run/run/application/pollScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type {
	GateHoldReason,
	GateLadder,
} from "~/modules/run/gate/domain/gate.model";
import {
	closedBarFor,
	type GateAnswer,
	type GateClosing,
	type GateOutcomeFrame,
	gateOutcomePropsFor,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";
import {
	GateOutcomeScreen,
	type GateOutcomeTail,
} from "~/ui/kanto-theme/GateOutcomeScreen.ui";

export type GateVerdict = "cleared" | "held" | "fatal" | "won";

export type GateOutcomeViewProps = {
	view: RunView;
	verdict: GateVerdict;
	onReview: () => void;
	onNext: () => void;
	onCommunity?: () => void;
	onRemove?: (configIds: readonly string[]) => void;
	onRefuse?: () => void;
};

const CLOSING_OF = {
	cleared: "cleared",
	won: "cleared",
	held: "held",
	fatal: "fatal",
} satisfies Record<GateVerdict, GateClosing>;

const coverageOf = (answer: AnsweredPoll): number =>
	answer.coverageEarned ?? -(answer.coverageLost ?? 0);

export const gateAnswersOf = (
	answered: readonly AnsweredPoll[],
	gate: number
): readonly GateAnswer[] =>
	answered.map((answer) => ({
		category: answer.category,
		question: answer.question,
		outcome: answer.outcome,
		share: answer.coverageFactors?.correct,
		coverage: coverageGainPercentFor(coverageOf(answer), gate),
		units: coverageOf(answer),
		answerType: answer.answerType ?? "single",
		options: answer.options ?? [...answer.picked, ...(answer.correct ?? [])],
		picked: answer.picked,
		correct: answer.correct ?? [],
		explanation: answer.explanation,
		codeBlock: answer.codeBlock,
	}));

const gateNumberFor = (view: RunView, verdict: GateVerdict): number =>
	verdict === "held" || verdict === "fatal"
		? view.gateStake.gateNumber
		: view.gatePayout.clearedGateNumber;

const ladderFor = (view: RunView, verdict: GateVerdict): GateLadder =>
	verdict === "held" || verdict === "fatal"
		? view.gateStake.coverageLadder
		: view.gatePayout.clearedGateLadder;

const heldByFor = (
	view: RunView,
	verdict: GateVerdict
): GateHoldReason | undefined =>
	verdict === "held" ? (view.gatePayout.heldBy ?? undefined) : undefined;

const heldFor = (view: RunView, verdict: GateVerdict): number =>
	verdict === "held" || verdict === "fatal"
		? view.gateStake.coverageHeld
		: view.gatePayout.clearedCoverageHeld;

const paidRowsFor = (view: RunView) =>
	view.gatePayout.autoUpgradedConfig === null
		? []
		: [
				{
					config: view.gatePayout.autoUpgradedConfig,
					detail: `upgraded by ${view.gatePayout.autoUpgradedByConfig?.label ?? "the build"}`,
					kb: 0,
				},
			];

export const gateOutcomeFrameOf = (
	view: RunView,
	verdict: GateVerdict,
	chosen: readonly string[],
	onToggle: (configId: string) => void
): GateOutcomeFrame => {
	const cleared = verdict === "cleared" || verdict === "won";
	const gate = gateNumberFor(view, verdict);

	return {
		gate,
		answers: gateAnswersOf(view.answeredThisGate, gate),
		swatchGates: view.swatchGates,
		balanceBeforeKb: view.gatePayout.storageBeforeClearKb ?? view.storage,
		configs: view.configs,
		buildSpace: view.buildSpace.space,
		streak: view.gatePayout.streakAtClose ?? undefined,
		faded: view.gatePayout.lapsedConfigs.map((config) => ({
			config,
			detail: "lapsed on this gate",
		})),
		paid: paidRowsFor(view),
		payouts: runPaidFor(view),
		auditIds: view.gateStake.audits.map((audit) => audit.id),
		chosen,
		onToggle,
		won: verdict === "won",
		heldBy: heldByFor(view, verdict),
		caughtFatalBy: view.gatePayout.caughtFatalBy ?? undefined,
		slaUpliftKb: cleared ? view.gatePayout.slaUpliftKb : 0,
		incidentSurvivalKb: cleared ? view.gatePayout.incidentSurvivalKb : 0,
		auditHanded: cleared && view.gatePayout.auditHanded,
		bar: closedBarFor(
			CLOSING_OF[verdict],
			ladderFor(view, verdict),
			heldFor(view, verdict),
			heldByFor(view, verdict)
		),
		payoutKb: cleared ? view.gatePayout.gateRewardPaidKb : 0,
		clearKb: cleared ? view.gatePayout.clearThisGateKb : 0,
		overflowKb: cleared ? view.gatePayout.overflowThisGateKb : 0,
		interestKb: cleared ? view.gatePayout.interestThisGateKb : 0,
		extraPickKb: cleared ? view.gatePayout.extraPickThisGateKb : 0,
		bonusKb: 0,
		faucetKb: view.gatePayout.faucetThisGateKb,
		escrowCommittedKb: cleared ? view.gatePayout.escrowCommittedKb : 0,
		escrowRolledBackKb: cleared ? 0 : view.gatePayout.escrowRolledBackKb,
		billKb: view.gatePayout.subscriptionBillKb + view.gatePayout.upkeepBilledKb,
	};
};

/**
 * ADR-076 Decision 4's exit. The viewmodel can only offer the arm; the run it
 * ends lives out here, so without this the button was drawn and did nothing.
 */
const refusing = (
	tail: GateOutcomeTail | undefined,
	onRefuse: (() => void) | undefined
): GateOutcomeTail | undefined => {
	if (tail?.choice === undefined || onRefuse === undefined) return tail;

	return {
		choice: {
			...tail.choice,
			refusal: {
				...tail.choice.refusal,
				action: { ...tail.choice.refusal.action, onPress: onRefuse },
			},
		},
	};
};

export const GateOutcomeView = ({
	view,
	verdict,
	onReview,
	onNext,
	onCommunity,
	onRemove,
	onRefuse,
}: GateOutcomeViewProps) => {
	const [chosen, setChosen] = useState<readonly string[]>([]);

	const toggle = (configId: string) =>
		setChosen((held) =>
			held.includes(configId)
				? held.filter((id) => id !== configId)
				: [...held, configId]
		);

	const props = gateOutcomePropsFor(
		gateOutcomeFrameOf(view, verdict, chosen, toggle)
	);
	const settles = verdict === "held" && onRemove !== undefined;
	const commits = props.footer.action.onPress !== undefined;

	return (
		<GateOutcomeScreen
			{...props}
			tail={refusing(props.tail, onRefuse)}
			footer={{
				...props.footer,
				action: {
					...props.footer.action,
					...(settles
						? { onPress: commits ? () => onRemove(chosen) : undefined }
						: { onPress: onNext }),
				},
				asides: (props.footer.asides ?? []).map((aside) => ({
					...aside,
					onPress: aside.icon === "review" ? onReview : onCommunity,
				})),
			}}
		/>
	);
};
