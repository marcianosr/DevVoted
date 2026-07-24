import type { CategoryCode } from "~/domains/shared/categories";
import { DataTable } from "~/ui/DataTable.ui";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

import type {
	PolldexCategoryFilter,
	PolldexEntry,
} from "../../polldex/polldex.model";
import { PolldexFilterBar } from "./PolldexFilterBar.ui";
import { polldexColumns } from "./polldexColumns.ui";

type PolldexPanelProps = {
	entries: PolldexEntry[];
	categories: CategoryCode[];
	selectedCategory: PolldexCategoryFilter;
	onSelectCategory: (category: PolldexCategoryFilter) => void;
};

/** The Polls tab body: category filter + the sortable poll table. */
export const PolldexPanel = ({
	entries,
	categories,
	selectedCategory,
	onSelectCategory,
}: PolldexPanelProps) => (
	<Stack gap="6">
		<PolldexFilterBar
			categories={categories}
			selected={selectedCategory}
			onSelect={onSelectCategory}
		/>

		<DataTable
			columns={polldexColumns}
			data={entries}
			initialSorting={[{ id: "id", desc: false }]}
			rowClassName={(entry) => (entry.seen ? "" : "opacity-50")}
			emptyMessage="No polls match your filters."
		/>

		<Paragraph tone="muted">
			Unseen polls stay listed but are redacted to “???” so the full scope is
			visible without spoiling questions. Seen and accuracy are per-poll
			lifetime stats, independent of any one run.
		</Paragraph>
	</Stack>
);
