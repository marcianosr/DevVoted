import { clsx } from "clsx";

import { PollOption } from "../models/pollOption";

type SelectedOptionsSummaryProps = {
	options: PollOption[];
	selectedOptions: string[];
};

const SelectedOptionsSummary = ({
	options,
	selectedOptions,
}: SelectedOptionsSummaryProps) => (
	<ul>
		{options.map((option) => {
			const styles = clsx({
				"bg-green-900/30 border-green-500 text-green-400": option.correct,
				"bg-red-900/30 border-red-500 text-red-400": !option.correct,
				"opacity-50": !selectedOptions.includes(String(option.id)),
			});
			return (
				<li key={option.id} className={styles}>
					{option.option}
				</li>
			);
		})}
	</ul>
);

export default SelectedOptionsSummary;
