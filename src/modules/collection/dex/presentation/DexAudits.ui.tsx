import { Audit } from "~/modules/run/run/presentation/Audit.ui";
import { DexBrowser, DexDetail } from "./DexBrowser.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import type { Redactable } from "~/ui/kanto-theme/Redaction.ui";
import { Segmented, type SegmentedItem } from "~/ui/kanto-theme/Segmented.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

const NOTHING_YET = "—";
const GATES = "text-xs whitespace-nowrap text-theme-muted";
const FACTS = "flex flex-col gap-3";

const FILTER_LABEL = "Gate";
const NOTHING_HERE = "No audit fires at this gate.";
const FIRES_AT = "fires at";

export const firesAtLabelOf = (gates: string): string => `${FIRES_AT} ${gates}`;

export type DexAuditRow = { id: string; gates: string } & Redactable<{
	code: number;
	name: string;
	rule: string;
}>;

export type DexAuditDetail = { label: string; gates: string } & Redactable<{
	code: number;
	name: string;
	rule: string;
}>;

export type DexAuditsData = {
	filters: readonly SegmentedItem<string>[];
	filter: string;
	rows: readonly DexAuditRow[];
	selectedId: string | null;
	detail: DexAuditDetail | null;
	count: string;
	meta: string;
	note: string;
};

export type DexAuditsProps = DexAuditsData & {
	onSelect?: (id: string) => void;
	onFilter?: (filter: string) => void;
};

const Detail = ({ detail }: { detail: DexAuditDetail | null }) => {
	if (detail === null)
		return <DexDetail label={NOTHING_YET}>{NOTHING_HERE}</DexDetail>;

	return (
		<DexDetail label={detail.label}>
			<div className={FACTS}>
				{detail.locked ? (
					<Audit locked layout="full" />
				) : (
					<Audit
						code={detail.code}
						name={detail.name}
						cue={detail.rule}
						layout="full"
					/>
				)}
				<Typography variant="hint">{firesAtLabelOf(detail.gates)}</Typography>
			</div>
		</DexDetail>
	);
};

export const DexAudits = ({
	filters,
	filter,
	rows,
	selectedId,
	detail,
	count,
	meta,
	note,
	onSelect,
	onFilter,
}: DexAuditsProps) => (
	<DexBrowser
		label="audits"
		count={count}
		meta={meta}
		note={note}
		filter={
			onFilter === undefined ? undefined : (
				<Segmented
					label={FILTER_LABEL}
					look="loose"
					items={filters}
					value={filter}
					onSelect={onFilter}
				/>
			)
		}
		rows={rows.map((row) => (
			<Panel.Row
				key={row.id}
				picked={row.id === selectedId}
				onPress={onSelect === undefined ? undefined : () => onSelect(row.id)}
				trailing={<span className={GATES}>{row.gates}</span>}
			>
				{row.locked ? (
					<Audit locked layout="row" />
				) : (
					<Audit code={row.code} name={row.name} cue={row.rule} layout="row" />
				)}
			</Panel.Row>
		))}
		detail={<Detail detail={detail} />}
	/>
);
