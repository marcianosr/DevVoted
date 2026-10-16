import { Lead, type LeadLine } from "~/modules/run/gate/presentation/Lead.ui";
import {
	LedgerRows,
	type FigureTone,
	type LedgerFigure,
	type LedgerRow,
	type LedgerTag,
} from "./LedgerRows.ui";
import type { MeterProps } from "~/ui/kanto-theme/Meter.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { PanelTable } from "~/ui/kanto-theme/PanelTable.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export type { FigureTone, LedgerFigure, LedgerRow, LedgerTag };

export type LedgerProps = {
	title: string;
	meta?: LeadLine;
	rows: readonly LedgerRow[];
	meter?: MeterProps;
	note?: string;
};

export const Ledger = ({ title, meta, rows, meter, note }: LedgerProps) => (
	<Panel>
		<Panel.Header
			label={title}
			meta={meta === undefined ? undefined : <Lead line={meta} as="span" />}
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
