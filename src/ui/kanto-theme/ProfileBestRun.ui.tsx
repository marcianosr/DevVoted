import { Badge } from "./Badge.ui";
import { COVERAGE_BAND_COLOR, COVERAGE_BAND_WORD } from "./CoverageBar.ui";
import type { DexRunDetail } from "./DexRuns.ui";
import { Link } from "./Link.ui";
import { Panel } from "./Panel.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";

export const COPY = {
	label: "best run",
	openArchive: "Open the archive",
} as const;

const READING = "flex flex-wrap items-center gap-3";
const COVERAGE = "text-2xl font-extrabold tabular-nums text-theme";
const DATE = "ml-auto text-xs tabular-nums text-theme-muted";

export type ProfileBestRunProps = {
	run: DexRunDetail;
	meta: string;
};

export const ProfileBestRun = ({ run, meta }: ProfileBestRunProps) => (
	<Panel>
		<Panel.Header label={COPY.label} meta={meta} />
		<Panel.Body>
			<div className={READING}>
				<span className={COVERAGE}>{run.coverage}</span>
				<Badge color={COVERAGE_BAND_COLOR[run.band]}>
					{COVERAGE_BAND_WORD[run.band]}
				</Badge>
				<Typography variant="subtitle" as="span">
					{run.outcome}
				</Typography>
				<span className={DATE}>{run.label}</span>
			</div>
			<SwatchTrack swatches={run.swatches} size="large" />
		</Panel.Body>
		<Panel.Footer>
			<Link href={run.href}>{COPY.openArchive}</Link>
		</Panel.Footer>
	</Panel>
);
