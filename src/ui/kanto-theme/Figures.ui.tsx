import { CATEGORY_METADATA } from "~/shared/lib/categories";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { COVERAGE_BAND_COLOR, COVERAGE_BAND_WORD } from "./CoverageBar.ui";

const UNIT = "KB|MB|%";
const SIGNED = `[×+−]\\d+(?:\\.\\d+)?(?:\\s?(?:${UNIT}))?`;
const PRICED = `\\d+(?:\\.\\d+)?\\s?(?:${UNIT})`;
const SCALED = "\\d+(?:\\.\\d+)?×";
/**
 * Coverage's own unit is a word, not a suffix, and the badge takes the figure
 * without it: "takes 0.5 units off the gate" reads as a figure in a sentence,
 * where "0.5 units" boxed whole reads as a term. A lookahead, so the word stays
 * in the prose that owns it.
 */
const COUNTED = "\\d+(?:\\.\\d+)?(?=\\s?units?\\b)";

/**
 * A band never reads as bare prose: wherever a sentence names one it wears the
 * ladder's own colour, so "clear HEALTHY or better" and the bar below it are
 * obviously the same reading rather than two vocabularies.
 */
const BAND_COLOR: Record<string, KantoColor> = {
	[COVERAGE_BAND_WORD.danger]: COVERAGE_BAND_COLOR.danger,
	[COVERAGE_BAND_WORD.shaky]: COVERAGE_BAND_COLOR.shaky,
	[COVERAGE_BAND_WORD.ok]: COVERAGE_BAND_COLOR.ok,
	[COVERAGE_BAND_WORD.healthy]: COVERAGE_BAND_COLOR.healthy,
	[COVERAGE_BAND_WORD.perfect]: COVERAGE_BAND_COLOR.perfect,
};

const BAND = `\\b(?:${Object.keys(BAND_COLOR).join("|")})\\b`;

/**
 * A category is a noun, so it takes no colour — hue already means gain, loss or
 * term. Matching is case-sensitive, which is what makes a closed vocabulary of
 * words safe here where teaching the regex "free" was not: the game writes a
 * category only as its own proper name, and the lower-cased register elsewhere
 * (the gate mix reads "javascript 3") is left alone on purpose.
 */
const CATEGORY_NAMES: readonly string[] = Object.values(CATEGORY_METADATA)
	.map(({ name }) => name)
	.sort((one, other) => other.length - one.length);

const CATEGORY = `\\b(?:${CATEGORY_NAMES.join("|")})\\b`;

const FIGURE = new RegExp(
	`(${SIGNED}|${PRICED}|${SCALED}|${BAND}|${CATEGORY}|${COUNTED})`,
	"g"
);

const GAIN: KantoColor = "viridian";
const TERM: KantoColor = "saffron";
const LOSS: KantoColor = "cinnabar";

const isBand = (part: string) => part in BAND_COLOR;

const isFigure = (part: string) =>
	/^[×+−]\d/.test(part) ||
	/\d×$/.test(part) ||
	/^\d+(?:\.\d+)?$/.test(part) ||
	new RegExp(`^${PRICED}$`).test(part);

const isCategory = (part: string) => CATEGORY_NAMES.includes(part);

const isBadged = (part: string) =>
	isBand(part) || isFigure(part) || isCategory(part);

const isMultiplier = (figure: string) =>
	figure.startsWith("×") || figure.endsWith("×");

const multiplierOf = (figure: string) => parseFloat(figure.replace("×", ""));

const isSigned = (figure: string) => /^[+−]/.test(figure);

const toneOf = (figure: string, gain: KantoColor): KantoColor | undefined => {
	if (isBand(figure)) return BAND_COLOR[figure];
	if (figure.startsWith("−")) return LOSS;
	if (isMultiplier(figure)) return multiplierOf(figure) < 1 ? TERM : gain;
	return isSigned(figure) ? gain : undefined;
};

export type FiguresProps = {
	text: string;
	gain?: KantoColor;
};

export const Figures = ({ text, gain = GAIN }: FiguresProps) => (
	<>
		{text
			.split(FIGURE)
			.filter((part) => part !== "")
			.map((part, index) =>
				isBadged(part) ? (
					<Badge key={`${part}-${index}`} color={toneOf(part, gain)}>
						{part}
					</Badge>
				) : (
					<span key={`${part}-${index}`}>{part}</span>
				)
			)}
	</>
);
