import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { Badge } from "~/ui/Badge.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";

export type UpcomingCategoriesProps = {
	/** This window's unanswered polls' categories, in play order. */
	thisGate: readonly CategoryCode[];
	/** The next window's, in play order — empty while the fetch is in flight. */
	nextGate: readonly CategoryCode[];
};

const CategoryGroup = ({
	label,
	categories,
}: {
	label: string;
	categories: readonly CategoryCode[];
}) => {
	if (categories.length === 0) return null;
	return (
		<span className="inline-flex flex-wrap items-center gap-1.5">
			<Paragraph as="span" size="xs" tone="muted">
				{label}
			</Paragraph>
			{categories.map((category, position) => (
				<Badge key={`${category}-${position}`} tone="muted" size="pill">
					{getCategoryMetadata(category).name}
				</Badge>
			))}
		</span>
	);
};

/**
 * Prefetch's reveal: the categories still coming, in play order — the rest of
 * this gate's window, then the next gate's. Duplicates stay duplicated on
 * purpose: two JavaScript chips are two JavaScript polls, and collapsing them
 * would misstate the draw. Renders nothing while both halves are empty.
 */
export const UpcomingCategories = ({
	thisGate,
	nextGate,
}: UpcomingCategoriesProps) => {
	if (thisGate.length === 0 && nextGate.length === 0) return null;
	return (
		<section className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded border border-edge px-4 py-3">
			<Paragraph
				as="span"
				size="xs"
				tone="muted"
				className="uppercase tracking-[0.3em]"
			>
				Prefetch
			</Paragraph>
			<CategoryGroup label="this gate" categories={thisGate} />
			<CategoryGroup label="next gate" categories={nextGate} />
		</section>
	);
};
