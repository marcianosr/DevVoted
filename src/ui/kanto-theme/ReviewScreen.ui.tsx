import { Author, type AuthorProps } from "./Author.ui";
import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { Fold, type FoldBadge } from "./Fold.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { CodeSpans, Question, type QuestionProps } from "./Question.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenActions, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Typography } from "./Typography.ui";
import type { VerdictOutcome } from "./Verdict.ui";

const CONTROL_ROW = "flex w-full flex-wrap items-center gap-3";
const EXPAND = "ml-auto shrink-0";
const ROWS = "flex w-full flex-col gap-3";
const PASSED = "opacity-70";
const EXPLANATION =
	"flex w-full flex-col gap-1.5 rounded-lg border border-theme-faint px-4 py-3";

const COPY = { explanation: "Explanation" } as const;

const EXPAND_SIZE = "md";

export type ReviewRow = {
	verdict: VerdictOutcome;
	share?: number;
	question: string;
	category: string;
	coverage: string;
	coverageColor?: FoldBadge["color"];
	open?: boolean;
	card: QuestionProps;
	tally?: string;
	explanation?: string;
	note?: string;
	author?: AuthorProps;
};

export type ReviewExpand = { label: string; onPress?: () => void };

export type ReviewScreenProps = {
	header: HeaderProps;
	hint: string;
	expand: ReviewExpand;
	rows: readonly ReviewRow[];
	footer: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

const opensOnArrival = (row: ReviewRow) =>
	row.open ?? row.verdict !== "correct";

const Row = ({ row }: { row: ReviewRow }) => {
	const open = opensOnArrival(row);

	return (
		<div className={open ? undefined : PASSED}>
			<Fold
				lead={row.verdict}
				leadShare={row.share}
				leadWidth="fit"
				heading="row"
				title={row.question}
				badges={[
					{ label: row.category },
					{ label: row.coverage, color: row.coverageColor },
				]}
				open={open}
			>
				<Question {...row.card} />
				{row.tally === undefined ? null : <Badge>{row.tally}</Badge>}
				{row.explanation === undefined ? null : (
					<div className={EXPLANATION}>
						<Typography variant="label" as="span">
							{COPY.explanation}
						</Typography>
						<Typography variant="caption" as="p">
							<CodeSpans text={row.explanation} />
						</Typography>
					</div>
				)}
				{row.note === undefined ? null : (
					<Typography variant="hint">{row.note}</Typography>
				)}
				{row.author === undefined ? null : <Author {...row.author} />}
			</Fold>
		</div>
	);
};

export const ReviewScreen = ({
	header,
	hint,
	expand,
	rows,
	footer,
	width = "default",
	ground = "bare",
}: ReviewScreenProps) => (
	<Screen gate={header.swatch.theme} width={width} ground={ground} enter="rise">
		<Header {...header} />

		<div className={CONTROL_ROW}>
			<Typography variant="hint" as="span">
				{hint}
			</Typography>
			<span className={EXPAND}>
				<Button
					size={EXPAND_SIZE}
					label={expand.label}
					disabled={expand.onPress === undefined}
					onPress={expand.onPress}
				/>
			</span>
		</div>

		<div className={ROWS}>
			{rows.map((row, index) => (
				<Row key={index} row={row} />
			))}
		</div>

		<ScreenActions {...footer} />
	</Screen>
);
