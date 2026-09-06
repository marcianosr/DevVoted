import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import type { AuditNote } from "../Audits.ui";
import { Badge } from "../Badge.ui";
import { BuildList, type BuildListRow } from "../BuildList.ui";
import { Button } from "../Button.ui";
import { Byline, type BylineProps } from "../Byline.ui";
import type { ChoiceState } from "../Choice.ui";
import { ChoiceList } from "../ChoiceList.ui";
import { CoverageGauge } from "../CoverageGauge.ui";
import { Dot } from "../Dot.ui";
import { Equation, type EquationProps } from "../Equation.ui";
import { Legend } from "../Legend.ui";
import { Panel } from "../Panel.ui";
import { PollInfo, type PollFact } from "../PollInfo.ui";
import { RunHeader, type RunHeaderProps } from "../RunHeader.ui";
import { Section } from "../Section.ui";
import { Text } from "../Text.ui";
import type { TrailProps } from "../Trail.ui";

const COLUMNS =
	"grid grid-cols-[1fr_18rem] items-start gap-6 @max-md:grid-cols-1 @max-md:gap-4";
const QUESTION_COLUMN = "flex flex-col gap-3 py-1";
const GAUGED = "flex items-stretch gap-6";
const ASKED = "flex min-w-0 flex-1 flex-col gap-3";
const SIDEBAR =
	"@container border-l border-edge pl-4 @max-md:border-l-0 @max-md:border-t @max-md:pt-3 @max-md:pl-0";
const BUILD_META = "flex items-center gap-1.5";

export type RevealCoverage = {
	held: number;
	demand: number;
	earned: number;
};

export type RevealScreenProps = {
	run: RunHeaderProps;
	theme?: SwatchTheme;
	coverage?: RevealCoverage;
	build: {
		running: number;
		rows: readonly BuildListRow[];
		total: { label: string; value: string };
	};
	audits?: readonly AuditNote[];
	trail: TrailProps;
	category: string;
	facts?: readonly PollFact[];
	question: string;
	choices: readonly {
		letter: string;
		label: string;
		state: ChoiceState;
		note?: string;
	}[];
	equation: EquationProps;
	explainer?: string;
	nextLabel: string;
	onNext?: () => void;
	byline?: BylineProps;
};

export const RevealScreen = ({
	run,
	theme,
	coverage,
	build,
	audits = [],
	trail,
	category,
	facts = [],
	question,
	choices,
	equation,
	explainer,
	nextLabel,
	onNext,
	byline,
}: RevealScreenProps) => (
	<Panel theme={theme} sidebar>
		<RunHeader
			{...run}
			coverage={coverage === undefined ? run.coverage : undefined}
		/>

		<div className={COLUMNS}>
			<div className={QUESTION_COLUMN}>
				<PollInfo
					trail={trail}
					audits={audits}
					theme={theme}
					category={category}
					facts={facts}
				/>

				<div className={GAUGED}>
					{coverage === undefined ? null : (
						<CoverageGauge
							held={coverage.held}
							demand={coverage.demand}
							earned={coverage.earned}
						/>
					)}

					<div className={ASKED}>
						<Text as="p" size="score" className="leading-snug font-bold">
							{question}
						</Text>

						<ChoiceList
							choices={choices.map((choice) => ({
								letter: choice.letter,
								label: choice.label,
								state: choice.state,
								note:
									choice.note === undefined ? undefined : (
										<Badge tone="viridian">{choice.note}</Badge>
									),
							}))}
						/>
					</div>
				</div>

				<div className="border-t border-edge pt-4">
					<Equation {...equation} />
				</div>

				{explainer === undefined ? null : (
					<Text as="p" tone="muted" size="caption" className="leading-relaxed">
						{explainer}
					</Text>
				)}

				<Button label={nextLabel} className="w-full" onUse={onNext} />

				{byline === undefined ? null : <Byline {...byline} />}
			</div>

			<div className={SIDEBAR}>
				<Section
					label="Build"
					meta={
						<span className={BUILD_META}>
							<Dot variant="on" />
							<Text tone="muted" size="caption">
								{build.running} running
							</Text>
						</span>
					}
				>
					<Legend
						variants={build.rows
							.map((row) => row.dot)
							.filter((dot) => dot !== "on")}
						className="pb-2"
					/>
					<BuildList rows={build.rows} total={build.total} />
				</Section>
			</div>
		</div>
	</Panel>
);
