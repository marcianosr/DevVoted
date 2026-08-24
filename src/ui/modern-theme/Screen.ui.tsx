import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

// Two elements, because the tint and the reading width want opposite things:
// the gate's colour is atmosphere and reaches both edges, while a row with its
// label at one edge and its figure at the other stops reading as one row.
const GLOW = "w-full bg-theme-faint";
const BODY = "mx-auto flex w-full max-w-6xl flex-col";

export type ScreenProps = {
	/** The gate whose colour the page wears (ADR-020). A closed union, not a
	 * string: `app.css` styles exactly these thirteen, and anything else fell
	 * silently back to cerulean. */
	theme?: SwatchTheme;
	children: ReactNode;
};

export const Screen = ({ theme, children }: ScreenProps) => (
	<article data-gate-theme={theme} className={GLOW}>
		<div className={BODY}>{children}</div>
	</article>
);
