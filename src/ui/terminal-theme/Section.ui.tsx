import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Text } from "./Text.ui";

const SUMMARY =
	"flex cursor-pointer list-none items-center gap-2 py-1.5 select-none [&::-webkit-details-marker]:hidden ";
const CARET =
	"inline-block text-zinc-500 transition-transform group-open/section:rotate-90";
const LABEL = "font-extrabold tracking-wide uppercase";
const META = "ml-auto shrink-0";
const DIVIDED = "divide-y divide-edge";

export type SectionProps = {
	label: string;
	mark?: ReactNode;
	meta?: ReactNode;
	defaultOpen?: boolean;
	divided?: boolean;
	children: ReactNode;
	className?: string;
};

const metaOf = (meta: ReactNode) =>
	typeof meta === "string" ? (
		<Text tone="muted" size="caption">
			{meta}
		</Text>
	) : (
		meta
	);

export const Section = ({
	label,
	mark,
	meta,
	defaultOpen = true,
	divided = false,
	children,
	className,
}: SectionProps) => (
	<details open={defaultOpen} className={clsx("group/section", className)}>
		<summary className={SUMMARY}>
			<span aria-hidden className={CARET}>
				›
			</span>
			{mark}
			<Text className={LABEL}>{label}</Text>
			{meta === undefined ? null : <span className={META}>{metaOf(meta)}</span>}
		</summary>
		<div className={divided ? DIVIDED : undefined}>{children}</div>
	</details>
);
