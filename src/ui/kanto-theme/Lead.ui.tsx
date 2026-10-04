import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import { Figures } from "./Figures.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
} from "./CoverageBar.ui";
import type { KantoColor } from "./colors";
import { Swatch, type SwatchSize } from "./Swatch.ui";
import {
	Typography,
	type TypographyTag,
	type TypographyVariant,
} from "./Typography.ui";

const FIGURE_COLOR: KantoColor = "pewter";
const GAIN_COLOR: KantoColor = "viridian";
const DEFAULT_VARIANT: TypographyVariant = "hint";
const SWATCH_SIZE: SwatchSize = "small";

const MARKED = "flex items-center gap-1.5";

export type LeadBand = {
	band: CoverageBandId;
	figure?: never;
	gain?: never;
	swatch?: never;
	label?: never;
};
export type LeadFigure = {
	figure: string;
	gain?: boolean;
	band?: CoverageBandId;
	swatch?: never;
	label?: never;
};
export type LeadSwatch = {
	swatch: GateSwatch;
	label: string;
	figure?: never;
	band?: never;
	gain?: never;
};
export type LeadPart = string | LeadBand | LeadFigure | LeadSwatch;
export type LeadLine = readonly LeadPart[];

export type LeadProps = {
	line: LeadLine;
	variant?: TypographyVariant;
	as?: TypographyTag;
};

const colorOf = (part: LeadFigure): KantoColor => {
	if (part.band !== undefined) return COVERAGE_BAND_COLOR[part.band];

	return part.gain === true ? GAIN_COLOR : FIGURE_COLOR;
};

const textOf = (part: LeadPart): string => {
	if (typeof part === "string") return part;
	if (part.swatch !== undefined) return part.label;
	if (part.figure !== undefined) return part.figure;
	return COVERAGE_BAND_WORD[part.band];
};

export const leadTextOf = (line: LeadLine): string => line.map(textOf).join("");

const Mark = ({ part }: { part: LeadBand | LeadFigure | LeadSwatch }) => {
	if (part.swatch !== undefined)
		return (
			<Badge>
				<span className={MARKED}>
					<Swatch size={SWATCH_SIZE} state="discovered" swatch={part.swatch} />
					{part.label}
				</span>
			</Badge>
		);

	if (part.figure === undefined)
		return (
			<Badge color={COVERAGE_BAND_COLOR[part.band]}>
				{COVERAGE_BAND_WORD[part.band]}
			</Badge>
		);

	return <Badge color={colorOf(part)}>{part.figure}</Badge>;
};

export const Lead = ({ line, variant = DEFAULT_VARIANT, as }: LeadProps) => (
	<Typography variant={variant} as={as}>
		{line.map((part, index) =>
			typeof part === "string" ? (
				<Figures key={`${part}-${index}`} text={part} />
			) : (
				<Mark key={`${textOf(part)}-${index}`} part={part} />
			)
		)}
	</Typography>
);
