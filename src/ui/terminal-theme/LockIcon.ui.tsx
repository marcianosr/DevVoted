import { clsx } from "clsx";

const ICON = "size-3.5 shrink-0";

export type LockIconProps = {
	className?: string;
};

export const LockIcon = ({ className }: LockIconProps) => (
	<svg
		viewBox="0 0 14 14"
		role="img"
		aria-label="lock"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={clsx(ICON, className)}
	>
		<rect x="2.6" y="6.2" width="8.8" height="5.6" rx="1.2" />
		<path d="M4.8 6.2V4.4a2.2 2.2 0 0 1 4.4 0v1.8" />
	</svg>
);
