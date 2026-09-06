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
		<path d={passing ? "M1.6 7h11.2" : "M1.6 7h6.4"} />
		<path d={passing ? "M10.8 5.2 12.8 7 10.8 8.8" : "M6 5.2 8 7 6 8.8"} />
		{passing ? (
			<>
				<path d="M11.6 2.2v3" />
				<path d="M11.6 8.8v3" />
			</>
		) : (
			<path d="M11.6 2.2v9.6" />
		)}
	</svg>
);
