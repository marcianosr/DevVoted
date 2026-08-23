import { clsx } from "clsx";

const LETTER =
	"inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors";

export type LetterTone = "muted" | "celadon" | "cinnabar";

const TONE = {
	muted: "border-edge-strong text-zinc-400",
	celadon: "border-celadon text-celadon",
	cinnabar: "border-cinnabar text-cinnabar",
} satisfies Record<LetterTone, string>;

export type LetterProps = {
	letter: string;
	tone?: LetterTone;
	className?: string;
};

// Spoken, not aria-hidden: "Received B" is the fact the review is reporting, and
// on the poll it is how a player refers to an option out loud.
export const Letter = ({ letter, tone = "muted", className }: LetterProps) => (
	<span className={clsx(LETTER, TONE[tone], className)}>{letter}</span>
);
