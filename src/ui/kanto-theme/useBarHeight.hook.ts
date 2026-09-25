import { useEffect, useState } from "react";

/**
 * The part of a resize entry this reads. `ResizeObserverEntry` satisfies it, and
 * naming only the box is what lets a spec drive the observer with a synthetic
 * one: jsdom lays nothing out, so a height taken off the element itself would
 * always be zero.
 */
type MeasuredBox = { borderBoxSize: readonly { blockSize: number }[] };

/**
 * Border box, not content box: a bar's padding and border are space it occupies
 * at the viewport floor. Rounded up, so a fractional box lifts whatever stacks
 * on it clear rather than leaving it a hairline short.
 */
const heightOf = (box: MeasuredBox): number =>
	Math.ceil(box.borderBoxSize[0]?.blockSize ?? 0);

/**
 * How tall a pinned bar is, for whatever has to stack on top of it.
 *
 * Measured rather than named, because the bar this exists for is a `<details>`
 * the player opens: `Fold` is uncontrolled and nothing listens for `toggle`, so
 * its height changes with no React render behind it, and an observer on the box
 * is the only thing that sees it move. Badge rows wrapping and a web font
 * landing move it too, and a one-shot reading would miss all three.
 *
 * A height cannot go stale on scroll the way the measured popover this repo
 * deleted once did (see `app.css`, the anchor-positioning note) — only the bar's
 * own resizes move it, and each one is an event here.
 *
 * `undefined` until the first measurement lands, so a caller can tell "not
 * measured yet" from "measured as nothing" and lay itself out honestly in the
 * gap rather than guessing at a number it cannot know.
 *
 * The ref is a callback kept in state, not a `useRef`: the effect has to re-run
 * when the node attaches or is swapped, and a ref object would have observed
 * whatever happened to be mounted on the first pass and never looked again.
 */
export const useBarHeight = (): [
	(bar: HTMLElement | null) => void,
	number | undefined,
] => {
	const [bar, setBar] = useState<HTMLElement | null>(null);
	const [height, setHeight] = useState<number>();

	useEffect(() => {
		if (bar === null) return;

		const observer = new ResizeObserver((entries) => {
			const measured = entries.at(-1);
			if (measured === undefined) return;

			setHeight(heightOf(measured));
		});

		observer.observe(bar, { box: "border-box" });
		return () => observer.disconnect();
	}, [bar]);

	return [setBar, height];
};
