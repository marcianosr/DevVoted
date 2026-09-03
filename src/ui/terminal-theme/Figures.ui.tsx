import { Badge, type BadgeTone } from "./Badge.ui";

const FIGURE = /([×+−]\d+(?:\.\d+)?(?:\s?(?:KB|MB|%))?|\d+(?:\.\d+)?×)/g;

const isFigure = (part: string) => /^[×+−]\d/.test(part) || /\d×$/.test(part);

// A multiplier under 1 is a penalty wearing a multiplier's sign: ×0.5 halves
// what you earn, and reading it in the same green as ×4 sells a throttle as a
// reward.
const isThrottle = (figure: string) =>
	(figure.startsWith("×") || figure.endsWith("×")) &&
	parseFloat(figure.replace("×", "")) < 1;

const toneOf = (figure: string): BadgeTone =>
	isThrottle(figure) || figure.startsWith("−") ? "cinnabar" : "viridian";

export type FiguresProps = {
	text: string;
};

export const Figures = ({ text }: FiguresProps) => (
	<>
		{text
			.split(FIGURE)
			.filter((part) => part !== "")
			.map((part, index) =>
				isFigure(part) ? (
					<Badge key={`${part}-${index}`} tone={toneOf(part)}>
						{part}
					</Badge>
				) : (
					<span key={`${part}-${index}`}>{part}</span>
				)
			)}
	</>
);
