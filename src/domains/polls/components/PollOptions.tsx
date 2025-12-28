import { CommunityStats } from "~/domains/polls/api/queries";
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
	communityStats: CommunityStats | null;
};

export const PollOptions = ({
	poll,
	options,
	field,
	disabled,
	disabledOptionIds,
	countCorrect,
	communityStats,
}: PollOptionsProps) => {
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
					<li
						key={option.id}
						className="text-xl flex flex-wrap gap-2 items-baseline"
					>
						<Option
							option={option}
							type={poll.answerType === "single" ? "radio" : "checkbox"}
							field={field}
							checked={field.state.value.includes(option.id.toString())}
							disabled={disabled || disabledOptionIds?.includes(option.id)}
						/>
						{communityStats &&
							(() => {
								const usersWhoChose = communityStats.users.filter(
									(user) => user.responseData?.selectedOption === option.id
								);
								return usersWhoChose.length > 0 ? (
									<div className="text-theme flex items-center">
										{usersWhoChose.map((user) => (
											<span
												className="text-xl"
												key={user.id}
												title={user.displayName ?? user.email}
											>
												👤
											</span>
										))}
									</div>
								) : null;
							})()}
					</li>
				))}
			</ul>
		</div>
	);
};
