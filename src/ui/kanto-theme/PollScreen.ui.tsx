import { AUDITS, WHAT_EACH_POLL_PAID } from "~/shared/lib/copy";
import { Audit, auditsFiringOf, type AuditProps } from "./Audit.ui";
import { Author, type AuthorProps, type AuthorSize } from "./Author.ui";
import { Badge } from "./Badge.ui";
import { BuildFooter, type BuildFooterProps } from "./BuildFooter.ui";
import { useBarHeight } from "./useBarHeight.hook";
import { Button } from "./Button.ui";
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
 * and whatever the build has to say about it. Its own line under the title
 * because the title row could not hold it on a phone without wrapping, and
 * because a config can add to this line — `.length` already does.
 */
const META_REGION =
	"flex w-full flex-wrap items-center gap-2 border-b border-theme-faint px-4 py-2";
const META_TRAILING = "flex flex-wrap items-center gap-2 sm:ml-auto";
/**
 * The send, and the top of the screen's pinned stack. It rides the bottom of the
 * viewport while the poll runs off the end of it, then settles above the byline
 * once the panel's end is in view — so the press is always within reach of the
 * question it commits, and never floats free of the panel it belongs to.
 *
 * It carries no `bottom-*` class: the build sheet is pinned beneath it and the
 * gap it has to clear is that sheet's measured height, which changes when the
 * fold opens. A class and an inline override for one property would only be two
 * answers to the same question, one of them stale.
 *
 * It carries the panel's own ground: a transparent sticky row would have the
 * answers scrolling through it. The bottom rounding only ever applies to a poll
 * that credits nobody, where this row is the panel's last.
 */
const COMMIT_REGION =
	"sticky z-10 flex w-full flex-wrap items-center gap-3 border-t border-theme-faint bg-theme-faint px-4 py-3 last:rounded-b-2xl";
const COMMIT_PRESS = "ml-auto";

const COMMIT_SIZE = "md";

/**
 * Where the send sits while nothing is pinned under it. Not an estimate of the
 * sheet — an estimate would be wrong in the one direction that hides the press,
 * and wrong for a long time: the server renders the fold open, a phone collapses
 * it at hydration, so no single number describes both. The sheet does not pin
 * until it has been measured, which makes the bare floor the honest answer here.
 */
const VIEWPORT_FLOOR = 0;

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
	pollLabel: string;
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

const CreditTrailing = ({ hint }: PollCreditProps) =>
	hint === undefined ? null : (
		<Typography variant="hint" as="span">
			{hint}
		</Typography>
	);

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
const PollSend = ({ commit, footer, sendFloor }: PollSendProps) => {
	if (footer !== undefined)
		return (
			<div className={COMMIT_REGION} style={{ bottom: sendFloor }}>
				<ScreenFooter {...footer} rule={false} />
			</div>
		);

	if (commit === undefined) return null;

	return (
		<div className={COMMIT_REGION} style={{ bottom: sendFloor }}>
			<Typography variant="hint" as="span">
				{commit.note}
			</Typography>
			<span className={COMMIT_PRESS}>
				<Button
					size={COMMIT_SIZE}
					tone={commit.onPress === undefined ? "ambient" : "action"}
					label={commit.label}
					disabled={commit.onPress === undefined}
					onPress={commit.onPress}
				/>
			</span>
		</div>
	);
};

type PollSendProps = Pick<PollScreenProps, "commit" | "footer"> & {
	/** How far off the viewport floor the send sits: the sheet's own height. */
	sendFloor: number;
};

type PollPanelProps = Pick<
	PollScreenProps,
	| "pollLabel"
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
	pollLabel,
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
	sendFloor,
}: PollPanelProps) => (
	<Panel>
		<Panel.Header label={pollLabel} />
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
		<PollSend commit={commit} footer={footer} sendFloor={sendFloor} />
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
	const [measureSheet, sheetHeight] = useBarHeight();

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
				<PollPanel {...poll} sendFloor={sheetHeight ?? VIEWPORT_FLOOR} />
				<CoveragePanel {...coverage} />
			</div>

			<BuildFooter
				{...buildFooter}
				ref={measureSheet}
				pinned={sheetHeight !== undefined}
			/>
		</Screen>
	);
};
