import type { ReactNode } from "react";

/**
 * The kit's one link chrome. A link wears the screen's own theme colour at the
 * `soft` rung — the same ink `badge-theme` carries, so a link and a badge on
 * one screen read as the same tone. It is not a hue of its own: it belongs to
 * whatever screen it sits on, which is why it can carry the affordance without
 * claiming a meaning some other mark already owns.
 *
 * The underline derives from `currentColor` rather than naming a colour, so
 * ink and rule cannot drift apart when the theme changes.
 */
const LINK =
	"text-theme-soft underline decoration-current/40 underline-offset-4 transition-colors hover:text-theme-faint hover:decoration-current";

const EXTERNAL_REL = "noreferrer";
const EXTERNAL_TARGET = "_blank";

export type LinkProps = {
	href: string;
	children: ReactNode;
	/** Opens in a new tab. Off by default: in-app routes should not. */
	external?: boolean;
};

export const Link = ({ href, children, external = false }: LinkProps) => (
	<a
		href={href}
		className={LINK}
		{...(external ? { target: EXTERNAL_TARGET, rel: EXTERNAL_REL } : {})}
	>
		{children}
	</a>
);
