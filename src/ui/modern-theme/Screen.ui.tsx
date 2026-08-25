import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

// Two elements, because the tint and the reading width want opposite things:
// the gate's colour is atmosphere and fills the page, while a row with its label
// at one edge and its figure at the other stops reading as one row past a cap.
//
// min-h, not h: a screen taller than the viewport grows the page rather than
// centring itself out of reach at the top.
//
// The floor is a variable because only the page knows whether the viewport is
// the screen's alone: /proto-run stacks a dev rig under it, sets the floor to 0
// and lets flex-1 hand the screen what is left, so the footer and the rig are
// both on screen at once.
const GLOW =
	"flex min-h-[var(--screen-floor,100vh)] w-full flex-1 items-center justify-center bg-theme-faint";
const BODY = "flex w-full max-w-6xl flex-col";

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
