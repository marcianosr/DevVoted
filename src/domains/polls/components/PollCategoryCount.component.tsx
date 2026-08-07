import type { Poll } from "~/domains/polls/models/poll.model";
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
		<ul className="list-disc px-4 text-2xl mt-4">
			{categoryCounts.map((cat) => (
				<li key={cat.code}>
					<span className="text-theme">{cat.name}</span>: {cat.count}
				</li>
			))}
		</ul>
	);
};

export default PollCategoryCount;
