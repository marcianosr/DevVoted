import { Badge } from "./Badge.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
} from "./CoverageBar.ui";
import { DexBrowser, DexDetail } from "./DexBrowser.ui";
import { Link } from "./Link.ui";
import { Panel } from "./Panel.ui";
import type { SwatchFill } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";

const DATE = "w-16 shrink-0 text-xs tabular-nums text-theme-muted";
const OUTCOME = "min-w-0 flex-1 truncate text-sm text-theme-faint";
const COVERAGE = "text-xs font-bold tabular-nums text-theme-soft";
const FACTS = "flex flex-col gap-3";
const FIGURES = "flex flex-wrap items-center gap-3";
const TRACK_SIZE = "small";
const DETAIL_TRACK_SIZE = "hero";

const NOTHING_YET = "—";
const NOTHING_HERE = "No run to read yet.";
const OPEN_ARCHIVE = "Open the archive";

export const WON_OUTCOME = "champion";

export const heldOutcomeOf = (gateName: string): string => `${gateName} held`;

export type DexRunRow = {
	id: string;
	date: string;
	swatches: readonly SwatchFill[];
	outcome: string;
	coverage: string;
	band: CoverageBandId;
};

export type DexRunDetail = {
	label: string;
	swatches: readonly SwatchFill[];
	outcome: string;
	coverage: string;
	band: CoverageBandId;
	href: string;
};

export type DexRunsData = {
	rows: readonly DexRunRow[];
	selectedId: string | null;
	detail: DexRunDetail | null;
	count: string;
	meta: string;
	note: string;
};

export type DexRunsProps = DexRunsData & {
	onSelect?: (id: string) => void;
};

const Detail = ({ detail }: { detail: DexRunDetail | null }) => {
	if (detail === null)
		return <DexDetail label={NOTHING_YET}>{NOTHING_HERE}</DexDetail>;

	return (
		<DexDetail label={detail.label}>
			<div className={FACTS}>
				<SwatchTrack swatches={detail.swatches} size={DETAIL_TRACK_SIZE} />
				<span className={FIGURES}>
					<Typography variant="subtitle" as="span">
						{detail.outcome}
					</Typography>
					<span className={COVERAGE}>{detail.coverage}</span>
					<Badge color={COVERAGE_BAND_COLOR[detail.band]}>
						{COVERAGE_BAND_WORD[detail.band]}
					</Badge>
				</span>
				<Link href={detail.href}>{OPEN_ARCHIVE}</Link>
			</div>
		</DexDetail>
	);
};

export const DexRuns = ({
	rows,
	selectedId,
	detail,
	count,
	meta,
	note,
	onSelect,
}: DexRunsProps) => (
	<DexBrowser
		label="run history"
		count={count}
		meta={meta}
		note={note}
		rows={rows.map((row) => (
			<Panel.Row
				key={row.id}
				picked={row.id === selectedId}
				onPress={onSelect === undefined ? undefined : () => onSelect(row.id)}
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
		detail={<Detail detail={detail} />}
	/>
);
