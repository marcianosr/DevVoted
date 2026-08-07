import {
	getCategoryMetadata,
	type CategoryCode,
} from "~/domains/shared/categories";
import { Button } from "~/ui/Button.component";

import type {
	PolldexCategoryFilter,
	PolldexSeenFilter,
} from "../../polldex/polldex.model";

type PolldexFilterBarProps = {
	categories: CategoryCode[];
	selected: PolldexCategoryFilter;
	onSelect: (category: PolldexCategoryFilter) => void;
	selectedSeen: PolldexSeenFilter;
	onSelectSeen: (seen: PolldexSeenFilter) => void;
};

const SEEN_FILTERS: readonly {
	value: PolldexSeenFilter;
	label: string;
}[] = [
	{ value: "all", label: "All polls" },
	{ value: "seen", label: "Seen" },
	{ value: "unseen", label: "Unseen" },
];

/**
 * Two filter rows, one per axis: category on top, met-or-not below. Kept on
 * separate lines rather than one wrapping strip because they combine — a player
 * reading "CSS" and "Unseen" as one sentence is exactly the query they meant,
 * and a single row of eleven buttons hides that they are two different questions.
 *
 * The selected button uses the shared theme accent (`isSelected`) — categories
 * carry no color of their own (ADR-020).
 */
export const PolldexFilterBar = ({
	categories,
	selected,
	onSelect,
	selectedSeen,
	onSelectSeen,
}: PolldexFilterBarProps) => (
	<div className="flex flex-col gap-2">
		<div className="flex flex-wrap gap-2">
			<Button
				variant="theme"
				size="small"
				isSelected={selected === "all"}
				onClick={() => onSelect("all")}
			>
				All categories
			</Button>
			{categories.map((category) => (
				<Button
					key={category}
					variant="theme"
					size="small"
					isSelected={selected === category}
					onClick={() => onSelect(category)}
				>
					{getCategoryMetadata(category).name}
				</Button>
			))}
		</div>
		<div className="flex flex-wrap gap-2">
			{SEEN_FILTERS.map(({ value, label }) => (
				<Button
					key={value}
					variant="theme"
					size="small"
					isSelected={selectedSeen === value}
					onClick={() => onSelectSeen(value)}
				>
					{label}
				</Button>
			))}
		</div>
	</div>
);
