import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Text } from "./Text.ui";

const ROW = "flex items-center gap-3";
const MARK = "w-4 shrink-0 text-center";
const LETTER = "w-4 shrink-0 text-center";
const LABEL = "w-32 shrink-0 truncate @max-md:w-24";
const TRACK = "h-1.5 flex-1 overflow-hidden bg-surface-raised";
const FILL = "block h-full";
const PERCENT = "w-10 shrink-0 text-right";

const fillToneFor = (right: boolean, yours: boolean): string => {
	if (right) return "bg-viridian";
	if (yours) return "bg-vermillion/60";
	return "bg-zinc-600";
};

export type ResultRowProps = {
	letter: string;
	label: string;
	percent: number;
	right: boolean;
	yours: boolean;
};

export const ResultRow = ({
	letter,
	label,
	percent,
	right,
	yours,
}: ResultRowProps) => (
	<li className={ROW}>
		<Text aria-hidden tone="viridian" className={MARK}>
			{right ? "✓" : ""}
		</Text>
		<Text tone={right ? "viridian" : "muted"} className={LETTER}>
			{letter}
		</Text>
		<Text
			tone={right ? "default" : "muted"}
			className={clsx(LABEL, right && "font-bold")}
		>
			{label}
		</Text>
		<span aria-hidden className={TRACK}>
			<span
				className={clsx(FILL, fillToneFor(right, yours))}
				style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
			/>
		</span>
		<Text className={clsx(PERCENT, !right && "text-zinc-400")}>{percent}%</Text>
		{yours ? <Badge tone="cinnabar">you</Badge> : null}
	</li>
);
