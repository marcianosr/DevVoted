import { pollVotesOf } from "~/modules/run/community/application/communityScreen.viewmodel";
import { useReviewPolls } from "~/modules/run/community/application/useReviewPolls.hook";
import { reviewPropsFor } from "~/modules/run/gate/application/gateReview.viewmodel";
import {
	type GateAnswer,
	gateAnswersOf,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { ReviewScreen } from "~/ui/kanto-theme/ReviewScreen.ui";

export type ReviewViewProps = {
	view: RunView;
	back: { label: string; onUse: () => void };
};

const gateOf = (view: RunView): number =>
	view.status === "rewarding"
		? view.gatePayout.clearedGateNumber
		: view.gateStake.gateNumber;

const isPollId = (id: number): boolean => Number.isInteger(id) && id > 0;

const pollIdsOf = (answers: readonly GateAnswer[]): number[] =>
	answers.map((answer) => Number(answer.pollId)).filter(isPollId);

export const ReviewView = ({ view, back }: ReviewViewProps) => {
	const gate = gateOf(view);
	const answers = gateAnswersOf(view.answeredThisGate, gate);
	const reviewPolls = useReviewPolls(pollIdsOf(answers));
	const props = reviewPropsFor({
		gate,
		answers,
		swatchGates: view.swatchGates,
		balanceKb: view.storage,
		votes: pollVotesOf(reviewPolls.view ?? []),
	});

	return (
		<ReviewScreen
			{...props}
			footer={{
				...props.footer,
				action: { label: back.label, onPress: back.onUse },
			}}
		/>
	);
};
