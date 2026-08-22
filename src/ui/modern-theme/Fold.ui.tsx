import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Caret } from "./Caret.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

export type FoldItem = {
	id: string;
	content: ReactNode;
};

const FOLD = "group/fold border-b border-edge";
const SUMMARY =
	"cursor-pointer list-none rounded-lg hover:bg-zinc-100/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean [&::-webkit-details-marker]:hidden";
const LIST = "flex flex-col";
const BODY = "px-3 pb-2";
const TRAILING = "flex items-center gap-3";
const NOTE = "px-3 pb-2";

export type FoldProps = {
	title: ReactNode;
	value?: ReactNode;
	action?: ReactNode;
	note?: ReactNode;
	items?: readonly FoldItem[];
	children?: ReactNode;
	defaultOpen?: boolean;
	className?: string;
};

export const Fold = ({
	title,
	value,
	action,
	note,
	items,
	children,
	defaultOpen = true,
	className,
}: FoldProps) => (
	<details open={defaultOpen} className={clsx(FOLD, className)}>
		<Row
			as="summary"
			spacing="compact"
			className={SUMMARY}
			leading={<Caret />}
			trailing={
				value || action ? (
					<span className={TRAILING}>
						{value}
						{action}
					</span>
				) : null
			}
		>
			<Text size="body">{title}</Text>
		</Row>
		{note ? <div className={NOTE}>{note}</div> : null}
		{items?.length ? (
			<ul className={LIST}>
				{items.map((item) => (
					<li key={item.id}>{item.content}</li>
				))}
			</ul>
		) : null}
		{children ? <div className={BODY}>{children}</div> : null}
	</details>
);
