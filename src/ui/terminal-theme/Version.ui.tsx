import { clsx } from "clsx";

const BASE =
	"inline-flex shrink-0 items-center px-2 py-0.5 text-xs tabular-nums";

// Monochrome on purpose: hue already means family in this theme, so a green
// version chip would read as a focus config. The rung is pure value, climbing
// out of the page's own zinc up to near-white, and the text flips dark at v4
// where the fill outruns it.
const RUNG = [
	"bg-zinc-800 text-zinc-400",
	"bg-zinc-700 text-zinc-300",
	"bg-zinc-600 text-zinc-100",
	"bg-zinc-400 text-zinc-950",
	"bg-zinc-100 text-zinc-950",
] as const;

const CUT = "6px";
const INSET = `calc(100% - ${CUT})`;

type Corner = "tl" | "tr" | "br" | "bl";

/**
 * One more corner milled off per rung, so the badge carries its version in
 * silhouette as well as in value — legible at a glance down a build list, and
 * still legible to anyone the zinc ramp alone does not reach. The cuts fall on
 * a diagonal first, which keeps the middle rungs leaning rather than turning
 * v3 into a symmetrical trapezoid nobody would read as "three".
 */
const MILLED = [
	[],
	["tl"],
	["tl", "br"],
	["tl", "tr", "br"],
	["tl", "tr", "br", "bl"],
] as const satisfies readonly (readonly Corner[])[];

// Walked clockwise from the top-left. A cut corner spends two points where a
// square one spends one, and the top-left's second point closes the loop.
const outline = (milled: readonly Corner[]) => {
	const cut = (corner: Corner) => milled.includes(corner);

	return [
		cut("tl") ? `${CUT} 0` : "0 0",
		...(cut("tr") ? [`${INSET} 0`, `100% ${CUT}`] : ["100% 0"]),
		...(cut("br") ? [`100% ${INSET}`, `${INSET} 100%`] : ["100% 100%"]),
		...(cut("bl") ? [`${CUT} 100%`, `0 ${INSET}`] : ["0 100%"]),
		...(cut("tl") ? [`0 ${CUT}`] : []),
	].join(", ");
};

const LEVEL = /\d+/;

const levelOf = (label: string) => Number(label.match(LEVEL)?.[0] ?? 1);

const rungOf = (label: string) =>
	Math.min(Math.max(levelOf(label), 1), RUNG.length) - 1;

export type VersionProps = {
	label: string;
	className?: string;
};

export const Version = ({ label, className }: VersionProps) => {
	const rung = rungOf(label);

	return (
		<span
			// Inline rather than a Tailwind arbitrary value: the path is computed
			// per rung, and the scanner only ever sees class strings it can read
			// whole in the source.
			style={{ clipPath: `polygon(${outline(MILLED[rung])})` }}
			className={clsx(BASE, RUNG[rung], className)}
		>
			{label}
		</span>
	);
};
