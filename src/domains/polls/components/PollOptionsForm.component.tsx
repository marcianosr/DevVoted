import { useForm } from "@tanstack/react-form";

import type { ApplyEffects } from "~/domains/economy/data/configs";
import { postPollOptions } from "~/domains/polls/api/polls";
import { RandomDailyAnswer } from "~/domains/polls/api/communityStats.queries";
import { PollCodeBlock } from "~/domains/polls/components/PollCodeBlock.component";
import { PollCodeSandboxEmbed } from "~/domains/polls/components/PollCodeSandboxEmbed.component";
import { Poll } from "~/domains/polls/models/poll.model";
import { PollOption } from "~/domains/polls/models/pollOption.model";
import { toggleOptionSelection } from "~/domains/polls/utils/optionSelection";
import { PollAnsweringScreen } from "~/ui/polls/PollAnsweringScreen.ui";
import type { ActivePollConfig } from "~/ui/polls/PollActiveConfigStrip.ui";
import type { PollAnsweringLiveHint } from "~/ui/polls/PollAnsweringScreen.ui";
import type { PollAnsweringOption } from "~/ui/polls/PollOptionList.ui";

import type { UseMutationResult } from "@tanstack/react-query";

type PollOptionsFormProps = {
	poll: Poll;
	options: PollOption[];
	hasAnswered: boolean;
	effect: ApplyEffects;
	selectedOptions: string[];
	activeConfigs: ActivePollConfig[];
	mutation: UseMutationResult<
		Awaited<ReturnType<typeof postPollOptions>>,
		Error,
		Parameters<typeof postPollOptions>[0]
	>;
	randomAnswer: RandomDailyAnswer | null;
};

const buildLiveHint = (
	effect: ApplyEffects,
	selectedCorrectCount: number
): PollAnsweringLiveHint | undefined => {
	if (effect.showCorrectCount) {
		return {
			tone: "correct",
			text: `You have selected ${selectedCorrectCount} correct answer${selectedCorrectCount === 1 ? "" : "s"}`,
		};
	}
	if (effect.countCorrect) {
		return selectedCorrectCount > 0
			? { tone: "correct", text: "You selected at least one correct answer!" }
			: {
					tone: "incorrect",
					text: "You have not selected a correct answer yet.",
				};
	}
	return undefined;
};

const PollOptionsForm = ({
	poll,
	options,
	hasAnswered,
	effect,
	selectedOptions,
	activeConfigs,
	mutation,
	randomAnswer,
}: PollOptionsFormProps) => {
	const { Field, handleSubmit } = useForm({
		defaultValues: {
			selectedOptions: (selectedOptions ?? []) as Array<string>,
		},
		onSubmit: async ({ value }) => {
			mutation.mutate({
				data: { pollId: poll.id, selectedOptions: value.selectedOptions },
			});
		},
	});

	const disabledOptionIds = effect.renderProps.disabledOptionIds ?? [];
	const eslintActive = disabledOptionIds.length > 0;

	const codeSlot = (
		<>
			{poll.codeSandboxExample && (
				<PollCodeSandboxEmbed url={poll.codeSandboxExample} />
			)}
			{poll.codeBlock && <PollCodeBlock code={poll.codeBlock} />}
		</>
	);

	const answeringOptions: PollAnsweringOption[] = options.map((option) => ({
		id: option.id.toString(),
		text: option.option,
		disabled: hasAnswered || disabledOptionIds.includes(option.id),
		markerEmoji:
			randomAnswer?.selectedOptionId === option.id ? "👤" : undefined,
		markerTitle:
			randomAnswer?.selectedOptionId === option.id
				? `${randomAnswer.user.displayName ?? "Someone"} picked this`
				: undefined,
	}));

	return (
		<Field
			name="selectedOptions"
			validators={{
				onSubmit: ({ value }) =>
					!value || value.length === 0
						? "Please select at least one answer"
						: undefined,
			}}
		>
			{(field) => {
				const selectedIds = field.state.value;
				const selectedCorrectCount = options.filter(
					(option) =>
						option.correct && selectedIds.includes(option.id.toString())
				).length;

				return (
					<PollAnsweringScreen
						question={poll.question}
						answerType={poll.answerType}
						activeConfigs={activeConfigs}
						options={answeringOptions}
						selectedIds={selectedIds}
						liveHint={buildLiveHint(effect, selectedCorrectCount)}
						onToggle={(optionId) =>
							field.setValue(
								toggleOptionSelection(selectedIds, optionId, poll.answerType)
							)
						}
						submit={{
							canSubmit: selectedIds.length > 0,
							isSubmitting: mutation.isPending,
							submitted: mutation.isSuccess,
							eslintActive,
							hint: "Pick an option to continue.",
							error:
								field.state.meta.errors[0]?.toString() ??
								(mutation.isError
									? `Error submitting answers: ${mutation.error.message}`
									: undefined),
							onSubmit: handleSubmit,
						}}
						codeSlot={codeSlot}
					/>
				);
			}}
		</Field>
	);
};

export default PollOptionsForm;
