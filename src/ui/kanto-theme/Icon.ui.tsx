import type { ReactNode } from "react";

import { clsx } from "clsx";

const ICON = "inline-block size-3.5 shrink-0";

const PATHS = {
	shop: (
		<>
			<path d="M1.6 4.4 7 1.8l5.4 2.6v5.2L7 12.2 1.6 9.6Z" />
			<path d="M1.6 4.4 7 7l5.4-2.6" />
			<path d="M7 7v5.2" />
			<path d="M4.3 3.1 9.7 5.7" />
		</>
	),
	community: (
		<>
			<circle cx="5" cy="4.3" r="1.9" />
			<path d="M1.7 11.6c0-1.9 1.5-3.3 3.3-3.3s3.3 1.4 3.3 3.3" />
			<path d="M9.5 3.1a1.9 1.9 0 0 1 0 3.6" />
			<path d="M10.4 8.7c1.1.5 1.9 1.6 1.9 2.9" />
		</>
	),
	gate: (
		<>
			<path d="M3.2 12.4V1.6" />
			<path d="M3.2 2.2h7.6L9 4.7l1.8 2.5H3.2" />
		</>
	),
	review: (
		<>
			<path d="M3.2 1.9h5l2.6 2.6v7.6H3.2Z" />
			<path d="M8 1.9v2.7h2.8" />
			<path d="M5.1 7.5h3.8" />
			<path d="M5.1 9.8h2.4" />
		</>
	),
	clock: (
		<>
			<circle cx="7" cy="7" r="5.1" />
			<path d="M7 4.1V7l2.1 1.4" />
		</>
	),
	closed: (
		<>
			<rect x="2.2" y="2.2" width="9.6" height="9.6" rx="1.6" />
			<path d="m4.8 9.2 4.4-4.4" />
		</>
	),
	storage: (
		<>
			<ellipse cx="7" cy="3.7" rx="4.6" ry="1.8" />
			<path d="M2.4 3.7v6.6c0 1 2.1 1.8 4.6 1.8s4.6-.8 4.6-1.8V3.7" />
			<path d="M2.4 7c0 1 2.1 1.8 4.6 1.8s4.6-.8 4.6-1.8" />
		</>
	),
	floppy: (
		<>
			<path d="M2.4 2.4h7l2.2 2.2v7H2.4Z" />
			<path d="M4.9 2.4h4.2v3.1H4.9Z" />
			<path d="M4.3 8.2h5.4v3.4H4.3Z" />
		</>
	),
	votes: (
		<>
			<path d="M3.1 11.8V8.4" />
			<path d="M7 11.8V5.2" />
			<path d="M10.9 11.8V2.4" />
		</>
	),
	chevron: <path d="M5.5 3.5 9 7l-3.5 3.5" />,
	fold: (
		<>
			<path d="M4.4 6.1 7 3.5l2.6 2.6" />
			<path d="M4.4 7.9 7 10.5l2.6-2.6" />
		</>
	),
	undo: (
		<>
			<path d="M3.4 6.4h5.1a2.6 2.6 0 0 1 0 5.2H6.3" />
			<path d="M5.7 4.1 3.4 6.4l2.3 2.3" />
		</>
	),
	tick: <path d="m3.2 7.3 2.6 2.6 5-5.8" />,
	back: (
		<>
			<path d="M11.5 7h-8" />
			<path d="M6.5 4 3.5 7l3 3" />
		</>
	),
	forward: (
		<>
			<path d="M2.5 7h8" />
			<path d="M7.5 4l3 3-3 3" />
		</>
	),
	lock: (
		<>
			<rect x="2.8" y="6.2" width="8.4" height="5.8" rx="1.2" />
			<path d="M4.6 6.2V4.6a2.4 2.4 0 0 1 4.8 0v1.6" />
		</>
	),
	search: (
		<>
			<circle cx="6.2" cy="6.2" r="3.6" />
			<path d="M8.8 8.8 12 12" />
		</>
	),
	plus: (
		<>
			<path d="M7 3v8" />
			<path d="M3 7h8" />
		</>
	),
	close: (
		<>
			<path d="m3.5 3.5 7 7" />
			<path d="m10.5 3.5-7 7" />
		</>
	),
	star: (
		<path
			d="M7 1.8 8.3 5.7 12.2 7 8.3 8.3 7 12.2 5.7 8.3 1.8 7 5.7 5.7Z"
			fill="currentColor"
			stroke="none"
		/>
	),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export type IconProps = { name: IconName; className?: string };

export const Icon = ({ name, className }: IconProps) => (
	<svg
		aria-hidden
		viewBox="0 0 14 14"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={clsx(ICON, className)}
	>
		{PATHS[name]}
	</svg>
);
