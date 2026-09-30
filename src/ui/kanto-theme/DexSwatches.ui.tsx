import { clsx } from "clsx";

import { DexBrowser, DexDetail } from "./DexBrowser.ui";
import { Panel } from "./Panel.ui";
import { Swatch, type SwatchFill } from "./Swatch.ui";
import { Typography } from "./Typography.ui";

const NAME = "min-w-0 flex-1 truncate text-sm font-bold";
const EARNED_NAME = "text-theme-faint";
const UNEARNED_NAME = "text-theme-muted";
const NOTE = "text-xs text-theme-muted";
const FACTS = "flex items-center gap-4";
const ROW_SIZE = "small";
const DETAIL_SIZE = "hero";

const NOTHING_YET = "—";
const NOTHING_HERE = "No swatch here yet.";

export const SWEPT_NOTE = "swept";

export const gateNoteOf = (gate: number): string => `gate ${gate}`;

export type DexSwatchRow = {
	id: string;
	name: string;
	swatch: SwatchFill;
	note: string;
};

export type DexSwatchDetail = {
	label: string;
	swatch: SwatchFill;
	note: string;
	rule: string;
};

export type DexSwatchesData = {
	rows: readonly DexSwatchRow[];
	selectedId: string | null;
	detail: DexSwatchDetail | null;
	count: string;
	meta: string;
	note: string;
};

export type DexSwatchesProps = DexSwatchesData & {
	onSelect?: (id: string) => void;
};

const isEarned = (swatch: SwatchFill): boolean => swatch.state === "discovered";

const Detail = ({ detail }: { detail: DexSwatchDetail | null }) => {
	if (detail === null)
		return <DexDetail label={NOTHING_YET}>{NOTHING_HERE}</DexDetail>;

	return (
		<DexDetail label={detail.label}>
			<div className={FACTS}>
				<Swatch {...detail.swatch} size={DETAIL_SIZE} />
				<span className={NOTE}>{detail.note}</span>
			</div>
			<Typography variant="hint">{detail.rule}</Typography>
		</DexDetail>
	);
};

export const DexSwatches = ({
	rows,
	selectedId,
	detail,
	count,
	meta,
	note,
	onSelect,
}: DexSwatchesProps) => (
	<DexBrowser
		label="swatches"
		count={count}
		meta={meta}
		note={note}
		rows={rows.map((row) => (
			<Panel.Row
				key={row.id}
				picked={row.id === selectedId}
				onPress={onSelect === undefined ? undefined : () => onSelect(row.id)}
				trailing={<span className={NOTE}>{row.note}</span>}
			>
				<Swatch {...row.swatch} size={ROW_SIZE} />
				<span
					className={clsx(
						NAME,
						isEarned(row.swatch) ? EARNED_NAME : UNEARNED_NAME
					)}
				>
					{row.name}
				</span>
			</Panel.Row>
		))}
		detail={<Detail detail={detail} />}
	/>
);
