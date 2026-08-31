import { clsx } from "clsx";
import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

const GLOW =
	"flex min-h-[var(--screen-floor,100vh)] w-full flex-1 items-center justify-center bg-theme-faint";
const BODY = "flex w-full flex-col";

export type ScreenSize = "3xl" | "6xl";

const SIZE = {
	"3xl": "max-w-3xl",
	"6xl": "max-w-6xl",
} satisfies Record<ScreenSize, string>;

export type ScreenProps = {
	theme?: SwatchTheme;
	children: ReactNode;
	size?: ScreenSize;
};

export const Screen = ({ theme, size = "6xl", children }: ScreenProps) => (
	<article data-gate-theme={theme} className={GLOW}>
		<div className={clsx(BODY, SIZE[size])}>{children}</div>
	</article>
);
