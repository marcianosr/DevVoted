import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

const SCREEN = "flex flex-col bg-theme-faint";

export type ScreenProps = {
	/** The gate whose colour the page wears (ADR-020). A closed union, not a
	 * string: `app.css` styles exactly these thirteen, and anything else fell
	 * silently back to cerulean. */
	theme?: SwatchTheme;
	children: ReactNode;
};

export const Screen = ({ theme, children }: ScreenProps) => (
	<article data-gate-theme={theme} className={SCREEN}>
		{children}
	</article>
);
