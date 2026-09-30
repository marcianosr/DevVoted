import { Badge } from "./Badge.ui";
import { DexBrowser, DexDetail } from "./DexBrowser.ui";
import { Panel } from "./Panel.ui";
import { Redaction, type Redactable } from "./Redaction.ui";
import { Segmented, type SegmentedItem } from "./Segmented.ui";
import { Typography } from "./Typography.ui";

const NUMBER = "shrink-0 text-xs tabular-nums text-theme-muted";
const QUESTION = "min-w-0 flex-1 truncate text-sm text-theme-faint";
const NOTHING = "text-xs text-theme-muted";
const FACTS = "flex flex-wrap items-center gap-2";
const ASKED = "flex flex-col gap-3";

const NOTHING_YET = "—";
const LOCKED_LABEL = "Unseen poll";
const FILTER_LABEL = "Category";
const NOTHING_HERE = "No poll in this category yet.";

export const answeredLabelOf = (answered: number): string =>
	`answered ×${answered}`;

export const scoreLabelOf = (correct: number, answered: number): string =>
	`${correct}/${answered}`;

export const seenLabelOf = (timesSeen: number): string => `dealt ×${timesSeen}`;

export const accuracyLabelOf = (accuracy: number): string => `${accuracy}%`;

type PollFacts = {
	question: string;
	timesSeen: number;
	answered: number;
	correct: number;
	accuracy: number | null;
};

export type DexPollRow = { id: string; number: string } & Redactable<
	Omit<PollFacts, "timesSeen" | "accuracy">
>;

export type DexPollDetail = {
	number: string;
	category: string;
} & Redactable<PollFacts>;

export type DexPollsData = {
	filters: readonly SegmentedItem<string>[];
	filter: string;
	rows: readonly DexPollRow[];
	selectedId: string | null;
	detail: DexPollDetail | null;
	count: string;
	meta: string;
	note: string;
};

export type DexPollsProps = DexPollsData & {
	onSelect?: (id: string) => void;
	onFilter?: (filter: string) => void;
};

const Trailing = ({ row }: { row: DexPollRow }) => {
	if (row.locked || row.answered === 0) {
		return <span className={NOTHING}>{NOTHING_YET}</span>;
	}

	return (
		<>
			<span className={NOTHING}>{answeredLabelOf(row.answered)}</span>
			<Badge color={row.correct === row.answered ? "viridian" : "saffron"}>
				{scoreLabelOf(row.correct, row.answered)}
			</Badge>
		</>
	);
};

type PollRowProps = {
	row: DexPollRow;
	picked: boolean;
	onSelect?: (id: string) => void;
};

const PollRow = ({ row, picked, onSelect }: PollRowProps) => (
	<Panel.Row
		picked={picked}
		onPress={onSelect === undefined ? undefined : () => onSelect(row.id)}
		trailing={<Trailing row={row} />}
	>
		<span className={NUMBER}>{row.number}</span>
		{row.locked ? (
			<Redaction label={LOCKED_LABEL} />
		) : (
			<span className={QUESTION}>{row.question}</span>
		)}
	</Panel.Row>
);

const Asked = ({ detail }: { detail: DexPollDetail }) => {
	if (detail.locked) {
		return (
			<div className={ASKED}>
				<Redaction label={LOCKED_LABEL} />
				<span className={FACTS}>
					<Badge>{detail.category}</Badge>
				</span>
			</div>
		);
	}

	return (
		<div className={ASKED}>
			<Typography variant="subtitle" as="p">
				{detail.question}
			</Typography>
			<span className={FACTS}>
				<Badge>{detail.category}</Badge>
				<span className={NOTHING}>{seenLabelOf(detail.timesSeen)}</span>
				<span className={NOTHING}>{answeredLabelOf(detail.answered)}</span>
				{detail.answered === 0 ? null : (
					<Badge
						color={detail.correct === detail.answered ? "viridian" : "saffron"}
					>
						{scoreLabelOf(detail.correct, detail.answered)}
					</Badge>
				)}
				{detail.accuracy === null ? null : (
					<span className={NOTHING}>{accuracyLabelOf(detail.accuracy)}</span>
				)}
			</span>
		</div>
	);
};

const Detail = ({ detail }: { detail: DexPollDetail | null }) => {
	if (detail === null)
		return <DexDetail label={NOTHING_YET}>{NOTHING_HERE}</DexDetail>;

	return (
		<DexDetail label={detail.number}>
			<Asked detail={detail} />
		</DexDetail>
	);
};

export const DexPolls = ({
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
}: DexPollsProps) => (
	<DexBrowser
		label="polls seen"
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
			<PollRow
				key={row.id}
				row={row}
				picked={row.id === selectedId}
				onSelect={onSelect}
			/>
		))}
		detail={<Detail detail={detail} />}
	/>
);
