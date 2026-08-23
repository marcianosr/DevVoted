/** The three readings a signed figure has. Narrow on purpose: it satisfies
 * ChipTone, ModernTone and LetterTone alike, so one rule can colour all three. */
export type ValueTone = "muted" | "celadon" | "cinnabar";

/** A minus sign, not a hyphen: these figures sit in tabular-nums columns where a
 * hyphen reads a half-width short. */
export const signed = (value: number) =>
	`${value < 0 ? "−" : "+"}${Math.abs(value)}`;

export const valueTone = (value: number): ValueTone => {
	if (value === 0) return "muted";
	return value < 0 ? "cinnabar" : "celadon";
};

export const plural = (count: number, noun: string) =>
	`${count} ${noun}${count === 1 ? "" : "s"}`;

export const optionLetter = (index: number) =>
	String.fromCharCode(65 + (index % 26));
