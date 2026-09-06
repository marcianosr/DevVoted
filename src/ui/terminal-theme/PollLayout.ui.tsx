import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import type { AuditNote } from "./Audits.ui";
import { BuildList, type BuildListRow } from "./BuildList.ui";
import { Byline, type BylineProps } from "./Byline.ui";
import { CoverageGauge, type CoverageGaugeProps } from "./CoverageGauge.ui";
import { Dot } from "./Dot.ui";
import { Legend } from "./Legend.ui";
import { Panel } from "./Panel.ui";
import { PollInfo, type PollFact } from "./PollInfo.ui";
import { RunHeader, type RunHeaderProps } from "./RunHeader.ui";
import { Section } from "./Section.ui";
import { Text } from "./Text.ui";
import type { TrailProps } from "./Trail.ui";

const COLUMNS =
	"grid grid-cols-[1fr_18rem] items-start gap-6 @max-md:grid-cols-1 @max-md:gap-4";
const QUESTION_COLUMN = "flex flex-col gap-3 py-1";
const GAUGED = "flex items-stretch gap-6";
const ASKED = "flex min-w-0 flex-1 flex-col gap-3";
const SIDEBAR =
	"@container border-l border-edge pl-4 @max-md:border-l-0 @max-md:border-t @max-md:pt-3 @max-md:pl-0";
const BUILD_META = "flex items-center gap-1.5";

export type PollBuild = {
	running: number;
	rows: readonly BuildListRow[];
	total: { label: string; value: string };
};

export type PollLayoutProps = {
	run: RunHeaderProps;
	theme?: SwatchTheme;
	coverage?: Omit<CoverageGaugeProps, "className">;
	build: PollBuild;
	audits?: readonly AuditNote[];
	trail: TrailProps;
	category: string;
	facts?: readonly PollFact[];
	children: ReactNode;
	footer: ReactNode;
	byline?: BylineProps;
};

export const PollLayout = ({
	run,
	theme,
	coverage,
	build,
	audits,
	trail,
	category,
	facts,
	children,
	footer,
	byline,
}: PollLayoutProps) => (
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
					{coverage === undefined ? null : <CoverageGauge {...coverage} />}

					<div className={ASKED}>{children}</div>
				</div>

				{footer}

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
