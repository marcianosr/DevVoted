import { Audit, auditsFiringOf, type AuditProps } from "./Audit.ui";
import { Author, type AuthorProps, type AuthorSize } from "./Author.ui";
import { Badge } from "./Badge.ui";
import { BuildFooter, type BuildFooterProps } from "./BuildFooter.ui";
import type { KantoColor } from "./colors";
import { CoverageBar, coverageReadingOf } from "./CoverageBar.ui";
import type { CoverageBarProps } from "./CoverageBar.ui";
import { HallOfFame, type HallOfFameProps } from "./HallOfFame.ui";
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

const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const META_ROW = "flex flex-wrap items-center gap-2";
const PAID = "border-t border-theme-faint";
const SEPARATOR = "·";

const COVERAGE_TITLE = "Coverage";
const PAID_TITLE = "what each poll paid";
const RULE_WORDS = "what a poll pays";
const AUDITS_TITLE = "Audits";
const WRONG_COST_WORDS = "wrong costs";
const WRONG_COST_COLOR: KantoColor = "cinnabar";
const HOLDS_COLOR: KantoColor = "cerulean";
const CREDIT_SIZE: AuthorSize = "sm";

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
	record?: HallOfFameProps;
	footer?: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

type PollCreditProps = Pick<PollScreenProps, "hint" | "author">;

const PollCredit = ({ hint, author }: PollCreditProps) => {
	if (hint === undefined && author === undefined) return null;

	return (
		<Panel.Footer
			trailing={
				hint === undefined ? undefined : (
					<Typography variant="hint" as="span">
						{hint}
					</Typography>
				)
			}
		>
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
	record,
	footer,
	width,
	ground = "bare",
}: PollScreenProps) => (
	<Screen gate={header.swatch.theme} width={width} ground={ground}>
		<Header {...header} />

		<Panel>
			<Panel.Header
				label={COVERAGE_TITLE}
				meta={
					<>
						<span>{coverageReadingOf(coverage.bar)}</span>
						<span aria-hidden>{SEPARATOR}</span>
						<Tooltip
							label={SCORING_RULE_LABEL}
							hint={<ScoringRule />}
							align="end"
							width="wide"
						>
							{RULE_WORDS}
						</Tooltip>
					</>
				}
			/>
			<Panel.Body>
				<CoverageBar {...coverage.bar} />
				{coverage.lead === undefined ? null : (
					<Lead line={coverage.lead} variant="paragraph" />
				)}
			</Panel.Body>
			{coverage.paid === undefined ? null : (
				<Panel.Body className={PAID}>
					<Typography variant="hint">{PAID_TITLE}</Typography>
					<PollScores {...coverage.paid} />
				</Panel.Body>
			)}
		</Panel>

		{audits.length === 0 ? null : (
			<Panel>
				<Panel.Header
					label={AUDITS_TITLE}
					meta={auditsFiringOf(audits.length)}
				/>
				<Panel.Body>
					<div className={AUDITS}>
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
								{WRONG_COST_WORDS}
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
			<PollCredit hint={hint} author={author} />
			{record === undefined ? null : <HallOfFame {...record} />}
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
