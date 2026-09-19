import { gateClearPayout } from "~/modules/run/build/domain/build.model";
import { coverageGainPercentFor } from "~/modules/run/build/domain/coverageRatio.model";
import { PEEL_KB_PER_SLOT } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import {
	type PrepWindow,
	prepPropsFor,
} from "~/modules/run/run/application/prepScreen.viewmodel";
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
	/** git rebase -i. Absent leaves the rows in place with no move presses. */
	onRebase?: (from: number, to: number) => void;
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
const asidesFor = (
	{ onBackToShop, onCommunity, backLabel = BACK_TO_SHOP }: PrepViewProps,
	offered: readonly FooterAction[]
): readonly FooterAction[] => [
	...(onBackToShop === undefined
		? []
		: [
				{
					label: backLabel,
					icon: "back" as const,
					iconAt: "lead" as const,
					onPress: onBackToShop,
				},
			]),
	...(onCommunity === undefined
		? []
		: offered.map((exit) => ({ ...exit, onPress: onCommunity }))),
];

export const PrepView = (props: PrepViewProps) => {
	const { view, onStart, startRefusal, onEstimate, onRebase } = props;
	const { gateStake } = view;
	const screen = prepPropsFor({
		gate: gateStake.gateNumber,
		answeredPolls: view.allAnswered,
		configs: view.configs,
		balanceKb: view.storage,
		buildSpace: buildSpaceOf(view),
		window: windowOf(view),
		answeredThisGate: view.answeredThisGate,
		bar: { ...gateStake.coverageLadder, held: gateStake.coverageHeld },
		openingHeld: gateStake.coverageAtOpen,
		coverageGainPercent: coverageGainPercentFor(
			gateStake.perAnswer.coveragePerCorrect,
			gateStake.gateNumber
		),
		peelKb: gateStake.peelSlotsOnFailure * PEEL_KB_PER_SLOT,
		payout: (correct) =>
			gateClearPayout(view.configs, correct, gateStake.gateNumber),
		estimate: view.estimate,
		estimatedCorrect: view.estimatedCorrect,
		rebaseSlots: view.rebaseSlots,
		swatchGates: view.swatchGates,
	});

	return (
		<PrepScreen
			{...screen}
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
