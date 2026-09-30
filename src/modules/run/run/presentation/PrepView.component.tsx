import { gateClearPayout } from "~/modules/run/build/domain/build.model";
import { coverageGainPercentFor } from "~/modules/run/build/domain/coverageRatio.model";
import { PEEL_KB_PER_SLOT } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import { VENDOR_REMEDY } from "~/modules/run/build/application/vendorChip.viewmodel";
import {
	PREP_COMMUNITY_LABEL,
	type PrepWindow,
	commitmentRemedy,
	prepPropsFor,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import type { ApprovalBoard } from "~/modules/run/run/domain/approval.model";
import { runReadoutFor } from "~/modules/run/run/application/runReadout.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { POLLS_SPENT } from "~/shared/lib/copy";
import { PrepScreen } from "~/ui/kanto-theme/PrepScreen.ui";
import type { FooterAction } from "~/ui/kanto-theme/ScreenFooter.ui";

export type PrepViewProps = {
	view: RunView;
	runNumber?: number | null;
	onStart: () => void;
	onBackToShop?: () => void;
	onCommunity?: () => void;
	backLabel?: string;
	startRefusal?: string;
	onEstimate?: (count: number) => void;
	onCommitBand?: (band: string) => void;
	onRebase?: (from: number, to: number) => void;
	approval?: ApprovalBoard | null;
	onApprove?: (pollId: string) => void;
};

export const buildSpaceOf = (view: RunView): number => view.buildSpace.space;

const windowOf = (view: RunView): PrepWindow => ({
	answerTypes: view.answerTypesThisGate ?? { single: 0, multiple: 0 },
	optionCounts: view.optionCountsThisGate ?? [],
	categories: view.upcomingCategories ?? [],
	nextCategories: view.nextGateCategories ?? [],
});

const BACK_TO_SHOP = "Back to the shop";
const asideHandlerFor = (
	{ onCommunity }: PrepViewProps,
	label: string
): (() => void) | undefined =>
	label === PREP_COMMUNITY_LABEL ? onCommunity : undefined;

const asidesFor = (
	props: PrepViewProps,
	offered: readonly FooterAction[]
): readonly FooterAction[] => [
	...(props.onBackToShop === undefined
		? []
		: [
				{
					label: props.backLabel ?? BACK_TO_SHOP,
					icon: "back" as const,
					iconAt: "lead" as const,
					onPress: props.onBackToShop,
				},
			]),
	...offered.flatMap((exit) => {
		const onPress = asideHandlerFor(props, exit.label);
		return onPress === undefined ? [] : [{ ...exit, onPress }];
	}),
];

const startRefusalFor = (
	view: RunView,
	stated: string | undefined
): string | undefined => {
	if (stated !== undefined) return stated;
	if (view.pollsExhausted) return POLLS_SPENT;
	if (view.vendorLock.offered) return VENDOR_REMEDY;
	return commitmentRemedy(view);
};

export const PrepView = (props: PrepViewProps) => {
	const {
		view,
		runNumber = null,
		onStart,
		startRefusal,
		onEstimate,
		onCommitBand,
		onRebase,
		approval,
		onApprove,
	} = props;
	const { gateStake } = view;
	const refusal = startRefusalFor(view, startRefusal);
	const held = refusal !== undefined;
	const screen = prepPropsFor({
		gate: gateStake.gateNumber,
		answeredPolls: view.allAnswered,
		scoredThisGate: view.scoredThisGate,
		configs: view.configs,
		audits: gateStake.audits,
		balanceKb: view.storage,
		buildSpace: buildSpaceOf(view),
		spaceBillKb: view.buildSpace.perGateKb,
		window: windowOf(view),
		bar: { ...gateStake.coverageLadder, held: gateStake.coverageHeld },
		coverageGainPercent: coverageGainPercentFor(
			gateStake.perAnswer.coveragePerCorrect,
			gateStake.gateNumber
		),
		peelKb: gateStake.peelSlotsOnFailure * PEEL_KB_PER_SLOT,
		payout: (correct) =>
			gateClearPayout(view.configs, correct, gateStake.gateNumber),
		estimate: view.estimate,
		estimatedCorrect: view.estimatedCorrect,
		sla: view.sla,
		slaBand: view.slaBand,
		rebaseSlots: view.rebaseSlots,
		approval: approval ?? null,
		approvedPollId: view.approvedPollId,
		swatchGates: view.swatchGates,
		outageTargets: view.outageTargets,
		readout: runReadoutFor(view, runNumber),
	});

	return (
		<PrepScreen
			{...screen}
			sla={
				screen.sla === undefined
					? undefined
					: { ...screen.sla, onPick: onCommitBand }
			}
			estimate={
				screen.estimate === undefined
					? undefined
					: { ...screen.estimate, onPick: onEstimate }
			}
			rebase={
				screen.rebase === undefined
					? undefined
					: { ...screen.rebase, onMove: onRebase }
			}
			approval={
				screen.approval === undefined
					? undefined
					: {
							...screen.approval,
							...(screen.approval.refusal === undefined ? { onApprove } : {}),
						}
			}
			footer={{
				...screen.footer,
				action: {
					...screen.footer.action,
					onPress: held ? undefined : onStart,
				},
				asides: asidesFor(props, screen.footer.asides ?? []),
				...(refusal === undefined ? {} : { refusal }),
			}}
		/>
	);
};
