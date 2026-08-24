import type { AnsweredPoll } from "~/modules/run/run/domain/run.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	ReviewScreen,
	type ReviewPoll,
} from "~/ui/modern-theme/screens/ReviewScreen.ui";
import type { AnswerOption } from "~/ui/modern-theme/Verdict.ui";

const optionsOf = (poll: AnsweredPoll): readonly string[] =>
	poll.options ?? [...new Set([...poll.picked, ...(poll.correct ?? [])])];

const answersOf = (poll: AnsweredPoll): readonly AnswerOption[] => {
	const expected = new Set(poll.correct ?? []);
	const received = new Set(poll.picked);

	return optionsOf(poll).map((label) => ({
		id: label,
		label,
		expected: expected.has(label),
		received: received.has(label),
	}));
};

const codeLines = (block: string | undefined): readonly string[] | undefined =>
	block?.split("\n");

const toReviewPoll = (poll: AnsweredPoll, index: number): ReviewPoll => ({
	// The engine reuses a poll id across gates when the pool cycles, so the
	// position disambiguates what the id alone cannot.
	id: `${poll.id}-${index}`,
	outcome: poll.outcome,
	question: poll.question,
	score: poll.coverageEarned ?? 0,
	options: answersOf(poll),
	code: codeLines(poll.codeBlock),
	explainer: poll.explanation,
});

export type ReviewViewProps = {
	view: RunView;
	back: { label: string; onUse: () => void };
};

export const ReviewView = ({ view, back }: ReviewViewProps) => {
	const gate = view.gateStake.gateNumber;

	return (
		<ReviewScreen
			theme={view.gateTheme}
			gateName={swatchForGate(gate)?.gateName ?? ""}
			gate={gate}
			polls={view.answeredThisGate.map(toReviewPoll)}
			back={back}
		/>
	);
};
