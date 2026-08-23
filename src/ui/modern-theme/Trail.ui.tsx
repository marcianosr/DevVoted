import { Fragment, type ReactNode } from "react";

import { clsx } from "clsx";

import { Dot, type DotTone } from "./Dot.ui";
import { Text } from "./Text.ui";

export type CrumbState = "done" | "current" | "todo";

export type CrumbVerdict = "correct" | "partial" | "wrong";

const CRUMB = "inline-flex items-center gap-1.5 px-1";
const DONE = "text-zinc-400";
const CURRENT = "font-bold text-theme";
const TODO = "text-zinc-600";

const VERDICT_DOT = {
	correct: "celadon",
	partial: "saffron",
	wrong: "cinnabar",
} as const satisfies Record<CrumbVerdict, DotTone>;

const SPOKEN = {
	correct: "correct",
	partial: "partly correct",
	wrong: "wrong",
} as const satisfies Record<CrumbVerdict, string>;

export type CrumbProps = { label: ReactNode } & (
	| { state: "done"; verdict: CrumbVerdict }
	| { state: "current"; verdict?: never }
	| { state: "todo"; verdict?: never }
);

const crumbClass = (props: CrumbProps) => {
	if (props.state === "done") return DONE;
	return props.state === "current" ? CURRENT : TODO;
};

const dotTone = (props: CrumbProps): DotTone => {
	if (props.state === "done") return VERDICT_DOT[props.verdict];
	return props.state === "current" ? "theme" : "muted";
};

export const Crumb = (props: CrumbProps) => (
	<span
		aria-current={props.state === "current" ? "step" : undefined}
		className={clsx(CRUMB, crumbClass(props))}
	>
		<Dot tone={dotTone(props)} />
		<Text size="meta" tone="inherit">
			{props.label}
		</Text>
		{props.state === "done" ? (
			<span className="sr-only"> — {SPOKEN[props.verdict]}</span>
		) : null}
	</span>
);

const TRAIL = "flex flex-wrap items-center gap-1";
const SEPARATOR = "shrink-0 text-xs text-zinc-700";

export type TrailItem = CrumbProps & { id: string };

export type TrailProps = {
	items: readonly TrailItem[];
	label: string;
};

export const Trail = ({ items, label }: TrailProps) => (
	<nav aria-label={label} className={TRAIL}>
		{items.map(({ id, ...crumb }, index) => (
			<Fragment key={id}>
				{index > 0 ? (
					<span aria-hidden className={SEPARATOR}>
						›
					</span>
				) : null}
				<Crumb {...crumb} />
			</Fragment>
		))}
	</nav>
);
