import { Badge } from "./Badge.ui";
import { DexPanel } from "./DexPanel.ui";
import { Panel } from "./Panel.ui";
import { Redaction, type Redactable } from "./Redaction.ui";

const QUESTION = "min-w-0 flex-1 truncate text-sm text-theme-faint";
const REPEATS = "text-xs text-theme-muted";
const NOTHING = "text-xs text-theme-muted";

const NOTHING_YET = "—";
const LOCKED_LABEL = "Unseen poll";
const LOCKED_CATEGORY_LABEL = "Unseen category";

export const answeredLabelOf = (answered: number): string =>
	`answered ×${answered}`;

export const scoreLabelOf = (correct: number, answered: number): string =>
	`${correct}/${answered}`;

export type DexPollRow = { id: number } & Redactable<{
	category: string;
	question: string;
	answered: number;
	correct: number;
}>;

export type DexPollsProps = {
	rows: readonly DexPollRow[];
	count: string;
	meta: string;
	note: string;
};

const Trailing = ({ row }: { row: DexPollRow }) => {
	if (row.locked || row.answered === 0) {
		return <span className={NOTHING}>{NOTHING_YET}</span>;
	}

	return (
		<>
			<span className={REPEATS}>{answeredLabelOf(row.answered)}</span>
			<Badge color={row.correct === row.answered ? "viridian" : "saffron"}>
				{scoreLabelOf(row.correct, row.answered)}
			</Badge>
		</>
	);
};

export const DexPolls = ({ rows, count, meta, note }: DexPollsProps) => (
	<DexPanel label="polls seen" count={count} meta={meta} note={note}>
		<Panel.Rows>
			{rows.map((row) => (
				<Panel.Row key={row.id} trailing={<Trailing row={row} />}>
					<Badge>
						{row.locked ? (
							<Redaction label={LOCKED_CATEGORY_LABEL} />
						) : (
							row.category
						)}
					</Badge>
					{row.locked ? (
						<Redaction label={LOCKED_LABEL} />
					) : (
						<span className={QUESTION}>{row.question}</span>
					)}
				</Panel.Row>
			))}
		</Panel.Rows>
	</DexPanel>
);
