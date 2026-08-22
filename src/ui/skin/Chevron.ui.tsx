const CHEVRON =
	"shrink-0 text-xs text-zinc-600 transition-transform group-open/foldable:rotate-90";

// Reads the parent `<details className="group/foldable">`, so it needs no open prop.
export const Chevron = () => (
	<span aria-hidden className={CHEVRON}>
		▸
	</span>
);
