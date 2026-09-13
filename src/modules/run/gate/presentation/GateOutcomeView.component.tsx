import { useState } from "react";

import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { GateLadder } from "~/modules/run/gate/domain/gate.model";
import {
	closedBarFor,
	type GateAnswer,
	type GateClosing,
	type GateOutcomeFrame,
	gateOutcomePropsFor,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";
import { GateOutcomeScreen } from "~/ui/kanto-theme/GateOutcomeScreen.ui";

export type GateVerdict = "cleared" | "held" | "fatal" | "won";

export type GateOutcomeViewProps = {
	view: RunView;
	verdict: GateVerdict;
	onReview: () => void;
	onNext: () => void;
	onCommunity?: () => void;
	onRemove?: (configIds: readonly string[]) => void;
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
	answered: readonly AnsweredPoll[]
): readonly GateAnswer[] =>
	answered.map((answer) => ({
		category: answer.category,
		question: answer.question,
		outcome: answer.outcome,
		coverage: coverageOf(answer),
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

const heldFor = (view: RunView, verdict: GateVerdict): number =>
	verdict === "held" || verdict === "fatal"
		? view.gateStake.coverageHeld
		: gateAnswersOf(view.answeredThisGate).reduce(
				(sum, answer) => sum + Math.max(0, answer.coverage),
				0
			);

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
		answers: gateAnswersOf(view.answeredThisGate),
		balanceBeforeKb: view.gatePayout.storageBeforeClearKb ?? view.storage,
		configs: view.configs,
		planTier: view.storagePlan.options.find((option) => option.held)?.tier ?? 0,
		streak: view.gatesCleared,
		faded: view.gatePayout.lapsedConfigs.map((config) => ({
			config,
			detail: "lapsed on this gate",
		})),
		paid: paidRowsFor(view),
		auditIds: view.gateStake.audits.map((audit) => audit.id),
		chosen,
		onToggle,
		won: verdict === "won",
		bar: closedBarFor(
			CLOSING_OF[verdict],
			ladderFor(view, verdict),
			heldFor(view, verdict)
		),
		payoutKb: cleared ? view.gatePayout.gateRewardPaidKb : 0,
		bonusKb: 0,
		faucetKb: view.gatePayout.faucetThisGateKb,
		billKb: view.gatePayout.subscriptionBillKb + view.gatePayout.planBilledKb,
	};
};

export const GateOutcomeView = ({
	view,
	verdict,
	onReview,
	onNext,
	onCommunity,
	onRemove,
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
			answers={{
				...props.answers,
				...(props.answers.review === undefined
					? {}
					: {
							review: { ...props.answers.review, onPress: onReview },
						}),
			}}
			footer={{
				...props.footer,
				action: {
					...props.footer.action,
					...(settles
						? { onPress: commits ? () => onRemove(chosen) : undefined }
						: { onPress: onNext }),
				},
				...(props.footer.aside === undefined
					? {}
					: {
							aside: {
								...props.footer.aside,
								onPress:
									props.footer.aside.icon === "review" ? onReview : onCommunity,
							},
						}),
			}}
		/>
	);
};
