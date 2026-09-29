import { Badge } from "./Badge.ui";
import { Codebase, type CodebaseProps } from "./Codebase.ui";
import type { KantoColor } from "./colors";
import { CoverageBar, type CoverageBarProps } from "./CoverageBar.ui";
import { Lead, type LeadLine } from "./Lead.ui";
import { Panel, type PanelColumn } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	title: "What a poll pays",
	answer: "answer",
	pays: "pays",
	share: "of the codebase",
	note: "A unit covers one slot of the codebase. Multiple-answer polls and your configs pay more per answer.",
} as const;

export const POLL_PAYS_TITLE = COPY.title;

const RULED = "border-t border-theme-faint";

const COLUMNS = [
	{ label: COPY.answer, width: "min-w-0 flex-1" },
	{ label: COPY.pays, width: "w-24 shrink-0 text-right" },
	{ label: COPY.share, width: "w-28 shrink-0 text-right" },
] as const satisfies readonly PanelColumn[];

const [ANSWER_COLUMN, PAYS_COLUMN, SHARE_COLUMN] = COLUMNS;

const ANSWER = `flex flex-wrap items-baseline gap-x-2 ${ANSWER_COLUMN.width}`;
const PAYS = `flex justify-end ${PAYS_COLUMN.width}`;
const SHARE = `flex justify-end ${SHARE_COLUMN.width}`;

const SHARE_COLOR: KantoColor = "viridian";

export type PollPaysRow = {
	answer: string;
	via?: string;
	units: string;
	share: string;
};

export type PollPaysProps = {
	slotsOpen: string;
	codebase: CodebaseProps;
	standing: LeadLine;
	bar: CoverageBarProps;
	owed?: LeadLine;
	rows: readonly PollPaysRow[];
};

const keyOf = ({ answer, via }: PollPaysRow) => `${answer}-${via ?? ""}`;

const Row = ({ row }: { row: PollPaysRow }) => (
	<Panel.Row>
		<span className={ANSWER}>
			<Typography variant="accent">{row.answer}</Typography>
			{row.via === undefined ? null : (
				<Typography variant="hint" as="span">
					{row.via}
				</Typography>
			)}
		</span>
		<span className={PAYS}>
			<Badge>{row.units}</Badge>
		</span>
		<span className={SHARE}>
			<Badge color={SHARE_COLOR}>{row.share}</Badge>
		</span>
	</Panel.Row>
);

export const PollPays = ({
	slotsOpen,
	codebase,
	standing,
	bar,
	owed,
	rows,
}: PollPaysProps) => (
	<Panel>
		<Panel.Header label={COPY.title} meta={<Badge>{slotsOpen}</Badge>} />
		<Panel.Body>
			<Codebase {...codebase} />
			<Lead line={standing} />
		</Panel.Body>
		<Panel.Body className={RULED}>
			<CoverageBar {...bar} />
			{owed === undefined ? null : (
				<Lead line={owed} variant="subtitle" as="p" />
			)}
		</Panel.Body>
		<Panel.Columns columns={COLUMNS} />
		<Panel.Rows>
			{rows.map((row) => (
				<Row key={keyOf(row)} row={row} />
			))}
		</Panel.Rows>
		<Panel.Footer>
			<Typography variant="hint">{COPY.note}</Typography>
		</Panel.Footer>
	</Panel>
);
