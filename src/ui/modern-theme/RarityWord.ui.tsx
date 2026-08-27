import { clsx } from "clsx";

import { RARITY_TEXT, type Rarity } from "./rarity";

/**
 * The tier as a word in its own colour. A config row states its rarity in the
 * stripe against its name; this is the spelled-out form, which lives in the
 * opened row's facts line beside the level, the rate and the refund.
 *
 * It carries no separator of its own: it sits inside a dot-separated list the
 * caller punctuates, and a word that brings its own middot cannot.
 *
 * The colour and the weight sit on a span of their own rather than on the
 * `Text`: utilities competing with the ones `Text`'s variants emit leave the
 * winner to Tailwind's source order, which is what quietly greyed and unbolded
 * this word.
 */
const WORD = "font-bold";

export type RarityWordProps = {
	rarity: Rarity;
	className?: string;
};

export const RarityWord = ({ rarity, className }: RarityWordProps) => (
	<span className={clsx(WORD, RARITY_TEXT[rarity], className)}>{rarity}</span>
);
