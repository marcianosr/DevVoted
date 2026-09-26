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
const META_LINE = "flex justify-end sm:ml-2";
const POLL_ROW =
	"grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]";
const PINNED_READOUT = "lg:sticky lg:top-4 lg:z-10";

const PAID = "border-t border-theme-faint";
const SCORE_BLOCK = "flex w-full flex-col gap-2";
const LEADER_REGION = "border-t border-theme-faint px-4 py-3";
const META_REGION =
	"flex w-full flex-wrap items-center gap-2 border-b border-theme-faint px-4 py-3 first:rounded-t-2xl";
const META_TRAILING = "flex flex-wrap items-center gap-2 sm:ml-auto";
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

export type PollCommit = {
	label: string;
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
	swatch?: SwatchFill;
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
