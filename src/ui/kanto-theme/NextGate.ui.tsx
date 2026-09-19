import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
} from "./CoverageBar.ui";
import { Panel } from "./Panel.ui";
import { Swatch } from "./Swatch.ui";
import { Typography } from "./Typography.ui";

const ROW = "flex w-full flex-wrap items-center gap-3";
const IDENTITY = "flex min-w-0 flex-wrap items-baseline gap-x-2 text-sm";
const NAME = "font-bold text-theme-faint";
const DETAIL = "text-theme-muted";
const READING =
	"ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 text-sm";
const BAND_WORD = "font-bold text-theme";

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
	note?: string;
};

export const NextGate = ({
	swatch,
	slots,
	demand,
	held,
	heldBand,
	opensAt,
	note,
}: NextGateProps) => (
	<Panel>
		<Panel.Header label={TITLE} meta={opensAt} />

		<Panel.Body>
			<div className={ROW}>
				<Swatch state={SWATCH_STATE} swatch={swatch} size={SWATCH_SIZE} />

				<span className={IDENTITY}>
					<span className={NAME}>
						{`Gate ${swatch.gate} ${SEPARATOR} ${swatch.gateName}`}
					</span>
					<span className={DETAIL}>
						{SEPARATOR} {slots}
					</span>
				</span>

				<span className={READING}>
					<span className={BAND_WORD}>{COVERAGE_BAND_WORD[PASS_BAND]}</span>
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

		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint" as="span">
					{note}
				</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
