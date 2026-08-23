import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Caret } from "./Caret.ui";
import { Disclosure, DISCLOSURE_SUMMARY } from "./Disclosure.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

export type FoldItem = {
	id: string;
	content: ReactNode;
};

const FOLD = "border-b border-edge";
const SUMMARY = `${DISCLOSURE_SUMMARY} rounded-lg hover:bg-zinc-100/5`;
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
	<Disclosure defaultOpen={defaultOpen} className={clsx(FOLD, className)}>
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
	</Disclosure>
);
