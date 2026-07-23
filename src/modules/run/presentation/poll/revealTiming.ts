/**
 * Total time the staggered scoring reveal is spread across, in ms. Every option
 * fires within this window regardless of how many there are, so a 3-option and
 * an 8-option poll take the same time to reveal — the reveal duration is a
 * design constant, not a function of question length.
 */
export const REVEAL_WINDOW_MS = 360;

/**
 * Delay before option `index` (of `total`) pops in during the scoring reveal.
 * Options fire top→bottom so the reveal reads like the game tallying each
 * answer in turn: index 0 is immediate, the last option lands on the window's
 * edge, and everything in between is evenly spaced.
 *
 * This is the feel knob. Swap the body to change the choreography:
 *   - capped (current): even spacing across a fixed window — bounded tail
 *   - linear:           `index * FIXED_STAGGER` — steady drumbeat, long polls drag
 *   - eased:            bias the fraction (e.g. `Math.sqrt`) to front- or back-load
 */
export const revealDelayMs = (index: number, total: number): number => {
	if (total <= 1) return 0;
	return (index / (total - 1)) * REVEAL_WINDOW_MS;
};
