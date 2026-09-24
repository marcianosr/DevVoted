import { gateClearPayout } from "~/modules/run/build/domain/build.model";
import { coverageGainPercentFor } from "~/modules/run/build/domain/coverageRatio.model";
import { PEEL_KB_PER_SLOT } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	PREP_COMMUNITY_LABEL,
	type PrepWindow,
	prepPropsFor,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import type { AttackPanelProps } from "~/ui/kanto-theme/AttackPanel.ui";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { PrepScreen } from "~/ui/kanto-theme/PrepScreen.ui";
import type { FooterAction } from "~/ui/kanto-theme/ScreenFooter.ui";

export type PrepViewProps = {
	view: RunView;
	onStart: () => void;
	/** Offered only while the shop is still open behind prep. */
	onBackToShop?: () => void;
	/** The footer's one aside slot falls to this once the shop has closed. */
	onCommunity?: () => void;
	backLabel?: string;
	/** Why the gate cannot start, when it cannot: the wait for tomorrow's polls. */
	startRefusal?: string;
	/** Planning Poker. Absent leaves the cards unpressable rather than hidden. */
	onEstimate?: (count: number) => void;
	onCommitBand?: (band: string) => void;
	/** git rebase -i. Absent leaves the rows in place with no move presses. */
	onRebase?: (from: number, to: number) => void;
	/** The attack in hand and its rivals (ADR-099). Absent on a screen that has not dealt them. */
	attack?: AttackPanelProps;
	onFire?: (targetRunId: number, auditId: AuditId) => void;
};

export const buildSpaceOf = (view: RunView): number => view.buildSpace.space;

const windowOf = (view: RunView): PrepWindow => ({
	answerTypes: view.answerTypesThisGate ?? { single: 0, multiple: 0 },
	optionCounts: view.optionCountsThisGate ?? [],
	categories: view.upcomingCategories ?? [],
	nextCategories: view.nextGateCategories ?? [],
});

const BACK_TO_SHOP = "Back to the shop";
/**
 * Prep is the hub, so it offers both exits at once: back to the shop while it is
 * still open, and on to the community board. The board's own label and icon come
 * from the screen's own footer, so only the handler is wired here.
 */
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

/** Each press fires its own pair; the panel itself only knows labels. */
const armedFor = ({
	attack,
	onFire,
}: PrepViewProps): AttackPanelProps | undefined =>
	attack === undefined
		? undefined
		: {
				...attack,
				rivals: attack.rivals.map((rival) => ({
					...rival,
					payloads: rival.payloads.map((payload) => ({
						...payload,
						onPress:
							onFire === undefined
								? undefined
								: () => onFire(rival.targetRunId, payload.auditId),
					})),
				})),
			};

export const PrepView = (props: PrepViewProps) => {
	const { view, onStart, startRefusal, onEstimate, onCommitBand, onRebase } =
		props;
	const { gateStake } = view;
	const screen = prepPropsFor({
		gate: gateStake.gateNumber,
		answeredPolls: view.allAnswered,
		configs: view.configs,
		audits: gateStake.audits,
		attack: armedFor(props),
		balanceKb: view.storage,
		buildSpace: buildSpaceOf(view),
		window: windowOf(view),
		answeredThisGate: view.answeredThisGate,
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
		swatchGates: view.swatchGates,
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
			footer={{
				...screen.footer,
				action: {
					...screen.footer.action,
					onPress: view.pollsExhausted ? undefined : onStart,
				},
				asides: asidesFor(props, screen.footer.asides ?? []),
				...(startRefusal === undefined ? {} : { refusal: startRefusal }),
			}}
		/>
	);
};
