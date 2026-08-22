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

export type FoldableTone = "default" | "cinnabar";

export type FoldableProps = {
	title: ReactNode;
	subtitle?: ReactNode;
	items?: ReadonlyArray<FoldableItem>;
	children?: ReactNode;
	as?: FoldableListTag;
	defaultOpen?: boolean;
	tone?: FoldableTone;
	bordered?: boolean;
	className?: string;
};

const PANEL = "group/foldable bg-surface";
const BOX = "border border-edge";
const SUMMARY =
	"flex cursor-pointer list-none items-center gap-2 p-2 [&::-webkit-details-marker]:hidden bg-zinc-100/5 hover:bg-zinc-100/10 focus:bg-zinc-100/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500";

const SUMMARY_TONE = {
	default: "",
	cinnabar: "bg-cinnabar/10",
} satisfies Record<FoldableTone, string>;

const TITLE_TONE = {
	default: undefined,
	cinnabar: "text-cinnabar",
} satisfies Record<FoldableTone, string | undefined>;

const LIST = "divide-y divide-edge border-t border-edge";
const ITEM = "text-xs text-zinc-100";
const BODY = "border-t border-edge p-2";

export const Foldable = ({
	title,
	subtitle,
	items,
	children,
	as: List = "ul",
	defaultOpen = true,
	tone = "default",
	bordered = true,
	className,
}: FoldableProps) => (
	<details
		open={defaultOpen}
		className={clsx(PANEL, bordered && BOX, className)}
	>
		<summary className={clsx(SUMMARY, SUMMARY_TONE[tone])}>
			<Chevron />
			<Title as="h3" className={TITLE_TONE[tone]}>
				{title}
			</Title>
			{subtitle ? (
				<Subtitle
					className="ml-auto"
					tone={tone === "default" ? "muted" : tone}
				>
					{subtitle}
				</Subtitle>
			) : null}
		</summary>
		{items?.length ? (
			<List className={LIST}>
				{items.map((item) => (
					<li key={item.id} className={ITEM}>
						{item.content}
					</li>
				))}
			</List>
		) : null}
		{children ? <div className={BODY}>{children}</div> : null}
	</details>
);
