// Two ways to be open: a native <details> carries [open], a button governing
// something elsewhere carries aria-expanded.
const CARET =
	"inline-block shrink-0 text-xs text-zinc-600 transition-transform group-open/fold:rotate-90 group-aria-expanded/fold:rotate-90";

export const Caret = () => (
	<span aria-hidden className={CARET}>
		›
	</span>
);
