import { clsx } from "clsx";

import type { KantoColor } from "./colors";

const NOTCH =
	"[clip-path:polygon(0_50%,0.5rem_0,100%_0,100%_100%,0.5rem_100%)]";
const TAG =
	"badge-theme inline-flex h-5 w-fit shrink-0 items-center gap-1.5 pr-2 pl-3.5 text-xs font-bold tabular-nums";
const DOT = "size-1 shrink-0 rounded-full bg-theme-faint";
const DIMMED = "opacity-60";

export type VersionState = "owned" | "offered" | "unaffordable" | "future";

const ACCENT = {
	owned: undefined,
	offered: "viridian",
	unaffordable: "cinnabar",
	future: undefined,
} satisfies Record<VersionState, KantoColor | undefined>;

export const versionAccentOf = (state: VersionState) => ACCENT[state];

export type VersionProps = {
	version: number;
	state?: VersionState;
};

export const Version = ({ version, state = "owned" }: VersionProps) => (
	<span
		data-screen-theme={ACCENT[state]}
		className={clsx(TAG, NOTCH, state === "future" && DIMMED)}
	>
		<span aria-hidden className={DOT} />v{version}
	</span>
);
