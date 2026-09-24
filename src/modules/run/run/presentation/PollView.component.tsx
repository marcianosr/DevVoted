import { useState } from "react";

import {
	answeredOptionsFor,
	auditPropsOf,
	buildCountsOf,
	categoryNameOf,
	type PressAction,
	letterAt,
	pollBarFor,
	coverageLeadFor,
	pollFactsFor,
	categoryLeaderFor,
	pollHoldsFor,
	pollLabelFor,
	pollPaidFor,
	pollBuildFor,
	gateLabelFor,
	pollHeaderFor,
	pollKeysFor,
	pollCommitFor,
} from "~/modules/run/run/application/pollScreen.viewmodel";
import { usePollKeyboard } from "~/modules/run/run/application/usePollKeyboard.hook";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { kbLabel } from "~/shared/lib/storage";
import {
	PollScreen,
	type PollScreenProps,
} from "~/ui/kanto-theme/PollScreen.ui";
import type { AuthorProps } from "~/ui/kanto-theme/Author.ui";
import type {
	QuestionOption,
	QuestionProps,
} from "~/ui/kanto-theme/Question.ui";

export type PollViewProps = {
	view: RunView;
	answered?: AnsweredPoll;
	selectedOptionIds: readonly string[];
	onSelect: (optionId: string) => void;
	onSubmit: () => void;
	onNext: () => void;
	onPress?: (action: PressAction, configId: string) => void;
	onUnseal?: (optionId: string) => void;
};

type LivePoll = NonNullable<RunView["poll"]>;

const NEXT_LABEL = "Next poll";
const ENTER_CONTINUES = "Or click ENTER";

const wrongCostOf = (view: RunView): string | undefined => {
	const cost = view.gateStake.perAnswer.coveragePerWrong;
	return cost === 0 ? undefined : `${Math.abs(cost).toFixed(1)}`;
};

const optionsOf = (
	poll: LivePoll,
	view: RunView,
	onUnseal: ((optionId: string) => void) | undefined
): readonly QuestionOption[] =>
	poll.options.map((option, index) =>
		view.hiddenOptionIds.includes(option.id)
			? {
					id: option.id,
					letter: letterAt(index),
					seal: {
						price: kbLabel(view.buyBack.costKb),
						onUnseal:
							onUnseal === undefined || !view.buyBack.ready
								? undefined
								: () => onUnseal(option.id),
					},
				}
			: {
					id: option.id,
					letter: letterAt(index),
					label: option.label,
					crossedOut: view.disabledOptionIds.includes(option.id),
				}
	);

const liveQuestionFor = (
	view: RunView,
	poll: LivePoll,
	selectedOptionIds: readonly string[],
	onSelect: (optionId: string) => void,
	onUnseal: ((optionId: string) => void) | undefined
): QuestionProps => ({
	answerType: poll.answerType,
	question: poll.question,
	options: optionsOf(poll, view, onUnseal),
	codeBlock: poll.codeBlock,
	pickedIds: selectedOptionIds,
	onPick: onSelect,
});

const answeredQuestionFor = (answered: AnsweredPoll): QuestionProps => ({
	answerType: answered.answerType ?? "single",
	question: answered.question,
	options: answeredOptionsFor(answered),
	codeBlock: answered.codeBlock,
	pickedIds: answered.picked,
});

const authorOf = (poll: LivePoll): AuthorProps | undefined =>
	poll.author === undefined
		? undefined
		: {
				handle: poll.author.handle,
				title: poll.author.title,
				photoUrl: poll.author.avatarUrl,
				borderUrl: poll.author.borderUrl,
			};

const enterActionFor = (
	revealing: boolean,
	picked: boolean,
	onSubmit: () => void,
	onNext: () => void
): (() => void) | undefined => {
	if (revealing) return onNext;
	return picked ? onSubmit : undefined;
};

type PollMood = Pick<
	PollScreenProps,
	| "question"
	| "category"
	| "categoryColor"
	| "wrongCost"
	| "hint"
	| "author"
	| "commit"
	| "categoryLeader"
	| "footer"
>;

const answeredMoodFor = (
	view: RunView,
	answered: AnsweredPoll,
	onNext: () => void
): PollMood => ({
	question: answeredQuestionFor(answered),
	category: categoryNameOf(view, answered.category),
	hint: answered.explanation,
	footer: {
		action: {
			label: view.gateComplete
				? gateLabelFor(view.gateStake.gateNumber)
				: NEXT_LABEL,
			icon: "gate",
			onPress: onNext,
		},
		note: ENTER_CONTINUES,
		noteAt: "row",
	},
});

const liveMoodFor = (
	view: RunView,
	poll: LivePoll,
	selectedOptionIds: readonly string[],
	onSelect: (optionId: string) => void,
	onSubmit: () => void,
	onUnseal: ((optionId: string) => void) | undefined
): PollMood => ({
	question: liveQuestionFor(view, poll, selectedOptionIds, onSelect, onUnseal),
	category: categoryNameOf(view, poll.category),
	wrongCost: wrongCostOf(view),
	author: authorOf(poll),
	categoryLeader: categoryLeaderFor(view, poll),
	commit: pollCommitFor(poll.answerType, selectedOptionIds.length, onSubmit),
});

export const PollView = ({
	view,
	answered,
	selectedOptionIds,
	onSelect,
	onSubmit,
	onNext,
	onPress,
	onUnseal,
}: PollViewProps) => {
	const [openInfo, setOpenInfo] = useState<string | undefined>(undefined);
	const revealing = answered !== undefined;

	usePollKeyboard({
		keys: revealing ? [] : pollKeysFor(view),
		onPick: revealing ? undefined : onSelect,
		onEnter: enterActionFor(
			revealing,
			selectedOptionIds.length > 0,
			onSubmit,
			onNext
		),
	});

	const live = view.poll ?? undefined;
	const mood =
		answered !== undefined
			? answeredMoodFor(view, answered, onNext)
			: live === undefined
				? undefined
				: liveMoodFor(
						view,
						live,
						selectedOptionIds,
						onSelect,
						onSubmit,
						onUnseal
					);

	if (mood === undefined) return null;

	return (
		<PollScreen
			{...mood}
			header={pollHeaderFor(view)}
			coverage={{
				bar: pollBarFor(view, answered !== undefined),
				lead: coverageLeadFor(view),
				paid: pollPaidFor(view),
			}}
			pollLabel={pollLabelFor(view, revealing)}
			holds={pollHoldsFor(view)}
			facts={pollFactsFor(live)}
			audits={auditPropsOf(view.audits)}
			buildFooter={{
				build: pollBuildFor(
					view,
					{
						openInfo,
						onToggleInfo: (name) =>
							setOpenInfo(name === openInfo ? undefined : name),
						onPress,
					},
					answered
				),
				counts: buildCountsOf(view),
				flash: answered?.id,
			}}
		/>
	);
};
