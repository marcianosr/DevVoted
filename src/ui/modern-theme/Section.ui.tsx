import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

export type SectionItem = {
	id: string;
	content: ReactNode;
};

const SECTION = "border-b border-edge last:border-b-0";
const LIST = "flex flex-col gap-1";
const LIST_DIVIDED = "flex flex-col divide-y divide-edge";
const BODY = "px-3 pb-2";
const TRAILING = "flex items-center gap-3";
const NOTE = "px-3 pb-2";

export type SectionProps = {
	title: ReactNode;
	subtitle?: ReactNode;
	value?: ReactNode;
	action?: ReactNode;
	note?: ReactNode;
	items?: readonly SectionItem[];
	children?: ReactNode;
	divided?: boolean;
	className?: string;
};

export const Section = ({
	title,
	subtitle,
	value,
	action,
	note,
	items,
	children,
	divided = false,
	className,
}: SectionProps) => (
	<section className={clsx(SECTION, className)}>
		<Row
			spacing="compact"
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
	</section>
);
