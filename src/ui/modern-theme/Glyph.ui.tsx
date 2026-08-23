import { clsx } from "clsx";

export type GlyphName = "rebuild" | "extend" | "tag";

const PATHS = {
	rebuild: (
		<>
			<path d="M12.5 6.5A5 5 0 1 0 12 9.4" />
			<path d="M12.5 2.5v4h-4" />
		</>
	),
	extend: (
		<>
			<path d="M7 3.5v7" />
			<path d="M3.5 7h7" />
		</>
	),
	tag: (
		<>
			<circle cx="3.5" cy="3.5" r="1.6" />
			<circle cx="3.5" cy="10.5" r="1.6" />
			<circle cx="10.5" cy="4.5" r="1.6" />
			<path d="M3.5 5.1v3.8" />
			<path d="M10.5 6.1a3.5 3.5 0 0 1-3.5 3.5H5.1" />
		</>
	),
} satisfies Record<GlyphName, React.ReactNode>;

export type GlyphProps = { name: GlyphName; className?: string };

export const Glyph = ({ name, className }: GlyphProps) => (
	<svg
		viewBox="0 0 14 14"
		aria-hidden
		className={clsx("size-3.5 shrink-0", className)}
		fill="none"
		stroke="currentColor"
		strokeWidth="1.3"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		{PATHS[name]}
	</svg>
);
