import { clsx } from "clsx";

const CARET =
	"inline-block shrink-0 text-xs text-zinc-600 transition-transform";

/** Which named group the caret watches. A nested disclosure needs its own name:
 * `group-open/fold` matches ANY open ancestor carrying that name, so an inner
 * caret sharing it would rotate off the outer one's state. */
export type CaretScope = "fold" | "row";

// Two ways to be open: a native <details> carries [open], a button governing
// something elsewhere carries aria-expanded.
const SCOPE = {
	fold: "group-open/fold:rotate-90 group-aria-expanded/fold:rotate-90",
	row: "group-open/row:rotate-90 group-aria-expanded/row:rotate-90",
} satisfies Record<CaretScope, string>;

export type CaretProps = { scope?: CaretScope };

export const Caret = ({ scope = "fold" }: CaretProps) => (
	<span aria-hidden className={clsx(CARET, SCOPE[scope])}>
		›
	</span>
);
