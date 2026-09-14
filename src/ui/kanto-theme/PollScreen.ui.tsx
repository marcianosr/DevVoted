import { Audit, auditsFiringOf, type AuditProps } from "./Audit.ui";
import { Author, type AuthorProps } from "./Author.ui";
import { Badge } from "./Badge.ui";
import { BuildFooter, type BuildFooterProps } from "./BuildFooter.ui";
import type { KantoColor } from "./colors";
import { CoverageBar, coverageReadingOf } from "./CoverageBar.ui";
import type { CoverageBarProps } from "./CoverageBar.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { PanelV2 } from "./PanelV2.ui";
import { Question, questionFactsOf, type QuestionProps } from "./Question.ui";
import { SCORING_RULE_LABEL, ScoringRule } from "./ScoringRule.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Tooltip } from "./Tooltip.ui";
import { Typography } from "./Typography.ui";

const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const META_ROW = "flex flex-wrap items-center gap-2";
const SEPARATOR = "·";

const COVERAGE_TITLE = "Coverage";
const AUDITS_TITLE = "Audits";
const WRONG_COST_WORDS = "wrong costs";
const WRONG_COST_COLOR: KantoColor = "cinnabar";
const HOLDS_COLOR: KantoColor = "cerulean";

export type PollCoverage = { bar: CoverageBarProps; correct?: string };

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
	audits?: readonly AuditProps[];
	hint?: string;
	author?: AuthorProps;
	footer?: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
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
	audits = [],
	hint,
	author,
	footer,
	width,
	ground = "bare",
}: PollScreenProps) => (
	<Screen gate={header.swatch.theme} width={width} ground={ground}>
		<Header {...header} />

		<PanelV2>
			<PanelV2.Header
				label={COVERAGE_TITLE}
				meta={
					<>
						<span>{coverageReadingOf(coverage.bar)}</span>
						{coverage.correct === undefined ? null : (
							<>
								<span aria-hidden>{SEPARATOR}</span>
								<Tooltip
									label={SCORING_RULE_LABEL}
									hint={<ScoringRule />}
									align="end"
								>
									{coverage.correct}
								</Tooltip>
							</>
						)}
					</>
				}
			/>
			<PanelV2.Body>
				<CoverageBar {...coverage.bar} />
			</PanelV2.Body>
		</PanelV2>

		{audits.length === 0 ? null : (
			<PanelV2>
				<PanelV2.Header
					label={AUDITS_TITLE}
					meta={auditsFiringOf(audits.length)}
				/>
				<PanelV2.Body>
					<div className={AUDITS}>
						{audits.map((audit, index) => (
							<Audit key={audit.code ?? index} {...audit} />
						))}
					</div>
				</PanelV2.Body>
			</PanelV2>
		)}

		<PanelV2>
			<PanelV2.Header
				label={pollLabel}
				badge={{ label: category, color: categoryColor }}
				meta={
					<>
						{holds === undefined ? null : (
							<Badge color={HOLDS_COLOR}>{holds}</Badge>
						)}
						<span>{questionFactsOf(question)}</span>
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
			<PanelV2.Body>
				<Question {...question} />
			</PanelV2.Body>
			{hint === undefined ? null : (
				<PanelV2.Footer>
					<Typography variant="hint">{hint}</Typography>
				</PanelV2.Footer>
			)}
		</PanelV2>

		{author === undefined ? null : <Author {...author} />}

		{footer === undefined ? null : (
			<PanelV2>
				<PanelV2.Body>
					<ScreenFooter {...footer} rule={false} />
				</PanelV2.Body>
			</PanelV2>
		)}

		<BuildFooter {...buildFooter} />
	</Screen>
);
