import { clsx } from "clsx";

import { AUDITS, WHAT_EACH_POLL_PAID } from "~/shared/lib/copy";
import { Action } from "./Action.ui";
import { Audit, auditsFiringOf, type AuditProps } from "./Audit.ui";
import { Author, type AuthorProps, type AuthorSize } from "./Author.ui";
import { Badge } from "./Badge.ui";
import { BuildFooter, type BuildFooterProps } from "./BuildFooter.ui";
import { useBarHeight } from "./useBarHeight.hook";
import type { KantoColor } from "./colors";
import { CoverageBar, CoverageReading } from "./CoverageBar.ui";
import type { CoverageBarProps } from "./CoverageBar.ui";
import { CategoryLeader, type CategoryLeaderProps } from "./CategoryLeader.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Lead, type LeadLine } from "./Lead.ui";
import { Panel } from "./Panel.ui";
import { PollFacts, type PollFactsProps } from "./PollFacts.ui";
import { PollScores, type PollScoresProps } from "./PollScores.ui";
import { Question, questionFactsOf, type QuestionProps } from "./Question.ui";
import { SCORING_RULE_LABEL, ScoringRule } from "./ScoringRule.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import type { SwatchFill } from "./Swatch.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Tooltip } from "./Tooltip.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	coverage: "Coverage",
	rule: "what a poll pays",
	wrongCost: "wrong costs",
} as const;

const AUDITS_ROW = "flex w-full flex-wrap items-stretch gap-3";
const META_ROW = "flex flex-wrap items-center gap-2";
/**
 * Beside the readings, not under them, with air between: the rule is a thing to
 * press and the readings are figures, so the gap is what tells them apart. It
 * still wraps to its own line on a phone — the row it sits in allows that — but
 * it no longer claims one at every width.
 */
const META_LINE = "flex justify-end sm:ml-2";
/**
 * The question and the thing it is being weighed against, side by side once
 * there is room for both. The poll leads in the source, so a phone gets it
 * first and the readout under it — a reader who has to scroll past the
 * coverage panel to reach the question is reading the screen backwards.
 *
 * A fixed rail rather than a fraction: the readout is a fixed set of figures
 * and a bar, and giving it a share of the width would only stretch it while
 * squeezing the one column whose content actually varies in length.
 */
const POLL_ROW =
	"grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]";
/**
 * The readout follows the answers down the page: it is what every choice on the
 * screen is being weighed against, and scrolling it away leaves the player
 * picking blind.
 *
 * It pins only where it sits beside the question. Stacked under the poll on a
 * phone there is nothing above the answers to pin, and `POLL_ROW`'s
 * `items-start` is what gives the rail a box short enough to travel inside —
 * a stretched grid item is already as tall as its row and cannot move.
 *
 * `z-10` sits below `BuildFooter`'s `z-20`, which pins to the bottom.
 */
const PINNED_READOUT = "lg:sticky lg:top-4 lg:z-10";

const PAID = "border-t border-theme-faint";
/**
 * Its own column rather than leaning on `Panel.Body`'s gap: the body spaces
 * unrelated regions at `gap-4`, and a heading wants to sit nearer the thing it
 * heads than that. Overriding the body's own gap is not an option — two `gap`
 * utilities are resolved by Tailwind's order, not by ours.
 */
const SCORE_BLOCK = "flex w-full flex-col gap-2";
// Its own region rather than a second line inside the credit footer, because
// `Panel` pads each region and not its surface — that is what lets the rule
// above the leader reach the panel's edges instead of stopping at the padding.
const LEADER_REGION = "border-t border-theme-faint px-4 py-3";
/**
 * Everything about the poll that is not the question: its category, its shape,
 * and whatever the build has to say about it.
 *
 * This is the panel's whole header. The count that used to head it ("Poll 1 out
 * of 5") is already on the screen — the coverage rail states the run's position
 * in the window — and two stacked header rows above a question read as chrome
 * before the thing the screen is actually asking.
 */
const META_REGION =
	"flex w-full flex-wrap items-center gap-2 border-b border-theme-faint px-4 py-3 first:rounded-t-2xl";
const META_TRAILING = "flex flex-wrap items-center gap-2 sm:ml-auto";
/**
 * The send, and the floor of the screen's pinned stack. It rides the bottom of
 * the viewport while the poll runs off the end of it, then settles above the
 * byline once the panel's end is in view — so the press is always within reach
 * of the question it commits, and never floats free of the panel it belongs to.
 *
 * It holds the floor rather than riding on the build sheet: this is the one
 * press the screen is asking for, and a bar that has to be found above another
 * bar is not the first thing a thumb reaches. The sheet is seated on it
 * instead, off this row's measured height.
 *
 * The send alone draws no ground: it is an opaque bar already, and a second one
 * behind it is a black plate around a press. The screen's own footer does draw
 * one — it seats bare text over answers that scroll beneath. The bottom
 * rounding only ever applies to a poll that credits nobody, where this row is
 * the panel's last.
 */
const COMMIT_REGION =
	"sticky bottom-0 z-10 flex w-full flex-col gap-3 px-4 py-3 last:rounded-b-2xl";
const COMMIT_GROUND = "border-t border-theme-faint bg-theme-faint";

const WRONG_COST_COLOR: KantoColor = "cinnabar";
const HOLDS_COLOR: KantoColor = "cerulean";
const CREDIT_SIZE: AuthorSize = "sm";

export type PollCoverage = {
	bar: CoverageBarProps;
	lead?: LeadLine;
	paid?: PollScoresProps;
};

/**
 * The answer's send. It states the count it acts on beside itself, so "2 picked"
 * and "Lock in 2 answers" cannot drift apart or scroll apart.
 */
export type PollCommit = {
	/** "Lock in 2 answers", or "Lock in" while nothing is picked. */
	label: string;
	/** "2 picked", or why the press is refused while nothing is. */
	note: string;
	onPress?: () => void;
};

export type PollScreenProps = {
	header: HeaderProps;
	coverage: PollCoverage;
	buildFooter: BuildFooterProps;
	question: QuestionProps;
	category: string;
	categoryColor?: KantoColor;
	wrongCost?: string;
	holds?: string;

	facts?: Omit<PollFactsProps, "trailing">;
	audits?: readonly AuditProps[];
	hint?: string;
	author?: AuthorProps;
	commit?: PollCommit;
	categoryLeader?: CategoryLeaderProps;
	footer?: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

type PollCreditProps = Pick<PollScreenProps, "hint" | "author">;

/**
 * A badge, not a hint: what it states about the author is the same kind of fact
 * as the streak the category leader wears on the row below, and the two sit at
 * the same trailing edge. Reading one as a label and the other as an aside made
 * the pair look like two unrelated rows.
 */
const CreditTrailing = ({ hint }: PollCreditProps) =>
	hint === undefined ? null : <Badge>{hint}</Badge>;

const PollCredit = ({ hint, author }: PollCreditProps) => {
	if (hint === undefined && author === undefined) return null;

	return (
		<Panel.Footer trailing={<CreditTrailing hint={hint} />}>
			{author === undefined ? null : (
				<Author {...author} size={CREDIT_SIZE} rule={false} />
			)}
		</Panel.Footer>
	);
};

const CoveragePanel = ({ bar, lead, paid }: PollCoverage) => (
	<Panel className={PINNED_READOUT}>
		<Panel.Header
			label={COPY.coverage}
			meta={
				<>
					<CoverageReading {...bar} />
					<span className={META_LINE}>
						<Tooltip
							label={SCORING_RULE_LABEL}
							hint={<ScoringRule />}
							align="end"
							width="wide"
						>
							{COPY.rule}
						</Tooltip>
					</span>
				</>
			}
		/>
		<Panel.Body>
			<CoverageBar {...bar} />
			{lead === undefined ? null : <Lead line={lead} variant="caption" />}
		</Panel.Body>
		{paid === undefined ? null : (
			<Panel.Body className={PAID}>
				<div className={SCORE_BLOCK}>
					<Typography variant="title" as="h3">
						{WHAT_EACH_POLL_PAID}
					</Typography>
					<PollScores {...paid} />
				</div>
			</Panel.Body>
		)}
	</Panel>
);

/**
 * The send and the screen's own press share one slot because the two never
 * coexist: one commits the answer, the other moves past it once it is committed.
 */
const PollSend = ({ commit, footer, swatch, measure }: PollSendProps) => {
	if (footer === undefined && commit === undefined) return null;

	return (
		<div
			ref={measure}
			className={clsx(COMMIT_REGION, footer !== undefined && COMMIT_GROUND)}
		>
			{footer === undefined ? null : <ScreenFooter {...footer} rule={false} />}
			{commit === undefined ? null : (
				<Action
					label={commit.label}
					note={commit.note}
					swatch={swatch}
					onPress={commit.onPress}
				/>
			)}
		</div>
	);
};

type PollSendProps = Pick<PollScreenProps, "commit" | "footer"> & {
	/** The gate being played, so the send wears the mark of what it commits to. */
	swatch?: SwatchFill;
	/**
	 * Addresses this row's own element. The screen measures it to seat the build
	 * sheet clear of it, which is a height only the DOM knows: the row wraps and
	 * the note under the label changes length as the answer does.
	 */
	measure: (bar: HTMLElement | null) => void;
};

type PollPanelProps = Pick<
	PollScreenProps,
	| "question"
	| "category"
	| "categoryColor"
	| "wrongCost"
	| "holds"
	| "facts"
	| "hint"
	| "author"
	| "categoryLeader"
> &
	PollSendProps;

const PollPanel = ({
	question,
	category,
	categoryColor,
	wrongCost,
	holds,
	facts,
	hint,
	author,
	categoryLeader,
	commit,
	footer,
	swatch,
	measure,
}: PollPanelProps) => (
	<Panel>
		<div className={META_REGION}>
			<Badge color={categoryColor}>{category}</Badge>
			<Typography variant="hint" as="span">
				{questionFactsOf(question)}
			</Typography>
			{holds === undefined && wrongCost === undefined ? null : (
				<span className={META_TRAILING}>
					{holds === undefined ? null : (
						<Badge color={HOLDS_COLOR}>{holds}</Badge>
					)}
					{wrongCost === undefined ? null : (
						<span className={META_ROW}>
							<Typography variant="hint" as="span">
								{COPY.wrongCost}
							</Typography>
							<Badge color={WRONG_COST_COLOR}>{wrongCost}</Badge>
						</span>
					)}
				</span>
			)}
		</div>
		{facts === undefined ? null : <PollFacts {...facts} />}
		<Panel.Body className={facts === undefined ? undefined : PAID}>
			<Question {...question} />
		</Panel.Body>
		<PollSend
			commit={commit}
			footer={footer}
			swatch={swatch}
			measure={measure}
		/>
		<PollCredit hint={hint} author={author} />
		{categoryLeader === undefined ? null : (
			<div className={LEADER_REGION}>
				<CategoryLeader {...categoryLeader} />
			</div>
		)}
	</Panel>
);

export const PollScreen = ({
	header,
	coverage,
	buildFooter,
	audits = [],
	width = "wide",
	ground = "bare",
	...poll
}: PollScreenProps) => {
	const [measureSend, sendHeight] = useBarHeight();

	return (
		<Screen gate={header.swatch.theme} width={width} ground={ground}>
			<Header {...header} />

			{audits.length === 0 ? null : (
				<Panel>
					<Panel.Header label={AUDITS} meta={auditsFiringOf(audits.length)} />
					<Panel.Body>
						<div className={AUDITS_ROW}>
							{audits.map((audit, index) => (
								<Audit key={audit.code ?? index} {...audit} />
							))}
						</div>
					</Panel.Body>
				</Panel>
			)}

			<div className={POLL_ROW}>
				<PollPanel
					{...poll}
					swatch={{ state: "current", swatch: header.swatch }}
					measure={measureSend}
				/>
				<CoveragePanel {...coverage} />
			</div>

			<BuildFooter {...buildFooter} seat={sendHeight} />
		</Screen>
	);
};
