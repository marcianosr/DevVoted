import { clsx } from "clsx";

const BASE =
	"inline-flex shrink-0 items-center px-2 py-0.5 text-xxs font-normal tabular-nums";

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

const MILLED = [
	[],
	["tl"],
	["tl", "br"],
	["tl", "tr", "br"],
	["tl", "tr", "br", "bl"],
] as const satisfies readonly (readonly Corner[])[];

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
			style={{ clipPath: `polygon(${outline(MILLED[rung])})` }}
			className={clsx(BASE, RUNG[rung], className)}
		>
			{label}
		</span>
	);
};
