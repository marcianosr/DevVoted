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

/** The storage ladder crosses out of KB at 1024, and the shop says "1 MB". */
export const capLabel = (kb: number) =>
	kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`;

/**
 * A plan's `fromGate` is the gate it is sold FOR, and the shop that sells it
 * runs one clear earlier — `gatesCleared` reaches 2 the moment gate 1 clears.
 * Both callers had the off-by-one, so the arithmetic lives here once.
 */
export const planOpensAt = (fromGate: number) =>
	`opens when gate ${fromGate - 1} clears`;
