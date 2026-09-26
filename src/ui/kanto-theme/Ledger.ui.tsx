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

export type { FigureTone, LedgerFigure, LedgerRow, LedgerTag };

export type LedgerProps = {
	title: string;
	badge?: string;
	rows: readonly LedgerRow[];
	meter?: MeterProps;
	note?: string;
};

export const Ledger = ({ title, badge, rows, meter, note }: LedgerProps) => (
	<Panel>
		<Panel.Header
			label={title}
			meta={badge === undefined ? undefined : <Badge>{badge}</Badge>}
		/>
		<Panel.Body>
			<PanelTable>
				<LedgerRows rows={rows} meter={meter} tabled />
			</PanelTable>
		</Panel.Body>
		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{note}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
