const CARET =
	"inline-block shrink-0 text-xs text-zinc-600 transition-transform group-open/fold:rotate-90";

export const Caret = () => (
	<span aria-hidden className={CARET}>
		›
	</span>
);
