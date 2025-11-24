import { useForm } from "@tanstack/react-form";
// import { useMutation } from "@tanstack/react-query";

import type { ApplyEffects } from "~/domains/configs/data/configs";
import { PollOptions } from "~/domains/polls/components/PollOptions";
import { Poll } from "~/domains/polls/models/poll";
import { PollOption } from "~/domains/polls/models/pollOption";
import { PrimaryButton } from "~/ui/PrimaryButton";

// TODO: move

type PollOptionsFormProps = {
	poll: Poll;
	options: PollOption[];
	hasAnswered: boolean;
	effect: ApplyEffects;
	selectedOptions: string[];
	// mutation: ReturnType<typeof useMutation>;
	mutation: any;
};

const PollOptionsForm = ({
	poll,
	options,
	hasAnswered,
	effect,
	selectedOptions,
	mutation,
}: PollOptionsFormProps) => {
	const { Field, handleSubmit } = useForm({
		defaultValues: {
			selectedOptions: (selectedOptions ?? []) as Array<string>,
		},
		onSubmit: async ({ value }) => {
			mutation.mutate({
				data: {
					pollId: poll.id,
					selectedOptions: value.selectedOptions,
				},
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<Field
				name="selectedOptions"
				validators={{
					onSubmit: ({ value }) => {
						if (!value || value.length === 0) {
							return "Please select at least one answer";
						}
						return undefined;
					},
				}}
			>
				{(field) => (
					<>
						<PollOptions
							poll={poll}
							options={options}
							field={field}
							disabled={hasAnswered}
							disabledOptionIds={effect.renderProps.disabledOptionIds}
						/>
						{field.state.meta.errors.length > 0 && (
							<div className="text-red-500 text-xl my-2">
								{field.state.meta.errors[0]}
							</div>
						)}
					</>
				)}
			</Field>
			<PrimaryButton type="submit" disabled={mutation.isPending}>
				{mutation.isPending ? "Submitting..." : "Submit answers"}
			</PrimaryButton>
		</form>
	);
};

export default PollOptionsForm;
