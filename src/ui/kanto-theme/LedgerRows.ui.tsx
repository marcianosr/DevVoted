import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Meter, type MeterProps } from "./Meter.ui";
import { Redaction, type Redactable } from "./Redaction.ui";
import { TABLE_DIVIDER, TABLE_ROW } from "./PanelTable.ui";
import type { SwatchFill } from "./Swatch.ui";
import { SwatchChip } from "./SwatchChip.ui";
import { Verdict, type VerdictOutcome } from "./Verdict.ui";

const ROWS = "flex w-full flex-col";
const ROW = "flex items-center gap-3 py-2";
const TABLED_ROW = `${TABLE_ROW} items-center gap-3`;

const IDENTITY = "flex min-w-0 flex-wrap items-baseline gap-x-2 text-sm";
const TAGS = "flex shrink-0 flex-wrap items-center gap-1.5 self-center";
const LABEL = "text-theme-soft";
const LABEL_TOTAL = "font-bold text-theme-faint";
const DETAIL = "text-theme-muted";

const FIGURES =
	"ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2";
const SEALED =
	"inline-flex items-center rounded-md border border-dashed border-theme-faint px-2 py-0.5 text-xs";
const QUIET = "text-sm text-theme-muted";
const HEADLINE = "text-lg font-bold tabular-nums text-theme-faint";

const SEALED_LABEL = "Withheld until something reveals it";
const METER_ROW = "px-0 pt-1";
const TABLED_METER_ROW = "px-4 pt-1 pb-2";

export type FigureTone = "badge" | "quiet" | "headline";

export type LedgerFigure = Redactable<{
	label: string;
	color?: KantoColor;
	swatch?: SwatchFill;
	tone?: FigureTone;
}>;

export type LedgerTag = { label: string; color?: KantoColor };

export type LedgerRow = {
	label?: string;
	verdict?: VerdictOutcome;
	tags?: readonly LedgerTag[];
	detail?: string;
	figures?: readonly LedgerFigure[];
	total?: boolean;
};

const Figure = ({
	figure,
	short,
}: {
	figure: LedgerFigure;
	short: boolean;
}) => {
	if (figure.locked === true) {
		return (
			<span className={SEALED}>
				<Redaction label={SEALED_LABEL} short={short} />
			</span>
		);
	}

	const { label, color, swatch, tone = "badge" } = figure;

	if (swatch !== undefined) {
		return <SwatchChip swatch={swatch} label={label} />;
	}

	if (tone === "quiet") return <span className={QUIET}>{label}</span>;
	if (tone === "headline") return <span className={HEADLINE}>{label}</span>;

	return <Badge color={color}>{label}</Badge>;
};

const Row = ({
	row,
	first,
	tabled,
}: {
	row: LedgerRow;
	first: boolean;
	tabled: boolean;
}) => {
	const figures = row.figures ?? [];

	const tags = row.tags ?? [];

	return (
		<div className={clsx(tabled ? TABLED_ROW : ROW, !first && TABLE_DIVIDER)}>
			{row.verdict === undefined ? null : <Verdict outcome={row.verdict} />}
			<span className={IDENTITY}>
				{row.label === undefined ? null : (
					<span className={row.total === true ? LABEL_TOTAL : LABEL}>
						{row.label}
					</span>
				)}
				{tags.length === 0 ? null : (
					<span className={TAGS}>
						{tags.map((tag) => (
							<Badge key={tag.label} color={tag.color}>
								{tag.label}
							</Badge>
						))}
					</span>
				)}
				{row.detail === undefined ? null : (
					<span className={DETAIL}>{row.detail}</span>
				)}
			</span>
			{figures.length === 0 ? null : (
				<span className={FIGURES}>
					{figures.map((figure, index) => (
						<Figure
							key={figure.locked === true ? index : figure.label}
							figure={figure}
							short={figures.length > 1}
						/>
					))}
				</span>
			)}
		</div>
	);
};

export type LedgerRowsProps = {
	rows: readonly LedgerRow[];
	meter?: MeterProps;
	tabled?: boolean;
};

export const LedgerRows = ({
	rows,
	meter,
	tabled = false,
}: LedgerRowsProps) => (
	<div className={ROWS}>
		{rows.map((row, index) => (
			<Row key={index} row={row} first={index === 0} tabled={tabled} />
		))}
		{meter === undefined ? null : (
			<div className={tabled ? TABLED_METER_ROW : METER_ROW}>
				<Meter {...meter} />
			</div>
		)}
	</div>
);
