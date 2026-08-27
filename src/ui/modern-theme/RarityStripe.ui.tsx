import { Dot } from "./Dot.ui";
import type { Rarity } from "./rarity";

const STRIPE = "flex shrink-0 items-center";

/**
 * A config's rarity, as the bar the rarity Legend keys. It replaced the rarity
 * word on config rows: a bar is a different shape from the status dot beside
 * it, so one row carries both readings without either being decoded twice.
 *
 * The bar is `aria-hidden` like every Dot, so the tier rides along as text —
 * the word left the screen, not the document.
 */
export const RarityStripe = ({ rarity }: { rarity: Rarity }) => (
	<span className={STRIPE}>
		<Dot rarity={rarity} shape="bar" />
		<span className="sr-only">{rarity}</span>
	</span>
);
