import { clsx } from "clsx";

const CARET =
	"inline-block shrink-0 text-xs text-zinc-600 transition-transform";

export type CaretScope = "fold" | "entry" | "row";

const SCOPE = {
	fold: "group-open/fold:rotate-90 group-aria-expanded/fold:rotate-90",
	entry: "group-open/entry:rotate-90 group-aria-expanded/entry:rotate-90",
	row: "group-open/row:rotate-90 group-aria-expanded/row:rotate-90",
} satisfies Record<CaretScope, string>;

export type CaretProps = { scope?: CaretScope };

export const Caret = ({ scope = "fold" }: CaretProps) => (
	<span aria-hidden className={clsx(CARET, SCOPE[scope])}>
		›
	</span>
);
