import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";
import { swatchTheme } from "~/ui/theme/swatchTheme";

const FRAME = "@container mx-auto w-full py-8";
const READING_WIDTH = "max-w-[850px]";
const SIDEBAR_WIDTH = "max-w-[1040px]";
const PANEL =
	"flex flex-col gap-6 rounded-2xl border border-edge px-6 py-5 @max-md:px-4 @max-md:py-4";

const groundOf = (theme: SwatchTheme | undefined) =>
	theme === undefined ? "bg-zinc-950" : "bg-theme-faint";

export type PanelProps = {
	children: ReactNode;
	theme?: SwatchTheme;
	sidebar?: boolean;
	className?: string;
};

export const Panel = ({ children, theme, sidebar, className }: PanelProps) => (
	<div
		className={clsx(FRAME, sidebar === true ? SIDEBAR_WIDTH : READING_WIDTH)}
	>
		<article
			{...swatchTheme(theme)}
			className={clsx(PANEL, groundOf(theme), className)}
		>
			{children}
		</article>
	</div>
);
