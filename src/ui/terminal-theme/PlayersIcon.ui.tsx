import { clsx } from "clsx";

const ICON = "size-3.5 shrink-0";

export type PlayersIconProps = {
	className?: string;
};

export const PlayersIcon = ({ className }: PlayersIconProps) => (
	<svg
		viewBox="0 0 14 14"
		role="img"
		aria-label="community"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		strokeLinecap="round"
		className={clsx(ICON, className)}
	>
		<circle cx="5.2" cy="4.8" r="2" />
		<path d="M1.6 12.1a3.6 3.6 0 0 1 7.2 0" />
		<path d="M9.4 3.1a2 2 0 0 1 0 3.6M10.4 8.9a3.6 3.6 0 0 1 2 3.2" />
	</svg>
);
