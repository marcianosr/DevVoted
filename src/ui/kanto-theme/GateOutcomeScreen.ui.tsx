import { WHAT_EACH_POLL_PAID } from "~/shared/lib/copy";
import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	CoverageBar,
	type CoverageBandId,
	type CoverageBarProps,
} from "./CoverageBar.ui";
import { Audit, type AuditProps } from "./Audit.ui";
import { Figures } from "./Figures.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Fold, type FoldBadge } from "./Fold.ui";
import { PollScores, type PollScoresProps } from "./PollScores.ui";
import { GateChoice, type GateChoiceProps } from "./GateChoice.ui";
import { LedgerRows, type LedgerRow } from "./LedgerRows.ui";
import { Panel } from "./Panel.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import {
	type FooterAction,
	ScreenActions,
	type ScreenFooterProps,
} from "./ScreenFooter.ui";
import { Swatch, type SwatchFill } from "./Swatch.ui";
import { Typography } from "./Typography.ui";
import { Version } from "./Version.ui";

const COPY = {
	coverage: "Coverage",
	whatHappened: "What happened",
} as const;

const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";
const RECAP = "flex w-full flex-col gap-3";
const RECAP_ASIDES = "flex w-full flex-wrap gap-3";
const LEAD =
	"badge-theme inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums";
const NAMING = "flex min-w-0 grow flex-col gap-1";
const NAME_LINE = "flex flex-wrap items-center gap-2";
const DETAIL = "text-xs text-theme-muted";
const MARKS = "flex items-center gap-1";
const EDGED = "border-l-2 border-l-theme bg-theme/5";
const ROW_ROOM = "py-3";
const VERSION_ARROW = "→";
const NEXT_GATE = "flex flex-col gap-2 border-t border-theme-faint pt-3";
const RATES = "flex flex-col gap-1.5";
const RATE = "flex items-center justify-between gap-3";

const RATE_COLOR: KantoColor = "viridian";

const RUN_OVER_BAND: CoverageBandId = "danger";
const HOLD_COLOR: KantoColor = "cinnabar";
const RUN_OVER_COLOR: KantoColor = "cinnabar";

export type GateOutcomePanel = {
	title: string;
	summary?: string;
	badges?: readonly FoldBadge[];
	open?: boolean;
};

export type GateOutcomeLedgerPanel = GateOutcomePanel & {
	rows: readonly LedgerRow[];
};

export type GateOutcomeBonusPanel = GateOutcomePanel & { detail: string };

export type GateOutcomeLead =
	| { weight: number; glyph?: never; swatch?: never; color?: KantoColor }
	| { glyph: string; weight?: never; swatch?: never; color?: KantoColor }
	| { swatch: SwatchFill; weight?: never; glyph?: never; color?: never };

export type GateOutcomeVersions = { from?: number; to: number };

export type GateOutcomeRow = {
	lead: GateOutcomeLead;
	name: string;
	versions?: GateOutcomeVersions;
	verb?: string;
	detail?: string;
	marks?: readonly SwatchFill[];
	badge: FoldBadge;
	edge?: KantoColor;
};

export type GateOutcomeRowsPanel = GateOutcomePanel & {
	rows: readonly GateOutcomeRow[];
	hint?: string;
};

export type GateOutcomeAnswersPanel = GateOutcomeLedgerPanel;

export type GateEnding = { title: string; detail: string };

export type GateOutcomeTail =
	| { choice: GateChoiceProps; ending?: never }
	| { ending: GateEnding; choice?: never };

export type NextGateRate = { label: string; gain: string };

export type NextGateRates = {
	title: string;
	rates: readonly NextGateRate[];
};

export type GateOutcomeScreenProps = {
	header: HeaderProps;
	bar: CoverageBarProps;
	nextGate?: NextGateRates;
	outcome: CoverageBandId;
	coverageHold?: string;
	bonus?: GateOutcomeBonusPanel;
	payouts?: PollScoresProps;
	coverage: GateOutcomeLedgerPanel;
	storage: GateOutcomeLedgerPanel;
	earned?: GateOutcomeRowsPanel;
	changes?: GateOutcomeRowsPanel;
	answers: GateOutcomeAnswersPanel;
	audits?: readonly AuditProps[];
	tail?: GateOutcomeTail;
	footer: ScreenFooterProps;
	width?: ScreenWidth;
};

type CoveragePanelProps = {
	bar: CoverageBarProps;
	nextGate?: NextGateRates;
	meter: CoverageBandId;
	hold?: string;
	bonus?: GateOutcomeBonusPanel;
	payouts?: PollScoresProps;
	open?: boolean;
};

const NextGate = ({ title, rates }: NextGateRates) => (
	<div className={NEXT_GATE}>
		<Typography variant="hint">{title}</Typography>
		<ul aria-label={title} className={RATES}>
			{rates.map((rate) => (
				<li key={rate.label} className={RATE}>
					<Typography variant="caption">{rate.label}</Typography>
					<Badge color={RATE_COLOR}>{rate.gain}</Badge>
				</li>
			))}
		</ul>
	</div>
);

const CoveragePanel = ({
	bar,
	nextGate,
	meter,
	hold,
	bonus,
	payouts,
	open = true,
}: CoveragePanelProps) => (
	<Fold
		title={COPY.coverage}
		summary={bonus?.summary}
		badges={[
			...(bonus?.badges ?? []),
			{ label: COVERAGE_BAND_WORD[meter], color: COVERAGE_BAND_COLOR[meter] },
			...(hold === undefined ? [] : [{ label: hold, color: HOLD_COLOR }]),
		]}
		open={open}
	>
		{bonus === undefined ? null : (
			<Typography variant="prose">
				<Figures text={bonus.detail} />
			</Typography>
		)}
		<CoverageBar {...bar} pin />
		{nextGate === undefined ? null : <NextGate {...nextGate} />}
		{payouts === undefined ? null : (
			<>
				<Typography variant="hint">{WHAT_EACH_POLL_PAID}</Typography>
				<PollScores {...payouts} />
			</>
		)}
	</Fold>
);

const LedgerPanel = ({ rows, ...panel }: GateOutcomeLedgerPanel) => (
	<Fold {...panel}>
		<LedgerRows rows={rows} />
	</Fold>
);

const LeadTile = ({ lead }: { lead: GateOutcomeLead }) => {
	if (lead.swatch !== undefined)
		return <Swatch size="large" {...lead.swatch} />;

	return (
		<span aria-hidden data-screen-theme={lead.color} className={LEAD}>
			{lead.weight ?? lead.glyph}
		</span>
	);
};

const Versions = ({ from, to }: GateOutcomeVersions) => (
	<>
		{from === undefined ? null : (
			<>
				<Version version={from} />
				<span aria-hidden>{VERSION_ARROW}</span>
			</>
		)}
		<Version version={to} />
	</>
);

const OutcomeRow = ({ row }: { row: GateOutcomeRow }) => (
	<Panel.Row
		theme={row.edge}
		className={clsx(ROW_ROOM, row.edge !== undefined && EDGED)}
		trailing={<Badge color={row.badge.color}>{row.badge.label}</Badge>}
	>
		<LeadTile lead={row.lead} />
		<span className={NAMING}>
			<span className={NAME_LINE}>
				<Typography variant="subtitle" as="span">
					{row.name}
				</Typography>
				{row.versions === undefined ? null : <Versions {...row.versions} />}
				{row.verb === undefined ? null : (
					<Typography variant="subtitle" as="span">
						{row.verb}
					</Typography>
				)}
			</span>
			{row.detail === undefined ? null : (
				<span className={DETAIL}>{row.detail}</span>
			)}
			{row.marks === undefined ? null : (
				<span aria-hidden className={MARKS}>
					{row.marks.map((mark, index) => (
						<Swatch key={index} size="small" {...mark} />
					))}
				</span>
			)}
		</span>
	</Panel.Row>
);

const RowsPanel = ({ rows, hint, ...panel }: GateOutcomeRowsPanel) => (
	<Fold {...panel} flush>
		<Panel.Rows>
			{rows.map((row, index) => (
				<OutcomeRow key={index} row={row} />
			))}
		</Panel.Rows>
		{hint === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint" as="span">
					{hint}
				</Typography>
			</Panel.Footer>
		)}
	</Fold>
);

const AnswersPanel = ({ rows, ...panel }: GateOutcomeAnswersPanel) => (
	<Fold {...panel}>
		<LedgerRows rows={rows} />
	</Fold>
);

const EndingPanel = ({ title, detail }: GateEnding) => (
	<Panel>
		<Panel.Header label={title} />
		<Panel.Body>
			<Typography variant="paragraph">
				<Figures text={detail} />
			</Typography>
		</Panel.Body>
	</Panel>
);

const RecapAsides = ({ asides = [] }: { asides?: readonly FooterAction[] }) =>
	asides.length === 0 ? null : (
		<div className={RECAP_ASIDES}>
			{asides.map((aside) => (
				<Button
					key={aside.label}
					size="lg"
					tone="ambient"
					label={aside.label}
					icon={aside.icon}
					iconAt={aside.iconAt}
					disabled={aside.onPress === undefined}
					onPress={aside.onPress}
				/>
			))}
		</div>
	);

export const GateOutcomeScreen = ({
	header,
	bar,
	nextGate,
	outcome,
	coverageHold,
	bonus,
	payouts,
	coverage,
	storage,
	earned,
	changes,
	answers,
	audits = [],
	tail,
	footer,
	width = "default",
}: GateOutcomeScreenProps) => {
	const meter = bar.band;
	const settling = tail?.choice !== undefined;

	const shut = <T extends GateOutcomePanel>(panel: T): T =>
		settling ? { ...panel, open: false } : panel;

	const coveragePanel = (
		<CoveragePanel
			bar={bar}
			nextGate={nextGate}
			meter={meter}
			hold={coverageHold}
			bonus={bonus}
			payouts={payouts}
			open={!settling}
		/>
	);
	const coverageLedger = <LedgerPanel {...shut(coverage)} />;
	const storageLedger = <LedgerPanel {...shut(storage)} />;
	const earnedPanel =
		earned === undefined ? null : <RowsPanel {...shut(earned)} />;
	const changesPanel =
		changes === undefined ? null : <RowsPanel {...shut(changes)} />;
	const answersPanel = <AnswersPanel {...shut(answers)} />;

	const body = (
		<>
			<Header {...header} pinned />

			{audits.length === 0 ? null : (
				<div className={AUDITS}>
					{audits.map((audit, index) => (
						<Audit key={index} {...audit} />
					))}
				</div>
			)}

			{tail?.choice === undefined ? null : (
				<GateChoice
					{...tail.choice}
					retry={{ ...footer.action, note: footer.note }}
				/>
			)}

			{settling ? (
				<section className={RECAP}>
					<Typography variant="label" as="h2">
						{COPY.whatHappened}
					</Typography>
					<div className={COLUMN}>
						{coveragePanel}
						{earnedPanel}
						{coverageLedger}
						{storageLedger}
						{changesPanel}
						{answersPanel}
					</div>
					<RecapAsides asides={footer.asides} />
				</section>
			) : (
				<>
					<div className={COLUMNS}>
						<div className={COLUMN}>
							{coveragePanel}
							{earnedPanel}
							{coverageLedger}
						</div>

						<div className={COLUMN}>
							{storageLedger}
							{changesPanel}
						</div>
					</div>

					{answersPanel}
				</>
			)}

			{tail?.ending === undefined ? null : <EndingPanel {...tail.ending} />}

			{settling ? null : <ScreenActions {...footer} />}
		</>
	);

	if (outcome === RUN_OVER_BAND) {
		return (
			<Screen theme={RUN_OVER_COLOR} width={width} ground="bare">
				{body}
			</Screen>
		);
	}

	return (
		<Screen gate={header.swatch.theme} width={width} ground="bare">
			{body}
		</Screen>
	);
};
