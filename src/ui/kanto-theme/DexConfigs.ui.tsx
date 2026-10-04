import { LOCKED_CONFIG } from "~/shared/lib/copy";

import { Badge } from "./Badge.ui";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { DexBrowser, DexDetail } from "./DexBrowser.ui";
import { Panel } from "./Panel.ui";
import { Redaction, type Redactable } from "./Redaction.ui";
import { Segmented, type SegmentedItem } from "./Segmented.ui";
import { Version } from "./Version.ui";
import { Weight } from "./Weight.ui";

const NAME = "min-w-0 flex-1 truncate text-sm font-bold text-theme-faint";
const NOTHING = "text-xs text-theme-muted";

const FILTER_LABEL = "Weight";
const NOTHING_HERE = "No config at this weight yet.";

export type DexConfigCard = ConfigChipProps & { id: string };

export type DexConfigRow = { id: string; slots: number } & Redactable<{
	name: string;
	figure?: string;
	version?: number;
}>;

export type DexConfigDetail = {
	label: string;
	card: DexConfigCard;
};

export type DexConfigsData = {
	filters: readonly SegmentedItem<string>[];
	filter: string;
	rows: readonly DexConfigRow[];
	selectedId: string | null;
	detail: DexConfigDetail | null;
	count: string;
	meta: string;
	note: string;
};

export type DexConfigsProps = DexConfigsData & {
	onSelect?: (id: string) => void;
	onFilter?: (filter: string) => void;
};

const Trailing = ({ row }: { row: DexConfigRow }) => {
	if (row.locked) return <span className={NOTHING}>—</span>;

	return (
		<>
			{row.figure === undefined ? null : (
				<Badge color="viridian">{row.figure}</Badge>
			)}
			{row.version === undefined ? null : <Version version={row.version} />}
		</>
	);
};

type ConfigRowProps = {
	row: DexConfigRow;
	picked: boolean;
	onSelect?: (id: string) => void;
};

const ConfigRow = ({ row, picked, onSelect }: ConfigRowProps) => (
	<Panel.Row
		picked={picked}
		onPress={onSelect === undefined ? undefined : () => onSelect(row.id)}
		trailing={<Trailing row={row} />}
	>
		<Weight slots={row.slots} />
		{row.locked ? (
			<Redaction label={LOCKED_CONFIG} />
		) : (
			<span className={NAME}>{row.name}</span>
		)}
	</Panel.Row>
);

const Detail = ({ detail }: { detail: DexConfigDetail | null }) => {
	if (detail === null) return <DexDetail label="—">{NOTHING_HERE}</DexDetail>;

	const { id, ...card } = detail.card;

	return (
		<DexDetail label={detail.label}>
			<ConfigChip key={id} {...card} />
		</DexDetail>
	);
};

export const DexConfigs = ({
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
}: DexConfigsProps) => (
	<DexBrowser
		label="configs"
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
			<ConfigRow
				key={row.id}
				row={row}
				picked={row.id === selectedId}
				onSelect={onSelect}
			/>
		))}
		detail={<Detail detail={detail} />}
	/>
);
