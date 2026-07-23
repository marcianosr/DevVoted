import type { CategoryCode } from "~/domains/shared/categories";
import { DataTable } from "~/ui/DataTable.ui";
import { Screen } from "~/ui/Screen.ui";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

import type {
	PolldexCategoryFilter,
	PolldexCoverage,
	PolldexEntry,
} from "../../polldex/polldex.model";
import { PolldexFilterBar } from "./PolldexFilterBar.ui";
import { polldexColumns } from "./polldexColumns.ui";

type PolldexScreenProps = {
	entries: PolldexEntry[];
	coverage: PolldexCoverage;
	categories: CategoryCode[];
	selectedCategory: PolldexCategoryFilter;
	onSelectCategory: (category: PolldexCategoryFilter) => void;
};

export const PolldexScreen = ({
	entries,
	coverage,
	categories,
	selectedCategory,
	onSelectCategory,
}: PolldexScreenProps) => (
	<Screen width="wide">
		<Stack gap="6">
			<div>
				<Title>Polldex</Title>
				<Paragraph tone="muted">
					{coverage.seen} seen of {coverage.total} total · {coverage.percent}%
					coverage
				</Paragraph>
			</div>

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
	</Screen>
);
