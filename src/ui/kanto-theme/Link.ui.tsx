import type { ReactNode } from "react";

const LINK =
	"text-theme-soft underline decoration-current/40 underline-offset-4 transition-colors hover:text-theme-faint hover:decoration-current";

const EXTERNAL_REL = "noreferrer";
const EXTERNAL_TARGET = "_blank";

export type LinkProps = {
	href: string;
	children: ReactNode;
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
