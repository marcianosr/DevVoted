import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const ROW = "flex w-full min-w-0 items-center gap-3";
const KEYWORD = "font-mono text-xs text-theme-muted";
const SUBJECT = "min-w-0 flex-1";
const MOVES = "flex shrink-0 items-center gap-1";

const KEYWORD_TEXT = "pick";
const UP_GLYPH = "↑";
const DOWN_GLYPH = "↓";

export type RebaseRow = {
	id: string;
	category: string;
	color?: KantoColor;
	answerType?: string;
};

export type RebaseListProps = {
	label: string;
	hint: string;
	rows: readonly RebaseRow[];
	onMove?: (from: number, to: number) => void;
	refusal?: string;
};

const Moves = ({
	index,
	last,
	category,
	onMove,
}: {
	index: number;
	last: boolean;
	category: string;
	onMove: (from: number, to: number) => void;
}) => (
	<span className={MOVES}>
		<Button
			label={UP_GLYPH}
			glyph={UP_GLYPH}
			size="sm"
			hint={`Move ${category} earlier`}
			disabled={index === 0}
			onPress={() => onMove(index, index - 1)}
		/>
		<Button
			label={DOWN_GLYPH}
			glyph={DOWN_GLYPH}
			size="sm"
			hint={`Move ${category} later`}
			disabled={last}
			onPress={() => onMove(index, index + 1)}
		/>
	</span>
);

export const RebaseList = ({
	label,
	hint,
	rows,
	onMove,
	refusal,
}: RebaseListProps) => (
	<Panel>
		<Panel.Header label={label} />

		<Panel.Body>
			<Typography variant="hint">{hint}</Typography>
		</Panel.Body>

		<Panel.Rows>
			{rows.map((row, index) => (
				<Panel.Row key={row.id}>
					<span className={ROW}>
						<span className={KEYWORD}>{KEYWORD_TEXT}</span>
						<span className={SUBJECT}>
							<Badge color={row.color}>{row.category}</Badge>
						</span>
						{row.answerType === undefined ? null : (
							<Typography variant="hint">{row.answerType}</Typography>
						)}
						{onMove === undefined ? null : (
							<Moves
								index={index}
								last={index === rows.length - 1}
								category={row.category}
								onMove={onMove}
							/>
						)}
					</span>
				</Panel.Row>
			))}
		</Panel.Rows>

		{refusal === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{refusal}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
