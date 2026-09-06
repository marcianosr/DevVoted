import { clsx } from "clsx";

const ICON = "size-3.5 shrink-0";

export type AuditIconProps = {
	passing?: boolean;
	className?: string;
};

export const AuditIcon = ({ passing = false, className }: AuditIconProps) => (
	<svg
		viewBox="0 0 14 14"
		aria-hidden
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={clsx(ICON, className)}
	>
		{passing ? (
			<>
				<path d="M1.6 7h11.2" />
				<path d="M10.8 5.2 12.8 7 10.8 8.8" />
				<path d="M11.6 2.2v3" />
				<path d="M11.6 8.8v3" />
			</>
		) : (
			<>
				<path d="M7 2.2 12.6 11.8H1.4Z" />
				<path d="M7 6v2.3" />
				<path d="M7 10.3h.01" />
			</>
		)}
	</svg>
);
