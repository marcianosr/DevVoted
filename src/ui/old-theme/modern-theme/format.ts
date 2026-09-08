export type ValueTone = "muted" | "celadon" | "cinnabar";

export const signed = (value: number) =>
	`${value < 0 ? "−" : "+"}${Math.abs(value)}`;

export const valueTone = (value: number): ValueTone => {
	if (value === 0) return "muted";
	return value < 0 ? "cinnabar" : "celadon";
};

export const plural = (count: number, noun: string) =>
	`${count} ${noun}${count === 1 ? "" : "s"}`;

export const countRange = (fewest: number, most: number, noun: string) =>
	fewest === most ? plural(fewest, noun) : `${fewest}–${most} ${noun}s`;

export const optionLetter = (index: number) =>
	String.fromCharCode(65 + (index % 26));

export const capLabel = (kb: number) =>
	kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`;

export const gateFloorLabel = (fromGate: number) => `gate ${fromGate - 1}`;
