import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Chevron } from "./Chevron.ui";
import { Subtitle } from "./Subtitle.ui";
import { Title } from "./Title.ui";

export type FoldableItem = {
	id: string;
	content: ReactNode;
};

type FoldableListTag = "ul" | "ol";

export type FoldableProps = {
	title: ReactNode;
	subtitle?: ReactNode;
	items: ReadonlyArray<FoldableItem>;
	as?: FoldableListTag;
	defaultOpen?: boolean;
	className?: string;
};

const PANEL = "group/foldable border border-edge bg-surface";
const SUMMARY =
	"flex cursor-pointer list-none items-center gap-2 p-2 [&::-webkit-details-marker]:hidden";
const LIST = "divide-y divide-edge border-t border-edge";
const ITEM = "p-2 text-xs text-zinc-100";

export const Foldable = ({
	title,
	subtitle,
	items,
	as: List = "ul",
	defaultOpen = true,
	className,
}: FoldableProps) => (
	<details open={defaultOpen} className={clsx(PANEL, className)}>
		<summary className={SUMMARY}>
			<Chevron />
			<Title as="h3">{title}</Title>
			{subtitle ? <Subtitle className="ml-auto">{subtitle}</Subtitle> : null}
		</summary>
		<List className={LIST}>
			{items.map((item) => (
				<li key={item.id} className={ITEM}>
					{item.content}
				</li>
			))}
		</List>
	</details>
);
