import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import type { KantoColor } from "./colors";

const SCREEN =
	"flex min-h-[var(--screen-floor,80vh)] w-full flex-col items-center bg-theme-faint mx-auto rounded-lg border-theme-faint border-1";
const BODY = "flex w-full flex-1 flex-col gap-6 px-4 py-4";

export type ScreenWidth = "narrow" | "medium" | "default";

const WIDTH = {
	narrow: "max-w-2xl",
	medium: "max-w-[900px]",
	default: "max-w-[1150px]",
} satisfies Record<ScreenWidth, string>;

export type ScreenProps = { children: ReactNode; width?: ScreenWidth } & (
	{ theme: KantoColor; gate?: never } | { gate: SwatchTheme; theme?: never }
);

export const Screen = ({
	width = "default",
	children,
	...props
}: ScreenProps) => (
	<section
		data-screen-theme={props.theme}
		data-gate-theme={props.gate}
		className={clsx(SCREEN, WIDTH[width])}
	>
		<div className={BODY}>{children}</div>
	</section>
);
