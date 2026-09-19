import { AnswerDiff, type AnswerDiffProps } from "./AnswerDiff.ui";
import { Author, type AuthorProps } from "./Author.ui";
import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { CodeBlock } from "./CodeBlock.ui";
import { Fold, type FoldBadge } from "./Fold.ui";
import { Panel } from "./Panel.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Swatch } from "./Swatch.ui";
import { Typography } from "./Typography.ui";
import type { VerdictOutcome } from "./Verdict.ui";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

const HEADER = "flex w-full flex-col gap-4";
const TITLE_ROW = "flex w-full items-start gap-4";
const NAMING = "flex min-w-0 flex-col gap-1";
const TALLY = "ml-auto flex shrink-0 flex-wrap items-center gap-2";
const CONTROL_ROW = "flex w-full flex-wrap items-center gap-3";
const EXPAND = "ml-auto shrink-0";
const ROWS = "flex w-full flex-col gap-3";
const PASSED = "opacity-70";

const SWATCH_SIZE = "hero";
const EXPAND_SIZE = "md";

export type ReviewRow = {
	verdict: VerdictOutcome;
	share?: number;
	question: string;
	category: string;
	coverage: string;
	coverageColor?: FoldBadge["color"];
	open?: boolean;
	codeBlock?: string;
	diff: AnswerDiffProps;
	explanation?: string;
	note?: string;
	author?: AuthorProps;
};

export type ReviewHeader = {
	swatch: GateSwatch;
	title: string;
	subtitle: string;
	badges: readonly FoldBadge[];
};

export type ReviewExpand = { label: string; onPress?: () => void };

export type ReviewScreenProps = {
	header: ReviewHeader;
	hint: string;
	expand: ReviewExpand;
	rows: readonly ReviewRow[];
	footer: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

const opensOnArrival = (row: ReviewRow) =>
	row.open ?? row.verdict !== "correct";

const ReviewHeading = ({ swatch, title, subtitle, badges }: ReviewHeader) => (
	<header className={HEADER}>
		<div className={TITLE_ROW}>
			<Swatch state="discovered" swatch={swatch} size={SWATCH_SIZE} />
			<span className={NAMING}>
				<Typography variant="headline" as="h1">
					{title}
				</Typography>
				<Typography variant="hint" as="span">
					{subtitle}
				</Typography>
			</span>
			<span className={TALLY}>
				{badges.map((badge, index) => (
					<Badge key={index} color={badge.color}>
						{badge.label}
					</Badge>
				))}
			</span>
		</div>
	</header>
);

const Row = ({ row }: { row: ReviewRow }) => {
	const open = opensOnArrival(row);

	return (
		<div className={open ? undefined : PASSED}>
			<Fold
				lead={row.verdict}
				leadShare={row.share}
				heading="row"
				title={row.question}
				badges={[
					{ label: row.category },
					{ label: row.coverage, color: row.coverageColor },
				]}
				open={open}
			>
				{row.codeBlock === undefined ? null : (
					<CodeBlock>{row.codeBlock}</CodeBlock>
				)}
				<AnswerDiff {...row.diff} />
				{row.explanation === undefined ? null : (
					<Typography variant="caption" as="p">
						{row.explanation}
					</Typography>
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
	<Screen gate={header.swatch.theme} width={width} ground={ground}>
		<ReviewHeading {...header} />

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

		<Panel>
			<Panel.Body>
				<ScreenFooter {...footer} rule={false} />
			</Panel.Body>
		</Panel>
	</Screen>
);
