import { Badge } from "./Badge.ui";
import {
	LedgerRows,
	type FigureTone,
	type LedgerFigure,
	type LedgerRow,
	type LedgerTag,
} from "./LedgerRows.ui";
import type { MeterProps } from "./Meter.ui";
import { PanelV2 } from "./PanelV2.ui";
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
	<PanelV2>
		<PanelV2.Header
			label={title}
			meta={badge === undefined ? undefined : <Badge>{badge}</Badge>}
		/>
		<PanelV2.Body>
			<PanelTable>
				<LedgerRows rows={rows} meter={meter} tabled />
			</PanelTable>
		</PanelV2.Body>
		{note === undefined ? null : (
			<PanelV2.Footer>
				<Typography variant="hint">{note}</Typography>
			</PanelV2.Footer>
		)}
	</PanelV2>
);
