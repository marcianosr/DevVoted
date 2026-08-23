import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Text } from "./Text.ui";

export type DisclosureScope = "fold" | "entry" | "row";

const GROUP = {
	fold: "group/fold",
	entry: "group/entry",
	row: "group/row",
} satisfies Record<DisclosureScope, string>;

export const DISCLOSURE_SUMMARY =
	"cursor-pointer list-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean [&::-webkit-details-marker]:hidden";

const DIMMED = "opacity-50";

export type DisclosureProps = {
	scope?: DisclosureScope;
	defaultOpen?: boolean;
	className?: string;
	children: ReactNode;
};

export const Disclosure = ({
	scope = "fold",
	defaultOpen = false,
	className,
	children,
}: DisclosureProps) => (
	<details open={defaultOpen} className={clsx(GROUP[scope], className)}>
		{children}
	</details>
);

export const isExpandable = (summary?: ReactNode, explainer?: ReactNode) =>
	Boolean(summary ?? explainer);

export type DisclosureBodyProps = {
	summary?: ReactNode;
	explainer?: ReactNode;
	dimmed?: boolean;
	className?: string;
};

export const DisclosureBody = ({
	summary,
	explainer,
	dimmed = false,
	className,
}: DisclosureBodyProps) => (
	<div className={clsx(className, dimmed && DIMMED)}>
		{summary ? (
			<Text as="p" size="xxs" tone="muted">
				{summary}
			</Text>
		) : null}
		{explainer ? (
			<Text as="p" size="meta">
				{explainer}
			</Text>
		) : null}
	</div>
);
