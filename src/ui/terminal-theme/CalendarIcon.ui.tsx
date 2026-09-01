import { clsx } from "clsx";

const ICON = "size-3.5 shrink-0";

export type CalendarIconProps = {
	className?: string;
};

export const CalendarIcon = ({ className }: CalendarIconProps) => (
	<svg
		viewBox="0 0 14 14"
		role="img"
		aria-label="today"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		strokeLinecap="round"
		className={clsx(ICON, className)}
	>
		<rect x="1.8" y="2.8" width="10.4" height="9.4" rx="1.4" />
		<path d="M1.8 5.8h10.4M4.6 1.6v2.2M9.4 1.6v2.2" />
	</svg>
);
