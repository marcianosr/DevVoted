import { Badge } from "./Badge.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
} from "./CoverageBar.ui";
import { DexPanel } from "./DexPanel.ui";
import { Panel } from "./Panel.ui";
import type { SwatchFill } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";

const DATE = "w-16 shrink-0 text-xs tabular-nums text-theme-muted";
const OUTCOME = "min-w-0 flex-1 truncate text-sm text-theme-faint";
const COVERAGE = "text-xs font-bold tabular-nums text-theme-soft";
const TRACK_SIZE = "small";

export const WON_OUTCOME = "champion";

export const heldOutcomeOf = (gateName: string): string => `${gateName} held`;

export type DexRunRow = {
	runId: number;
	/** The run's permalink in the archive. Built by the viewmodel: a URL is data. */
	href: string;
	date: string;
	swatches: readonly SwatchFill[];
	outcome: string;
	/** Already a share of the run's own window, never raw units. */
	coverage: string;
	band: CoverageBandId;
};

export type DexRunsProps = {
	rows: readonly DexRunRow[];
	count: string;
	meta: string;
	note: string;
};

export const DexRuns = ({ rows, count, meta, note }: DexRunsProps) => (
	<DexPanel label="run history" count={count} meta={meta} note={note}>
		<Panel.Rows>
			{rows.map((row) => (
				<Panel.Row
					key={row.runId}
					href={row.href}
					trailing={
						<>
							<span className={COVERAGE}>{row.coverage}</span>
							<Badge color={COVERAGE_BAND_COLOR[row.band]}>
								{COVERAGE_BAND_WORD[row.band]}
							</Badge>
						</>
					}
				>
					<span className={DATE}>{row.date}</span>
					<SwatchTrack swatches={row.swatches} size={TRACK_SIZE} />
					<span className={OUTCOME}>{row.outcome}</span>
				</Panel.Row>
			))}
		</Panel.Rows>
	</DexPanel>
);
