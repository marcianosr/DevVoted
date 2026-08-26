import { clsx } from "clsx";

export type GlyphName =
	| "rebuild"
	| "extend"
	| "tag"
	| "suggest"
	| "uninstall"
	| "fold"
	// The audit roster. Named for the audit, not the shape, the way the four
	// above are named for what pressing them does.
	| "overrun"
	| "outage"
	| "readonly"
	| "freeze"
	| "mirror"
	| "timeout"
	| "flake"
	| "leak"
	| "rolling"
	| "breaking"
	| "strip"
	| "calendar"
	| "players";

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
	suggest: (
		<>
			<path d="M5.5 1.8 6.5 4.6 9.3 5.6 6.5 6.6 5.5 9.4 4.5 6.6 1.7 5.6 4.5 4.6Z" />
			<path d="M10.4 8 10.9 9.4 12.3 9.9 10.9 10.4 10.4 11.8 9.9 10.4 8.5 9.9 9.9 9.4Z" />
		</>
	),
	// An arrow leaving the tray, not a bin: uninstalling hands storage back, and a
	// bin would promise the config is destroyed for nothing.
	uninstall: (
		<>
			<path d="M7 9V2.2" />
			<path d="M4.4 4.8 7 2.2l2.6 2.6" />
			<path d="M2.4 8.4v2.4a1 1 0 0 0 1 1h7.2a1 1 0 0 0 1-1V8.4" />
		</>
	),
	fold: (
		<>
			<path d="M3 4.5h8" />
			<path d="M3 7h8" />
			<path d="M3 9.5h8" />
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
	overrun: (
		<>
			<rect x="1.5" y="3.5" width="11" height="7" rx="1.5" />
			<circle cx="7" cy="7" r="1.7" />
		</>
	),
	outage: (
		<>
			<circle cx="7" cy="7" r="5.2" />
			<path d="M3.3 3.3 10.7 10.7" />
		</>
	),
	readonly: (
		<>
			<rect x="3" y="6.3" width="8" height="6.2" rx="1.2" />
			<path d="M5 6.3V4.6a2 2 0 0 1 4 0v1.7" />
		</>
	),
	freeze: (
		<>
			<path d="M7 1.4v11.2" />
			<path d="M2.2 3.6 11.8 10.4" />
			<path d="M11.8 3.6 2.2 10.4" />
		</>
	),
	mirror: (
		<>
			<path d="M2 4.6h9.4" />
			<path d="M9.2 2.4 11.6 4.6 9.2 6.8" />
			<path d="M12 9.4H2.6" />
			<path d="M4.8 7.2 2.4 9.4 4.8 11.6" />
		</>
	),
	timeout: (
		<>
			<circle cx="7" cy="7" r="5.2" />
			<path d="M7 3.9v3.3l2.3 1.4" />
		</>
	),
	flake: <path d="M1.6 9.2 4.4 4.8 7 9.2 9.6 4.8l2.8 4.4" />,
	leak: (
		<path d="M7 1.9c0 0 3.9 4.2 3.9 6.6a3.9 3.9 0 0 1-7.8 0C3.1 6.1 7 1.9 7 1.9Z" />
	),
	rolling: (
		<>
			<path d="M11.7 6.1A5 5 0 0 0 2.6 4.9" />
			<path d="M2.3 7.9a5 5 0 0 0 9.1 1.2" />
			<path d="M2.4 1.9v3h3" />
			<path d="M11.6 12.1v-3h-3" />
		</>
	),
	breaking: <path d="M8.2 1.6 5.2 6.6h3.4l-3 5.8" />,
	strip: (
		<>
			<rect x="1.8" y="7.4" width="9.4" height="5" rx="1.2" />
			<path d="M3.4 5h8.8" />
			<path d="M5 2.6h8.5" />
		</>
	),
	calendar: (
		<>
			<rect x="1.8" y="2.8" width="10.4" height="9.4" rx="1.4" />
			<path d="M1.8 5.8h10.4M4.6 1.6v2.2M9.4 1.6v2.2" />
		</>
	),
	players: (
		<>
			<circle cx="5.2" cy="4.8" r="2" />
			<path d="M1.6 12.1a3.6 3.6 0 0 1 7.2 0" />
			<path d="M9.4 3.1a2 2 0 0 1 0 3.6M10.4 8.9a3.6 3.6 0 0 1 2 3.2" />
		</>
	),
} satisfies Record<GlyphName, React.ReactNode>;

const FRAMED =
	"inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-700 text-zinc-500";

export type GlyphProps = {
	name: GlyphName;
	/** Rings the glyph in a dashed disc — the marker for something offered but
	 * not yet taken, which is why it sits where a taken row's mark would. */
	framed?: boolean;
	className?: string;
};

const svgOf = (name: GlyphName, className?: string) => (
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

export const Glyph = ({ name, framed, className }: GlyphProps) =>
	framed ? (
		<span className={FRAMED}>{svgOf(name, "size-3")}</span>
	) : (
		svgOf(name, className)
	);
