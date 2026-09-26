import { Badge } from "./Badge.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
} from "./CoverageBar.ui";
import type { KantoColor } from "./colors";
import { Typography, type TypographyVariant } from "./Typography.ui";

const FIGURE_COLOR: KantoColor = "pewter";
const GAIN_COLOR: KantoColor = "viridian";
const DEFAULT_VARIANT: TypographyVariant = "hint";

export type LeadBand = { band: CoverageBandId; figure?: never; gain?: never };
export type LeadFigure = {
	figure: string;
	gain?: boolean;
	band?: CoverageBandId;
};
export type LeadPart = string | LeadBand | LeadFigure;
export type LeadLine = readonly LeadPart[];

export type LeadProps = {
	line: LeadLine;
	variant?: TypographyVariant;
};

const colorOf = (part: LeadFigure): KantoColor => {
	if (part.band !== undefined) return COVERAGE_BAND_COLOR[part.band];

	return part.gain === true ? GAIN_COLOR : FIGURE_COLOR;
};

const Mark = ({ part }: { part: LeadBand | LeadFigure }) => {
	if (part.figure === undefined)
		return (
			<Badge color={COVERAGE_BAND_COLOR[part.band]}>
				{COVERAGE_BAND_WORD[part.band]}
			</Badge>
		);

	return <Badge color={colorOf(part)}>{part.figure}</Badge>;
};

export const Lead = ({ line, variant = DEFAULT_VARIANT }: LeadProps) => (
	<Typography variant={variant}>
		{line.map((part, index) =>
			typeof part === "string" ? (
				<span key={`${part}-${index}`}>{part}</span>
			) : (
				<Mark key={`${part.figure ?? part.band}-${index}`} part={part} />
			)
		)}
	</Typography>
);
