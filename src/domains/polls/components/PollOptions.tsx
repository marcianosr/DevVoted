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
	disabledOptionIds?: number[]; // New prop to receive disabled option IDs
};

export const PollOptions = ({
	poll,
	options,
	field,
	disabled,
	disabledOptionIds,
}: PollOptionsProps) => {
	return (
		<div>
			<h2 className="text-2xl text-theme mb-4">Select your answer(s)!</h2>
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
