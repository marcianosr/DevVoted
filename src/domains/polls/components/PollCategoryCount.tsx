import type { Poll } from "~/domains/polls/models/poll";
import {
	getCategoryMetadata,
	type CategoryCode,
} from "~/domains/shared/categories";

type PollCategoryCountProps = {
	polls: Poll[];
};

const PollCategoryCount = ({ polls }: PollCategoryCountProps) => {
	const categoryCountsMap = polls.reduce<Record<string, number>>(
		(acc, poll) => {
			acc[poll.categoryCode] = (acc[poll.categoryCode] || 0) + 1;
			return acc;
		},
		{}
	);

	const categoryCounts = Object.entries(categoryCountsMap)
		.map(([code, count]) => ({
			code,
			name: getCategoryMetadata(code as CategoryCode).name,
			count,
		}))
		.sort((a, b) => b.count - a.count);

	return (
		<div className="flex flex-wrap items-center gap-y-1">
			{categoryCounts.map((cat, index) => (
				<span
					key={cat.code}
					className="flex items-center"
					data-category-theme={cat.code}
				>
					{index > 0 && <span className="mx-3">•</span>}
					<span className="text-theme">{cat.name}</span>: {cat.count}
				</span>
			))}
		</div>
	);
};

export default PollCategoryCount;
