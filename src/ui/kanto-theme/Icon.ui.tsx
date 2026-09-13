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
			<path d="M3.4 12.4V4.3h7.2v8.1" />
			<path d="M1.9 4.3h10.2" />
			<path d="M5.9 7.3 7.6 9l-1.7 1.7" />
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
	votes: (
		<>
			<path d="M3.1 11.8V8.4" />
			<path d="M7 11.8V5.2" />
			<path d="M10.9 11.8V2.4" />
		</>
	),
	chevron: <path d="M5.5 3.5 9 7l-3.5 3.5" />,
	back: (
		<>
			<path d="M11.5 7h-8" />
			<path d="M6.5 4 3.5 7l3 3" />
		</>
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
