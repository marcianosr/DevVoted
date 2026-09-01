import { clsx } from "clsx";

const ICON = "size-3.5 shrink-0";

export type GitTagIconProps = {
	className?: string;
};

export const GitTagIcon = ({ className }: GitTagIconProps) => (
	<svg
		viewBox="0 0 14 14"
		role="img"
		aria-label="git tag"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		strokeLinecap="round"
		className={clsx(ICON, className)}
	>
		<circle cx="4" cy="3.4" r="1.5" />
		<circle cx="4" cy="10.6" r="1.5" />
		<circle cx="10.2" cy="5.2" r="1.5" />
		<path d="M4 4.9v4.2" />
		<path d="M10.2 6.7c0 2.2-2.6 2.1-4.8 3" />
	</svg>
);
