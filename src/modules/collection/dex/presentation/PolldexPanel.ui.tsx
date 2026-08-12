import type { CategoryCode } from "~/shared/lib/categories";
import { DataTable } from "~/ui/DataTable.ui";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

import type {
	PolldexCategoryFilter,
	PolldexEntry,
	PolldexSeenFilter,
} from "~/modules/collection/dex/domain/polldex.model";
import { PolldexFilterBar } from "~/modules/collection/dex/presentation/PolldexFilterBar.ui";
import { polldexColumns } from "~/modules/collection/dex/presentation/polldexColumns.ui";

type PolldexPanelProps = {
	entries: PolldexEntry[];
	categories: CategoryCode[];
	selectedCategory: PolldexCategoryFilter;
	onSelectCategory: (category: PolldexCategoryFilter) => void;
	selectedSeen: PolldexSeenFilter;
	onSelectSeen: (seen: PolldexSeenFilter) => void;
};

/** The Polls tab body: the two filters + the sortable poll table. */
export const PolldexPanel = ({
	entries,
	categories,
	selectedCategory,
	onSelectCategory,
	selectedSeen,
	onSelectSeen,
}: PolldexPanelProps) => (
	<Stack gap="6">
		<PolldexFilterBar
			categories={categories}
			selected={selectedCategory}
			onSelect={onSelectCategory}
			selectedSeen={selectedSeen}
			onSelectSeen={onSelectSeen}
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
