import { formatDurationMs } from "~/shared/lib/dateUtils";
import { formatKb } from "~/shared/lib/storage";

/**
 * The quantities a screen shows the player, as numbers plus a unit rather than
 * finished strings. Domain models build these; presentation formats them, so a
 * value is reachable from a story instead of only from the engine state that
 * produces it.
 *
 * Each context composes its own union from these plus whatever it alone needs
 * (`GateRewardValue` adds check progress, `StandoutValue` adds config counts).
 * A single shared union would force every formatter to handle every other
 * context's variants. What is shared is the *formatting*, which is where the
 * two known inconsistencies came from: the same percentage rendered signed in
 * the gate report and always-positive in the awards panel, and the same KB
 * amount rolling over to MB in the shop but not in the gate report.
 */
export type Percent = { readonly unit: "percent"; readonly amount: number };
export type Kb = { readonly unit: "kb"; readonly amount: number };
export type Duration = { readonly unit: "duration"; readonly ms: number };
export type Count = { readonly unit: "count"; readonly amount: number };
/** Nothing was earned here, as opposed to zero being earned. */
export type Nothing = { readonly unit: "none" };

export const percent = (amount: number): Percent => ({
	unit: "percent",
	amount,
});
export const kb = (amount: number): Kb => ({ unit: "kb", amount });
export const duration = (ms: number): Duration => ({ unit: "duration", ms });
export const count = (amount: number): Count => ({ unit: "count", amount });
export const nothing: Nothing = { unit: "none" };

/** Gains carry their sign so a column of them reads as movement; losses already
 * carry a minus, and "+-1.2%" was the bug this rule replaces. */
export const formatPercent = ({ amount }: Percent): string =>
	`${amount < 0 ? "" : "+"}${amount}%`;

/** Defers to `formatKb`, so a four-figure payout reads "2MB" everywhere rather
 * than "2048KB" in one screen and "2MB" in the next. */
export const formatKbGain = ({ amount }: Kb): string => `+${formatKb(amount)}`;

export const formatDuration = ({ ms }: Duration): string =>
	formatDurationMs(ms);

export const formatCount = ({ amount }: Count): string => String(amount);

/** An em dash reads as "nothing to report" in a column of numbers, where a blank
 * cell reads as a rendering fault. */
export const NOTHING_SHOWN = "—";
