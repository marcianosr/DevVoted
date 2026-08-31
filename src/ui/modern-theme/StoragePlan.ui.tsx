import { PlanRow, type PlanRowProps } from "./PlanRow.ui";
import { Section } from "./Section.ui";
import { Text } from "./Text.ui";

const ROWS = "flex flex-col gap-1.5 pt-3";

export type StoragePlanRow = PlanRowProps & { readonly id: string };

export type StoragePlanProps = {
	rows: readonly StoragePlanRow[];
	cap: string;
	terms: string;
};

export const StoragePlan = ({ rows, cap, terms }: StoragePlanProps) => (
	<Section
		title="Storage plan"
		value={
			<Text size="meta" tone="muted">
				{`${cap} cap · ${terms}`}
			</Text>
		}
	>
		<Text as="p" size="meta" tone="muted">
			The cap is what you can hold, not what you can earn. A bigger one bills
			every gate, and dropping to a smaller one burns what will not fit.
		</Text>
		<div className={ROWS}>
			{rows.map((row) => (
				<PlanRow key={row.id} {...row} />
			))}
		</div>
	</Section>
);
