import { useState } from "react";

import {
	auditPropsOf,
	buildCountsOf,
	categoryNameOf,
	type PressAction,
	letterAt,
	pollBarFor,
	pollBuildFor,
	gateLabelFor,
	pollHeaderFor,
	trailFor,
} from "~/modules/run/run/application/pollScreen.viewmodel";
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
import type { ScreenFooterProps } from "~/ui/kanto-theme/ScreenFooter.ui";
import type { TrailProps } from "~/ui/kanto-theme/Trail.ui";

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

const SUBMIT_LABEL = "Submit answer";
const NEXT_LABEL = "Next poll";
const PICK_FIRST = "pick an answer first";
const SINGLE_HINT = "tap an answer to lock it in";
const MULTIPLE_HINT = "pick every answer that fits, then submit";

const wrongCostOf = (view: RunView): string | undefined => {
	const cost = view.gateStake.perAnswer.coveragePerWrong;
	return cost === 0 ? undefined : `${Math.abs(cost).toFixed(1)}`;
};

const optionsOf = (
	poll: LivePoll,
	hiddenOptionIds: readonly string[],
	buyBack: RunView["buyBack"],
	onUnseal: ((optionId: string) => void) | undefined
): readonly QuestionOption[] =>
	poll.options.map((option, index) =>
		hiddenOptionIds.includes(option.id)
			? {
					id: option.id,
					letter: letterAt(index),
					seal: {
						price: kbLabel(buyBack.costKb),
						onUnseal:
							onUnseal === undefined || !buyBack.ready
								? undefined
								: () => onUnseal(option.id),
					},
				}
			: { id: option.id, letter: letterAt(index), label: option.label }
	);

const answeredOptionsOf = (
	answered: AnsweredPoll
): readonly QuestionOption[] => {
	const labels = answered.options ?? [
		...new Set([...answered.picked, ...(answered.correct ?? [])]),
	];

	return labels.map((label, index) => ({
		id: label,
		letter: letterAt(index),
		label,
	}));
};

const liveQuestionFor = (
	view: RunView,
	poll: LivePoll,
	selectedOptionIds: readonly string[],
	onSelect: (optionId: string) => void,
	onUnseal: ((optionId: string) => void) | undefined
): QuestionProps => ({
	category: categoryNameOf(view, poll.category),
	answerType: poll.answerType,
	question: poll.question,
	options: optionsOf(poll, view.hiddenOptionIds, view.buyBack, onUnseal),
	codeBlock: poll.codeBlock,
	pickedIds: selectedOptionIds,
	onPick: onSelect,
	wrongCost: wrongCostOf(view),
});

const answeredQuestionFor = (
	view: RunView,
	answered: AnsweredPoll
): QuestionProps => ({
	category: categoryNameOf(view, answered.category),
	answerType: answered.answerType ?? "single",
	question: answered.question,
	options: answeredOptionsOf(answered),
	codeBlock: answered.codeBlock,
	pickedIds: answered.picked,
});

const authorOf = (poll: LivePoll): AuthorProps | undefined =>
	poll.author === undefined
		? undefined
		: {
				handle: poll.author.handle,
				title: poll.author.title,
				borderUrl: poll.author.borderUrl,
			};

const submitFooterFor = (
	picked: boolean,
	onSubmit: () => void
): ScreenFooterProps => ({
	action: { label: SUBMIT_LABEL, onPress: picked ? onSubmit : undefined },
	refusal: picked ? undefined : PICK_FIRST,
});

const liveFooterFor = (
	poll: LivePoll,
	picked: boolean,
	onSubmit: () => void
): ScreenFooterProps | undefined =>
	poll.answerType === "multiple"
		? submitFooterFor(picked, onSubmit)
		: undefined;

const answeredTrailFor = (view: RunView): TrailProps => ({
	...trailFor(view),
	current: view.answeredThisGate.length,
});

const liveHintFor = (poll: LivePoll) =>
	poll.answerType === "multiple" ? MULTIPLE_HINT : SINGLE_HINT;

type PollMood = Pick<
	PollScreenProps,
	"question" | "trail" | "hint" | "author" | "footer"
>;

const answeredMoodFor = (
	view: RunView,
	answered: AnsweredPoll,
	onNext: () => void
): PollMood => ({
	question: answeredQuestionFor(view, answered),
	trail: answeredTrailFor(view),
	hint: answered.explanation,
	footer: {
		action: {
			label: view.gateComplete
				? gateLabelFor(view.gateStake.gateNumber)
				: NEXT_LABEL,
			icon: "gate",
			onPress: onNext,
		},
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
	trail: trailFor(view),
	hint: liveHintFor(poll),
	author: authorOf(poll),
	footer: liveFooterFor(poll, selectedOptionIds.length > 0, onSubmit),
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
			header={pollHeaderFor(view, pollBarFor(view, answered !== undefined))}
			audits={auditPropsOf(view.audits)}
			buildFooter={{
				build: pollBuildFor(view, {
					openInfo,
					onToggleInfo: (name) =>
						setOpenInfo(name === openInfo ? undefined : name),
					onPress,
				}),
				counts: buildCountsOf(view),
			}}
		/>
	);
};
