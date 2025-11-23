import { PollOption } from "../models/pollOption";

type SelectedOptionsSummaryProps = {
	options: PollOption[];
	selectedOptions: string[];
};

const SelectedOptionsSummary = ({
	options,
	selectedOptions,
}: SelectedOptionsSummaryProps) => (
	<section className="space-y-14 border-b border-theme pb-8 mb-8">
		<div>
			<h3 className="text-4xl">Results:</h3>
			<section className="mt-4 pt-4 border-t border-theme space-y-2">
				<p className="text-2xl">Your choice(s):</p>

				<ul className="list-disc px-4">
					{selectedOptions.map((optionId) => {
						const option = options.find((opt) => opt.id === Number(optionId));
						if (!option) return null;

						return (
							<>
								<li key={option.id} className="text-red-400 text-xl">
									Incorrect answer: {option.option}
								</li>
							</>
						);
					})}
				</ul>

				<h3 className="text-2xl">Correct answers:</h3>
				<ul className="list-disc px-4">
					{options
						.filter((opt) => opt.correct)
						.map((opt) => (
							<li key={opt.id} className="text-green-400 text-xl">
								Correct answer: {opt.option}
							</li>
						))}
				</ul>
			</section>
		</div>
	</section>
);

export default SelectedOptionsSummary;
