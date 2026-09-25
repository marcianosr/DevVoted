import { act } from "@testing-library/react";
import { vi } from "vitest";

/**
 * The shape a resize callback is handed. Narrower than `ResizeObserverEntry`,
 * which carries boxes and a target nothing here reads — and narrow enough to
 * build by hand, which is the point: jsdom lays nothing out, so a height has to
 * come from the entry rather than from the element.
 */
type MeasuredEntry = { borderBoxSize: readonly { blockSize: number }[] };
type Notify = (entries: readonly MeasuredEntry[]) => void;

export type ResizeObserverHarness = {
	/** Reports a new height to every observer, as a resize would. */
	resizeTo: (height: number) => void;
	/** The options the observed element was registered with. */
	observedWith: () => ResizeObserverOptions | undefined;
	/** Whether the screen let go of its observer. */
	disconnected: () => boolean;
	/** Whether anything is being observed at all. */
	observing: () => boolean;
};

/**
 * A ResizeObserver a spec can drive. Install it before rendering; `vi.stubGlobal`
 * is undone by the suite's `unstubAllGlobals`, or by restoring it yourself.
 *
 * Every notification goes through `act`, because the callback sets state outside
 * React's own batching and would otherwise warn on every resize.
 */
export const stubResizeObserver = (): ResizeObserverHarness => {
	const callbacks: Notify[] = [];
	let options: ResizeObserverOptions | undefined;
	let observed = 0;
	let dropped = false;

	class Harnessed {
		constructor(notify: Notify) {
			callbacks.push(notify);
		}

		observe(_bar: Element, given?: ResizeObserverOptions) {
			options = given;
			observed += 1;
		}

		unobserve() {
			observed -= 1;
		}

		disconnect() {
			dropped = true;
			observed = 0;
		}
	}

	vi.stubGlobal("ResizeObserver", Harnessed);

	return {
		resizeTo: (height) =>
			act(() => {
				for (const notify of callbacks)
					notify([{ borderBoxSize: [{ blockSize: height }] }]);
			}),
		observedWith: () => options,
		disconnected: () => dropped,
		observing: () => observed > 0,
	};
};
