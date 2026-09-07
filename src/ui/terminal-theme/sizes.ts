const RAMP = [
	[16, "bg-cinnabar", "bg-cinnabar/15"],
	[12, "bg-fuchsia", "bg-fuchsia/15"],
	[8, "bg-lavender", "bg-lavender/15"],
	[4, "bg-vermillion", "bg-vermillion/15"],
	[2, "bg-saffron", "bg-saffron/15"],
	[1, "bg-celadon", "bg-celadon/15"],
] as const satisfies readonly (readonly [number, string, string])[];

const PLAIN = "bg-zinc-500";
const PLAIN_TINT = "bg-zinc-800/80";

const rungOf = (slots: number) => RAMP.find(([rung]) => slots >= rung);

export const sizeFill = (slots: number): string => rungOf(slots)?.[1] ?? PLAIN;

export const sizeTint = (slots: number): string =>
	rungOf(slots)?.[2] ?? PLAIN_TINT;

const PRISMATIC_RUNGS = [8, 12, 16] as const;

export const prismaticStep = (slots: number): number =>
	PRISMATIC_RUNGS.filter((rung) => slots >= rung).length;

export const isBiggestSize = (slots: number): boolean =>
	prismaticStep(slots) > 0;

const PRISMATIC_STOPS = [
	"bg-saffron",
	"bg-fuchsia",
	"bg-lavender",
	"bg-cerulean",
	"bg-celadon",
] as const;

export const prismaticFill = (index: number): string =>
	PRISMATIC_STOPS[index % PRISMATIC_STOPS.length];
