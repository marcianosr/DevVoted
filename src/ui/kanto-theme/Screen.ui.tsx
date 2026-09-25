import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import type { KantoColor } from "./colors";

const SCREEN =
	"flex min-h-[var(--screen-floor,80vh)] w-full flex-col items-center mx-auto";
const FRAME = "bg-theme-faint rounded-3xl border-theme-faint border-1";
const BODY = "flex w-full flex-1 flex-col gap-6 p-4 sm:p-8";

export type ScreenWidth = "narrow" | "default" | "wide";
export type ScreenGround = "framed" | "bare";

const WIDTH = {
	narrow: "max-w-2xl",
	default: "max-w-[900px]",
	// Room for two columns: a collection screen listing rather than deciding,
	// and the poll screen, which stands its coverage readout beside the
	// question. A run screen that asks one question at a time still refuses it.
	wide: "max-w-6xl",
} satisfies Record<ScreenWidth, string>;

export type ScreenProps = {
	children: ReactNode;
	width?: ScreenWidth;
	ground?: ScreenGround;
} & (
	{ theme: KantoColor; gate?: never } | { gate: SwatchTheme; theme?: never }
);

export const Screen = ({
	width = "default",
	ground = "framed",
	children,
	...props
}: ScreenProps) => (
	<section
		data-screen-theme={props.theme}
		data-gate-theme={props.gate}
		className={clsx(SCREEN, WIDTH[width], ground === "framed" && FRAME)}
	>
		<div className={BODY}>{children}</div>
	</section>
);
