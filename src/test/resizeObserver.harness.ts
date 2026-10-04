import { act } from "@testing-library/react";
import { vi } from "vitest";

type MeasuredEntry = { borderBoxSize: readonly { blockSize: number }[] };
type Notify = (entries: readonly MeasuredEntry[]) => void;

export type ResizeObserverHarness = {
	resizeTo: (height: number) => void;
	observedWith: () => ResizeObserverOptions | undefined;
	disconnected: () => boolean;
	observing: () => boolean;
};

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
