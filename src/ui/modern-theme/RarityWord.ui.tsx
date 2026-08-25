import { clsx } from "clsx";

import { RARITY_TEXT, type Rarity } from "./rarity";
import { Text } from "./Text.ui";

/** The rarity is the word now, not a dot: dots read as status on the pipeline
 * rail, and a second dot vocabulary beside them was a coin toss over which
 * meaning the player took. A middot separates, the colour and the weight carry
 * the grade.
 *
 * Both sit on a span of their own rather than on the `Text`: a colour and a
 * weight utility competing with the ones `Text`'s own variants emit leave the
 * winner to Tailwind's source order, which is what quietly greyed and unbolded
 * this word. */
const WORD = "font-bold";

const SEPARATOR = "·";

export type RarityWordProps = {
	rarity: Rarity;
	className?: string;
};

export const RarityWord = ({ rarity, className }: RarityWordProps) => (
	<Text size="meta" tone="muted">
		<span aria-hidden>{SEPARATOR} </span>
		<span className={clsx(WORD, RARITY_TEXT[rarity], className)}>{rarity}</span>
	</Text>
);
