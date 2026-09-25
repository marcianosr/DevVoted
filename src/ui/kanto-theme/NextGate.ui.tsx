import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
} from "./CoverageBar.ui";
import { gateTitleOf } from "./Header.ui";
import { Panel } from "./Panel.ui";
import { Swatch } from "./Swatch.ui";
import { Typography } from "./Typography.ui";

const ROW = "flex w-full flex-wrap items-center gap-3";
const IDENTITY = "flex min-w-0 flex-wrap items-center gap-x-2 text-sm";
/**
 * The swatch is the gate's mark, so it never leaves the name it marks. Held
 * together here because the row wraps: left as siblings of the row, the name
 * was wide enough to wrap past the swatch and the mark sat alone on a line.
 */
const NAMED = "flex min-w-0 items-center gap-3";
const NAME = "font-bold text-theme-faint";
const DETAIL = "text-theme-muted";
/**
 * Takes its own line on a phone rather than being squeezed opposite the gate's
 * name: five marks and three words do not share a line with a name at that
 * width, and pulling them right only made the name wrap instead.
 */
const READING =
	"flex w-full flex-wrap items-center gap-2 text-sm sm:ml-auto sm:w-auto sm:shrink-0 sm:justify-end";

const TITLE = "Next gate";
const SEPARATOR = "·";
const AT_WORD = "at";
const HOLD_WORDS = "you hold";
const PASS_BAND: CoverageBandId = "healthy";
const SWATCH_SIZE = "small";
const SWATCH_STATE = "current";

export type NextGateProps = {
	swatch: GateSwatch;
	slots: string;
	demand: string;
	held: string;
	heldBand?: CoverageBandId;
	opensAt?: string;
};

export const NextGate = ({
	swatch,
	slots,
	demand,
	held,
	heldBand,
	opensAt,
}: NextGateProps) => (
	<Panel>
		<Panel.Header label={TITLE} meta={opensAt} />

		<Panel.Body>
			<div className={ROW}>
				<span className={IDENTITY}>
					<span className={NAMED}>
						<Swatch state={SWATCH_STATE} swatch={swatch} size={SWATCH_SIZE} />
						<span className={NAME}>{gateTitleOf(swatch)}</span>
					</span>
					<span className={DETAIL}>
						{SEPARATOR} {slots}
					</span>
				</span>

				<span className={READING}>
					<Badge color={COVERAGE_BAND_COLOR[PASS_BAND]}>
						{COVERAGE_BAND_WORD[PASS_BAND]}
					</Badge>
					<Typography variant="hint" as="span">
						{AT_WORD}
					</Typography>
					<Badge color={COVERAGE_BAND_COLOR[PASS_BAND]}>{demand}</Badge>
					<Typography variant="hint" as="span">
						{SEPARATOR} {HOLD_WORDS}
					</Typography>
					<Badge
						color={
							heldBand === undefined ? undefined : COVERAGE_BAND_COLOR[heldBand]
						}
					>
						{held}
					</Badge>
				</span>
			</div>
		</Panel.Body>
	</Panel>
);
