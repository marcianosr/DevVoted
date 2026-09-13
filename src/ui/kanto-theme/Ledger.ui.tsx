import { Badge } from "./Badge.ui";
import {
	LedgerRows,
	type FigureTone,
	type LedgerFigure,
	type LedgerRow,
	type LedgerTag,
} from "./LedgerRows.ui";
import type { MeterProps } from "./Meter.ui";
import { Panel } from "./Panel.ui";
import { PanelTable } from "./PanelTable.ui";
import { Typography } from "./Typography.ui";

const SECTION = "flex w-full flex-col gap-3";
const TITLE_ROW = "flex items-baseline gap-3";
const TITLE_BADGE = "ml-auto shrink-0";

const MARK =
	"inline-block size-3.5 shrink-0 self-center rounded-xs border-2 border-dashed border-theme";
const GATE_TITLE = "uppercase tracking-widest";

export type { FigureTone, LedgerFigure, LedgerRow, LedgerTag };

export type LedgerHeading = "section" | "gate";

export type LedgerProps = {
	title: string;
	heading?: LedgerHeading;
	badge?: string;
	rows: readonly LedgerRow[];
	meter?: MeterProps;
	note?: string;
};

export const Ledger = ({
	title,
	heading = "section",
	badge,
	rows,
	meter,
	note,
}: LedgerProps) => (
	<section className={SECTION}>
		<div className={TITLE_ROW}>
			{heading === "gate" ? <span aria-hidden className={MARK} /> : null}
			<Typography variant="title" as="h3">
				{heading === "gate" ? (
					<span className={GATE_TITLE}>{title}</span>
				) : (
					title
				)}
			</Typography>
			{badge === undefined ? null : (
				<span className={TITLE_BADGE}>
					<Badge>{badge}</Badge>
				</span>
			)}
		</div>

		<Panel>
			<PanelTable>
				<LedgerRows rows={rows} meter={meter} tabled />
			</PanelTable>
		</Panel>
		{note === undefined ? null : <Typography variant="hint">{note}</Typography>}
	</section>
);
