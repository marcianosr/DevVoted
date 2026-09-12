import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import {
	CoverageBar,
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
	type CoverageBarProps,
} from "./CoverageBar.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const SECTION = "flex w-full flex-col gap-3";
const ROWS = "flex w-full flex-col";
const ROW = "flex w-full items-baseline gap-4 py-3";
const DIVIDER = "border-t border-theme-faint";

const BAND = "flex w-28 shrink-0 justify-center self-center";
const RANGE = "w-24 shrink-0 text-sm tabular-nums text-theme-muted";
const OUTCOME = "min-w-0 flex-1 text-sm text-theme-soft";
const PAYS = "ml-auto shrink-0 self-center";

const STACKED_ROW = "flex w-full flex-col gap-1.5 py-3";
const STACKED_HEAD = "flex w-full items-center gap-3";
const STACKED_RANGE = "shrink-0 text-sm tabular-nums text-theme-muted";
const STACKED_PAYS = "ml-auto shrink-0";
const STACKED_OUTCOME = "text-sm text-theme-soft";

export type BandOutcomesLayout = "row" | "stacked";

const FATAL_BAND: CoverageBandId = "danger";

export type BandOutcome = {
	band: CoverageBandId;
	range: string;
	outcome: string;
	pays: string;
};

export type BandOutcomesProps = {
	title: string;
	outcomes: readonly BandOutcome[];
	bar?: CoverageBarProps;
	layout?: BandOutcomesLayout;
};

type OutcomeProps = {
	outcome: BandOutcome;
	first: boolean;
	layout: BandOutcomesLayout;
};

const Outcome = ({ outcome, first, layout }: OutcomeProps) => {
	const color = COVERAGE_BAND_COLOR[outcome.band];
	const fatal = outcome.band === FATAL_BAND;
	const band = <Badge color={color}>{COVERAGE_BAND_WORD[outcome.band]}</Badge>;
	const pays = <Badge color={color}>{outcome.pays}</Badge>;
	const theme = fatal ? color : undefined;

	if (layout === "stacked")
		return (
			<div className={clsx(STACKED_ROW, !first && DIVIDER)}>
				<span className={STACKED_HEAD}>
					{band}
					<span className={STACKED_RANGE}>{outcome.range}</span>
					<span className={STACKED_PAYS}>{pays}</span>
				</span>
				<span data-screen-theme={theme} className={STACKED_OUTCOME}>
					{outcome.outcome}
				</span>
			</div>
		);

	return (
		<div className={clsx(ROW, !first && DIVIDER)}>
			<span className={BAND}>{band}</span>
			<span className={RANGE}>{outcome.range}</span>
			<span data-screen-theme={theme} className={OUTCOME}>
				{outcome.outcome}
			</span>
			<span className={PAYS}>{pays}</span>
		</div>
	);
};

export const BandOutcomes = ({
	title,
	outcomes,
	bar,
	layout = "row",
}: BandOutcomesProps) => (
	<section className={SECTION}>
		<Typography variant="title" as="h3">
			{title}
		</Typography>
		{bar === undefined ? null : <CoverageBar {...bar} />}
		<Panel>
			<div className={ROWS}>
				{outcomes.map((outcome, index) => (
					<Outcome
						key={outcome.band}
						outcome={outcome}
						first={index === 0}
						layout={layout}
					/>
				))}
			</div>
		</Panel>
	</section>
);
