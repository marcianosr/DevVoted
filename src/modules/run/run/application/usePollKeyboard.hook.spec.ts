import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderHook } from "@testing-library/react";

import { usePollKeyboard } from "./usePollKeyboard.hook";

const KEYS = [
	{ letter: "A", id: "option-1" },
	{ letter: "B", id: "option-2" },
] as const;

describe("usePollKeyboard", () => {
	it("picks the answer whose letter is pressed, in either case", () => {
		const onPick = vi.fn();
		renderHook(() => usePollKeyboard({ keys: KEYS, onPick }));

		fireEvent.keyDown(window, { key: "b" });
		fireEvent.keyDown(window, { key: "A" });

		expect(onPick).toHaveBeenNthCalledWith(1, "option-2");
		expect(onPick).toHaveBeenNthCalledWith(2, "option-1");
	});

	it("presses the footer action on Enter and keeps the browser off the row", () => {
		const onEnter = vi.fn();
		renderHook(() => usePollKeyboard({ keys: KEYS, onEnter }));

		const allowed = fireEvent.keyDown(window, { key: "Enter" });

		expect(onEnter).toHaveBeenCalledOnce();
		expect(allowed).toBe(false);
	});

	it("leaves Enter to the browser while there is nothing to press", () => {
		renderHook(() => usePollKeyboard({ keys: KEYS, onPick: vi.fn() }));

		expect(fireEvent.keyDown(window, { key: "Enter" })).toBe(true);
	});

	it("ignores a letter that is not an answer, or comes with a modifier", () => {
		const onPick = vi.fn();
		renderHook(() => usePollKeyboard({ keys: KEYS, onPick }));

		fireEvent.keyDown(window, { key: "z" });
		fireEvent.keyDown(window, { key: "a", metaKey: true });

		expect(onPick).not.toHaveBeenCalled();
	});

	it("stays out of the way of typing", () => {
		const onPick = vi.fn();
		const input = document.createElement("input");
		document.body.append(input);
		renderHook(() => usePollKeyboard({ keys: KEYS, onPick }));

		fireEvent.keyDown(input, { key: "a" });

		expect(onPick).not.toHaveBeenCalled();
		input.remove();
	});

	it("stops listening once unmounted", () => {
		const onPick = vi.fn();
		const { unmount } = renderHook(() =>
			usePollKeyboard({ keys: KEYS, onPick })
		);

		unmount();
		fireEvent.keyDown(window, { key: "a" });

		expect(onPick).not.toHaveBeenCalled();
	});
});
