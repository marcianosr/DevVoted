import { clsx } from "clsx";

import { Tabs, type TabItem } from "../Tabs.ui";
import { Text } from "../Text.ui";

const PANEL = "flex flex-col gap-4 py-2";
const TABLE = "flex flex-col divide-y divide-edge";

// A grid, not a flex run: three columns down nine rows only read as columns if
// every row agrees on where they start.
const ROW = "grid grid-cols-[1fr_5rem_4rem] items-center gap-3 py-2";
const HEAD = "pb-1";
const FIGURE = "text-right";
const DIMMED = "opacity-45";

/** A rate needs a sample, so an untouched category shows a dash rather than 0%
 * — nobody has been wrong about Go yet, they have just never been asked. */
const NO_RATE = "—";

export type DexCategory = {
	code: string;
	name: string;
	seen: number;
	total: number;
	correct?: number;
};

export const POLL_VIEWS = [
	{ id: "category", label: "by category" },
	{ id: "missed", label: "most missed" },
	{ id: "unseen", label: "unseen" },
] as const satisfies readonly TabItem[];

export type PollsPanelProps = {
	categories: readonly DexCategory[];
	view: string;
	onView: (id: string) => void;
};

const byMostSeen = (first: DexCategory, second: DexCategory) =>
	second.seen - first.seen;

const byWorstRate = (first: DexCategory, second: DexCategory) =>
	(first.correct ?? 0) - (second.correct ?? 0);

const orderedFor = (
	view: string,
	categories: readonly DexCategory[]
): readonly DexCategory[] => {
	if (view === "unseen")
		return categories.filter((category) => category.seen === 0);
	if (view === "missed")
		return categories
			.filter((category) => category.correct !== undefined)
			.sort(byWorstRate);
	return [...categories].sort(byMostSeen);
};

const CategoryRow = ({ category }: { category: DexCategory }) => (
	<div className={clsx(ROW, category.seen === 0 && DIMMED)}>
		<Text>{category.name}</Text>
		<Text tone="muted" className={FIGURE}>
			{category.seen}/{category.total}
		</Text>
		<Text
			tone={category.correct === undefined ? "faint" : "default"}
			className={FIGURE}
		>
			{category.correct === undefined ? NO_RATE : `${category.correct}%`}
		</Text>
	</div>
);

export const PollsPanel = ({ categories, view, onView }: PollsPanelProps) => {
	const shown = orderedFor(view, categories);

	return (
		<section className={PANEL}>
			<Tabs
				items={POLL_VIEWS}
				activeId={view}
				onSelect={onView}
				label="how to read the polls"
				variant="pill"
			/>
			<div className={TABLE}>
				<div className={clsx(ROW, HEAD)}>
					<Text tone="faint" size="caption">
						category
					</Text>
					<Text tone="faint" size="caption" className={FIGURE}>
						seen
					</Text>
					<Text tone="faint" size="caption" className={FIGURE}>
						correct
					</Text>
				</div>
				{shown.map((category) => (
					<CategoryRow key={category.code} category={category} />
				))}
			</div>
		</section>
	);
};
