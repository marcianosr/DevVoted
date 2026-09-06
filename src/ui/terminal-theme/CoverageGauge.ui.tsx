import { clsx } from "clsx";

import { Text } from "./Text.ui";

const COLUMN = "flex shrink-0 flex-col items-center gap-1.5 self-stretch";
const TRACK =
	"relative flex w-2 min-h-24 flex-1 flex-col justify-end overflow-hidden bg-surface-raised";
const HELD = "w-full shrink-0 bg-theme";
const EARNED = "gauge-earned w-full shrink-0 bg-theme";
const LOST = "gauge-lost w-full shrink-0 bg-cinnabar";
const PENDING = "my-0.5 w-full shrink-0 border border-dashed border-theme";
const DEMAND_MARK = "absolute inset-x-0 h-0.5 bg-zinc-400";

const rounded = (value: number) => Math.round(value * 10) / 10;

const heightOf = (share: number) => `${Math.round(share * 100) / 100}%`;

const settlementOf = (held: number, earned?: number) => {
	const gained = Math.max(0, earned ?? 0);
	return { standing: held - gained, gained, lost: Math.max(0, -(earned ?? 0)) };
};

const readingOf = (held: number, demand: number, offer?: string) => {
	const standing = `${rounded(held)}% of ${rounded(demand)}% needed`;
	return offer === undefined ? standing : `${standing}, ${offer}`;
};

const offerOf = (pending?: number, earned?: number) => {
	if (pending !== undefined)
		return `a correct answer adds ${rounded(pending)}%`;
	if (earned === undefined || earned === 0) return undefined;
	return earned > 0
		? `this answer earned ${rounded(earned)}%`
		: `this answer cost ${rounded(-earned)}%`;
};

export type CoverageGaugeProps = {
	held: number;
	demand: number;
	pending?: number;
	earned?: number;
	className?: string;
};

export const CoverageGauge = ({
	held,
	demand,
	pending,
	earned,
	className,
}: CoverageGaugeProps) => {
	const { standing, gained, lost } = settlementOf(held, earned);
	const ceiling = Math.max(demand, held + lost + (pending ?? 0));
	const shareOf = (value: number) =>
		ceiling <= 0 ? 0 : (Math.max(0, value) / ceiling) * 100;

	return (
		<div className={clsx(COLUMN, className)}>
			<Text size="caption" tone="faint" weight="thin">
				{`${rounded(demand)}%`}
			</Text>
			<span
				role="img"
				aria-label={readingOf(held, demand, offerOf(pending, earned))}
				className={TRACK}
			>
				{pending === undefined ? null : (
					<span
						className={PENDING}
						style={{ height: heightOf(shareOf(pending)) }}
					/>
				)}
				{lost <= 0 ? null : (
					<span className={LOST} style={{ height: heightOf(shareOf(lost)) }} />
				)}
				{gained <= 0 ? null : (
					<span
						className={EARNED}
						style={{ height: heightOf(shareOf(gained)) }}
					/>
				)}
				<span
					className={HELD}
					style={{ height: heightOf(shareOf(standing)) }}
				/>
				{ceiling <= demand ? null : (
					<span
						className={DEMAND_MARK}
						style={{ bottom: heightOf(shareOf(demand)) }}
					/>
				)}
			</span>
			<Text size="caption" tone="muted">
				{`${rounded(held)}%`}
			</Text>
		</div>
	);
};
