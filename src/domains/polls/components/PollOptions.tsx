import type { PollOption } from "~/domains/polls/models/pollOption";
import type { Poll } from "~/domains/polls/models/poll";
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
};

export const PollOptions = ({ poll, options, field, disabled }: PollOptionsProps) => {
	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Options</h2>
			<ul className="space-y-2">
				{options.map((option) => (
					<li key={option.id}>
						<Option
							option={option}
							type={poll.answerType === "single" ? "radio" : "checkbox"}
							field={field}
							checked={field.state.value.includes(option.id.toString())}
							disabled={disabled}
						/>
					</li>
				))}
			</ul>
		</div>
	);
};