// Two ways to be open, one caret: a native <details> carries [open], a button
// that governs something elsewhere on the page carries aria-expanded. Either
// way the group is named `fold`.
const CARET =
	"inline-block shrink-0 text-xs text-zinc-600 transition-transform group-open/fold:rotate-90 group-aria-expanded/fold:rotate-90";

export const Caret = () => (
	<span aria-hidden className={CARET}>
		›
	</span>
);
