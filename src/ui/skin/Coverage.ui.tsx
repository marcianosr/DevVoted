import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Subtitle } from "./Subtitle.ui";
import type { SkinTone } from "./tones";

const TRACK = "relative flex h-3 w-full overflow-hidden rounded-sm bg-zinc-800";
const NOW = "h-full bg-theme";

// Projected coverage is dimmer rather than hatched: the legend already names it,
// and one fill at two strengths survives a 3px-tall bar where stripes do not.
const PROJECTED = "h-full bg-theme opacity-40";

// The bar the run has to clear. Absolute, because its place is a percentage.
const MARKER = "absolute top-0 h-full w-0.5 bg-zinc-100";

const LEGEND = "flex flex-wrap items-center gap-x-4 gap-y-1";
const KEY = "flex items-center gap-1.5";
const CHIP = "inline-block size-2 rounded-sm bg-current";
const BODY = "flex flex-col gap-2";

export type CoverageProps = {
	now: number;
	projected: number;
	required: number;
	verdict?: ReactNode;
	verdictTone?: SkinTone;
};

const percent = (value: number) => `${Math.min(100, Math.max(0, value))}%`;

export const Coverage = ({ now, projected, required }: CoverageProps) => (
	<div className={BODY}>
		<div className={TRACK}>
			<span className={NOW} style={{ width: percent(now) }} />
			<span className={PROJECTED} style={{ width: percent(projected) }} />
			<span className={MARKER} style={{ left: percent(required) }} />
		</div>

		<div className={LEGEND}>
			<span className={KEY}>
				<span className={clsx(CHIP, "text-theme")} />
				<Subtitle>{now}% now</Subtitle>
			</span>
			<span className={KEY}>
				<span className={clsx(CHIP, "text-theme opacity-40")} />
				<Subtitle>+{projected}% projected</Subtitle>
			</span>
			<span className={KEY}>
				<Subtitle>| {required}% required</Subtitle>
			</span>
		</div>
	</div>
);
