/**
 * The caret on a fold's own summary row, turning down as it opens.
 *
 * It reads the parent `<details className="group">` rather than any state, which
 * is why it is a bare span and not part of `Disclosure`: that component owns its
 * whole summary line (a faint Paragraph) and namespaces itself `group/disclosure`
 * precisely so a caller can nest one inside its own fold. A summary that carries
 * a badge, a score column or a percentage builds its own `<details>` and reaches
 * for this instead.
 */
export const FoldCaret = () => (
	<span
		aria-hidden
		className="shrink-0 text-zinc-600 transition-transform group-open:rotate-90"
	>
		▸
	</span>
);
