import type { Poll } from "~/domains/polls/models/poll";
import type { PollOption } from "~/domains/polls/models/pollOption";

import Option from "./Option";

type FormFieldApi = {
	state: {
		value: string[];
	};
	setValue: (value: string[]) => void;
};

type PollOptionsProps = {
	poll: Poll;
	options: PollOption[];
	field: FormFieldApi;
	disabled: boolean;
	disabledOptionIds?: number[];
	countCorrect?: boolean;
};

export const PollOptions = ({
	poll,
	options,
	field,
	disabled,
	disabledOptionIds,
	countCorrect,
}: PollOptionsProps) => {
	// Derive correct answer count from current selection - always in sync!
	const selectedCorrectCount = options.filter(
		(opt) => opt.correct && field.state.value.includes(opt.id.toString())
	).length;

	return (
		<div>
			<h2 className="text-2xl text-theme mb-4">Select your answer(s)!</h2>
			{countCorrect && (
				<div className="my-2">
					{selectedCorrectCount > 0 ? (
						<p className="text-green-400 text-xl">
							You selected at least one correct answer!
						</p>
					) : (
						<p className="text-red-400 text-xl">
							You have not selected a correct answer yet.
						</p>
					)}
				</div>
			)}
			<ul className="space-y-2">
				{options.map((option) => (
					<li key={option.id} className="text-xl">
						<Option
							option={option}
							type={poll.answerType === "single" ? "radio" : "checkbox"}
							field={field}
							checked={field.state.value.includes(option.id.toString())}
							disabled={disabled || disabledOptionIds?.includes(option.id)}
						/>
					</li>
				))}
			</ul>
		</div>
	);
};
