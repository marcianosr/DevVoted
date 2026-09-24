import { AUDITS, WHAT_EACH_POLL_PAID } from "~/shared/lib/copy";
import { Audit, auditsFiringOf, type AuditProps } from "./Audit.ui";
import { Author, type AuthorProps, type AuthorSize } from "./Author.ui";
import { Badge } from "./Badge.ui";
import { BuildFooter, type BuildFooterProps } from "./BuildFooter.ui";
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
const PAID = "border-t border-theme-faint";
// Its own region rather than a second line inside the credit footer, because
// `Panel` pads each region and not its surface — that is what lets the rule
// above the leader reach the panel's edges instead of stopping at the padding.
const LEADER_REGION = "border-t border-theme-faint px-4 py-3";
const SEPARATOR = "·";

const WRONG_COST_COLOR: KantoColor = "cinnabar";
const HOLDS_COLOR: KantoColor = "cerulean";
const CREDIT_SIZE: AuthorSize = "sm";
const COMMIT_SIZE = "md";

/**
 * The answer is sent from the poll it belongs to rather than from a footer under
 * the whole screen: the press sits beside the count it acts on, so "2 picked"
 * and "Lock in 2 answers" cannot drift apart or scroll apart.
 */
export type PollCommit = {
	/** "Lock in 2 answers", or "Lock in" while nothing is picked. */
	label: string;
	/** "2 picked", or why the press is refused while nothing is. */
	note: string;
	onPress?: () => void;
};

export type PollCoverage = {
	bar: CoverageBarProps;
	lead?: LeadLine;
	paid?: PollScoresProps;
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

type PollCreditProps = Pick<PollScreenProps, "hint" | "author" | "commit">;

const CreditTrailing = ({ hint, commit }: PollCreditProps) => (
	<>
		{hint === undefined ? null : (
			<Typography variant="hint" as="span">
				{hint}
			</Typography>
		)}
		{commit === undefined ? null : (
			<>
				<Typography variant="hint" as="span">
					{commit.note}
				</Typography>
				<Button
					size={COMMIT_SIZE}
					tone={commit.onPress === undefined ? "ambient" : "action"}
					label={commit.label}
					disabled={commit.onPress === undefined}
					onPress={commit.onPress}
				/>
			</>
		)}
	</>
);

const PollCredit = ({ hint, author, commit }: PollCreditProps) => {
	if (hint === undefined && author === undefined && commit === undefined)
		return null;

	return (
		<Panel.Footer trailing={<CreditTrailing hint={hint} commit={commit} />}>
			{author === undefined ? null : (
				<Author {...author} size={CREDIT_SIZE} rule={false} />
			)}
		</Panel.Footer>
	);
};

export const PollScreen = ({
	header,
	coverage,
	buildFooter,
	pollLabel,
	question,
	category,
	categoryColor,
	wrongCost,
	holds,
	facts,
	audits = [],
	hint,
	author,
	commit,
	categoryLeader,
	footer,
	width,
	ground = "bare",
}: PollScreenProps) => (
	<Screen gate={header.swatch.theme} width={width} ground={ground}>
		<Header {...header} />

		<Panel>
			<Panel.Header
				label={COPY.coverage}
				meta={
					<>
						<CoverageReading {...coverage.bar} />
						<span aria-hidden>{SEPARATOR}</span>
						<Tooltip
							label={SCORING_RULE_LABEL}
							hint={<ScoringRule />}
							align="end"
							width="wide"
						>
							{COPY.rule}
						</Tooltip>
					</>
				}
			/>
			<Panel.Body>
				<CoverageBar {...coverage.bar} />
				{coverage.lead === undefined ? null : (
					<Lead line={coverage.lead} variant="caption" />
				)}
			</Panel.Body>
			{coverage.paid === undefined ? null : (
				<Panel.Body className={PAID}>
					<Typography variant="hint">{WHAT_EACH_POLL_PAID}</Typography>
					<PollScores {...coverage.paid} />
				</Panel.Body>
			)}
		</Panel>

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

		<Panel>
			<Panel.Header
				label={pollLabel}
				badge={{ label: category, color: categoryColor }}
				meta={
					<>
						{holds === undefined ? null : (
							<Badge color={HOLDS_COLOR}>{holds}</Badge>
						)}
						{facts === undefined ? (
							<span>{questionFactsOf(question)}</span>
						) : null}
						{wrongCost === undefined ? null : (
							<span className={META_ROW}>
								<span aria-hidden>{SEPARATOR}</span>
								{COPY.wrongCost}
								<Badge color={WRONG_COST_COLOR}>{wrongCost}</Badge>
							</span>
						)}
					</>
				}
			/>
			{facts === undefined ? null : (
				<PollFacts {...facts} trailing={questionFactsOf(question)} />
			)}
			<Panel.Body className={facts === undefined ? undefined : PAID}>
				<Question {...question} />
			</Panel.Body>
			<PollCredit hint={hint} author={author} commit={commit} />
			{categoryLeader === undefined ? null : (
				<div className={LEADER_REGION}>
					<CategoryLeader {...categoryLeader} />
				</div>
			)}
		</Panel>

		{footer === undefined ? null : (
			<Panel>
				<Panel.Body>
					<ScreenFooter {...footer} rule={false} />
				</Panel.Body>
			</Panel>
		)}

		<BuildFooter {...buildFooter} />
	</Screen>
);
