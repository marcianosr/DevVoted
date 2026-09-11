import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";

const UNIT = "KB|MB|%";
const SIGNED = `[×+−]\\d+(?:\\.\\d+)?(?:\\s?(?:${UNIT}))?`;
const PRICED = `\\d+(?:\\.\\d+)?\\s?(?:${UNIT})`;
const SCALED = "\\d+(?:\\.\\d+)?×";

const FIGURE = new RegExp(`(${SIGNED}|${PRICED}|${SCALED})`, "g");

const GAIN: KantoColor = "viridian";
const TERM: KantoColor = "saffron";
const LOSS: KantoColor = "cinnabar";

const isFigure = (part: string) =>
	/^[×+−]\d/.test(part) ||
	/\d×$/.test(part) ||
	new RegExp(`^${PRICED}$`).test(part);

const isMultiplier = (figure: string) =>
	figure.startsWith("×") || figure.endsWith("×");

const multiplierOf = (figure: string) => parseFloat(figure.replace("×", ""));

const isSigned = (figure: string) => /^[+−]/.test(figure);

const toneOf = (figure: string, gain: KantoColor): KantoColor | undefined => {
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
				isFigure(part) ? (
					<Badge key={`${part}-${index}`} color={toneOf(part, gain)}>
						{part}
					</Badge>
				) : (
					<span key={`${part}-${index}`}>{part}</span>
				)
			)}
	</>
);
