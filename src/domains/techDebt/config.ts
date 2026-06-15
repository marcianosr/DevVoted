/**
 * Tunables for the Tech Debt mechanic. Kept centralized so playtest changes
 * are one-line edits.
 */

/**
 * Maximum number of Tech Debt instances a player can carry simultaneously.
 * Acquisition is refused once this many TDs are active (soft cap — no death).
 */
export const TECH_DEBT_SOFT_CAP = 3;

/**
 * Fraction of the normal storage cost charged when purchasing a config's
 * discount variant. The remainder is paid in Tech Debt.
 */
export const TECH_DEBT_DISCOUNT_RATIO = 0.5;

/**
 * Number of Tech Debt instances acquired per discount purchase. Random
 * selection from the pool, excluding TDs the player already carries.
 */
export const TECH_DEBT_PER_DISCOUNT_PURCHASE = 1;
