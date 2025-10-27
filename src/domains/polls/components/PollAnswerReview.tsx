import type { Poll } from "~/domains/polls/models/poll";
import type { PollOption } from "~/domains/polls/models/pollOption";

type PollAnswerReviewProps = {
	poll: Poll;
	options: PollOption[];
	selectedOptionIds: number[];
	correctOptionIds: number[];
	isCorrect: boolean;
};

export const PollAnswerReview = ({
	poll,
	options,
	selectedOptionIds,
	correctOptionIds,
	isCorrect,
}: PollAnswerReviewProps) => {
	const correctCount = selectedOptionIds.filter((id) =>
		correctOptionIds.includes(id)
	).length;

	const getOptionStyle = (option: PollOption) => {
		const isSelected = selectedOptionIds.includes(option.id);
		const isCorrectOption = correctOptionIds.includes(option.id);

		if (isSelected && isCorrectOption) {
			return {
				bg: "bg-green-900/30",
				border: "border-green-500",
				text: "text-green-400",
				icon: "✅",
			};
		}

		if (isSelected && !isCorrectOption) {
			return {
				bg: "bg-red-900/30",
				border: "border-red-500",
				text: "text-red-400",
				icon: "❌",
			};
		}

		if (!isSelected && isCorrectOption) {
			return {
				bg: "bg-green-900/10",
				border: "border-green-700",
				text: "text-green-500",
				icon: "✅",
			};
		}

		return {
			bg: "bg-gray-900/20",
			border: "border-gray-700",
			text: "text-gray-500",
			icon: "❌",
		};
	};

	return (
		<div className="mb-6">
			<h3 className="text-theme font-bold mb-4 text-lg">Answer Review</h3>

			<div className="space-y-2">
				{options.map((option) => {
					const style = getOptionStyle(option);
					const isSelected = selectedOptionIds.includes(option.id);

					return (
						<div
							key={option.id}
							className={`p-3 border ${style.border} ${style.bg} flex items-start gap-3`}
						>
							<span className="text-xl flex-shrink-0">
								{style.icon}
							</span>
							<div className="flex-1">
								<p className={`${style.text}`}>
									{option.option}
									{isSelected && (
										<span className="ml-2 text-xs text-blue-400 font-bold">
											[YOUR ANSWER]
										</span>
									)}
								</p>
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-4 pt-4 border-t border-theme/30">
				{isCorrect ? (
					<p className="text-green-400 font-bold">
						✨ Correct! You got all answers right!
					</p>
				) : correctCount > 0 ? (
					<p className="text-yellow-400 font-bold">
						⚠️ Partially correct ({correctCount}/
						{correctOptionIds.length})
					</p>
				) : (
					<p className="text-red-400 font-bold">
						❌ Incorrect answer
					</p>
				)}
			</div>
		</div>
	);
};
