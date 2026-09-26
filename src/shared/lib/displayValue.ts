import { formatDurationMs } from "~/shared/lib/dateUtils";
import { formatKb } from "~/shared/lib/storage";

export type Percent = { readonly unit: "percent"; readonly amount: number };
export type Kb = { readonly unit: "kb"; readonly amount: number };
export type Duration = { readonly unit: "duration"; readonly ms: number };
export type Count = { readonly unit: "count"; readonly amount: number };
export type Nothing = { readonly unit: "none" };

export const percent = (amount: number): Percent => ({
	unit: "percent",
	amount,
});
export const kb = (amount: number): Kb => ({ unit: "kb", amount });
export const duration = (ms: number): Duration => ({ unit: "duration", ms });
export const count = (amount: number): Count => ({ unit: "count", amount });
export const nothing: Nothing = { unit: "none" };

export const formatPercent = ({ amount }: Percent): string =>
	`${amount < 0 ? "" : "+"}${amount}%`;

export const formatKbGain = ({ amount }: Kb): string => `+${formatKb(amount)}`;

export const formatDuration = ({ ms }: Duration): string =>
	formatDurationMs(ms);

export const formatCount = ({ amount }: Count): string => String(amount);

export const NOTHING_SHOWN = "—";

export const plural = (count: number, one: string, many = `${one}s`): string =>
	`${count} ${count === 1 ? one : many}`;
