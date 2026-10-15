import { Author, type AuthorProps, type AuthorSize } from "./Author.ui";
import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { CodeSpans } from "./CodeText.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Panel } from "./Panel.ui";
import { Question, type QuestionProps, questionFactsOf } from "./Question.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenActions, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Swatch } from "./Swatch.ui";
import { Typography } from "./Typography.ui";
import { Verdict, type VerdictOutcome } from "./Verdict.ui";

const ROWS = "flex w-full flex-col gap-6";
const META_REGION =
	"flex w-full flex-wrap items-center gap-2 border-b border-theme-faint px-4 py-3 first:rounded-t-2xl";
const META_TRAILING = "flex flex-wrap items-center gap-2 sm:ml-auto";
const EXPLANATION =
	"flex w-full flex-col gap-1.5 rounded-lg border border-theme-faint px-4 py-3";

const COPY = { explanation: "Explanation" } as const;

const CREDIT_SIZE: AuthorSize = "sm";

export type ReviewRow = {
	verdict: VerdictOutcome;
	share?: number;
	category: string;
	coverage: string;
	coverageColor?: KantoColor;
	card: QuestionProps;
	tally?: string;
	explanation?: string;
	note?: string;
	author?: AuthorProps;
};

export type ReviewScreenProps = {
	header: HeaderProps;
	rows: readonly ReviewRow[];
	footer: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

type ReviewCardProps = {
	row: ReviewRow;
	number: number;
	swatch: HeaderProps["swatch"];
};

const ReviewCard = ({ row, number, swatch }: ReviewCardProps) => (
	<Panel>
		<div className={META_REGION}>
			<Swatch state="current" swatch={swatch} count={number} />
			<Badge>{row.category}</Badge>
			<Typography variant="hint" as="span">
				{questionFactsOf(row.card)}
			</Typography>
			<span className={META_TRAILING}>
				<Verdict outcome={row.verdict} share={row.share} width="fit" />
				<Badge color={row.coverageColor}>{row.coverage}</Badge>
			</span>
		</div>
		<Panel.Body>
			<Question {...row.card} />
			{row.tally === undefined ? null : <Badge>{row.tally}</Badge>}
			{row.explanation === undefined ? null : (
				<div className={EXPLANATION}>
					<Typography variant="subtitle" as="span">
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
		</Panel.Body>
		{row.author === undefined ? null : (
			<Panel.Footer>
				<Author {...row.author} size={CREDIT_SIZE} rule={false} />
			</Panel.Footer>
		)}
	</Panel>
);

export const ReviewScreen = ({
	header,
	rows,
	footer,
	width = "default",
	ground = "bare",
}: ReviewScreenProps) => (
	<Screen gate={header.swatch.theme} width={width} ground={ground} enter="rise">
		<Header {...header} />

		<div className={ROWS}>
			{rows.map((row, index) => (
				<ReviewCard
					key={index}
					row={row}
					number={index + 1}
					swatch={header.swatch}
				/>
			))}
		</div>

		<ScreenActions {...footer} width="capped" />
	</Screen>
);
