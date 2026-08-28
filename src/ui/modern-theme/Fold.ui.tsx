import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Caret } from "./Caret.ui";
import { Disclosure, DISCLOSURE_SUMMARY } from "./Disclosure.ui";
import { Row } from "./Row.ui";
import type { SectionItem } from "./Section.ui";
import { Text } from "./Text.ui";

export type FoldItem = SectionItem;

const FOLD = "border-b border-edge last:border-b-0";
const SUMMARY = `${DISCLOSURE_SUMMARY} rounded-lg hover:bg-zinc-100/5`;
const LIST = "flex flex-col gap-1";
const LIST_DIVIDED = "flex flex-col divide-y divide-edge";
const BODY = "px-3 pb-2";
const TRAILING = "flex items-center gap-3";
const LEADING = "flex shrink-0 items-center gap-3";
const NOTE = "px-3 pb-2";

export type FoldProps = {
	title: ReactNode;
	subtitle?: ReactNode;
	icon?: ReactNode;
	value?: ReactNode;
	action?: ReactNode;
	note?: ReactNode;
	items?: readonly FoldItem[];
	children?: ReactNode;
	defaultOpen?: boolean;
	divided?: boolean;
	className?: string;
};

export const Fold = ({
	title,
	subtitle,
	icon,
	value,
	action,
	note,
	items,
	children,
	defaultOpen = true,
	divided = false,
	className,
}: FoldProps) => (
	<Disclosure defaultOpen={defaultOpen} className={clsx(FOLD, className)}>
		<Row
			as="summary"
			spacing="compact"
			className={SUMMARY}
			leading={
				icon ? (
					<span className={LEADING}>
						<Caret />
						{icon}
					</span>
				) : (
					<Caret />
				)
			}
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
			{subtitle ? (
				<Text size="meta" tone="muted">
					{subtitle}
				</Text>
			) : null}
		</Row>
		{note ? <div className={NOTE}>{note}</div> : null}
		{items?.length ? (
			<ul className={divided ? LIST_DIVIDED : LIST}>
				{items.map((item) => (
					<li key={item.id}>{item.content}</li>
				))}
			</ul>
		) : null}
		{children ? <div className={BODY}>{children}</div> : null}
	</Disclosure>
);
