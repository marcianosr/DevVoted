import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDisclosure } from "~/shared/hooks/useDisclosure.hook";

const CARDS = ["ESLint", "Prettier", "Vitest"];

describe("useDisclosure", () => {
	it("opens every card when the section opens by default, and none otherwise", () => {
		const open = renderHook(() => useDisclosure(CARDS, true));
		const shut = renderHook(() => useDisclosure(CARDS, false));

		expect([...open.result.current.open]).toEqual(CARDS);
		expect(shut.result.current.open.size).toBe(0);
	});

	it("flips one card against the default and back", () => {
		const { result } = renderHook(() => useDisclosure(CARDS, false));

		act(() => result.current.toggle("Prettier"));
		expect([...result.current.open]).toEqual(["Prettier"]);

		act(() => result.current.toggle("Prettier"));
		expect(result.current.open.size).toBe(0);
	});

	it("opens all while any card is shut, then shuts all", () => {
		const { result } = renderHook(() => useDisclosure(CARDS, false));

		act(() => result.current.toggleAll());
		expect([...result.current.open]).toEqual(CARDS);

		act(() => result.current.toggleAll());
		expect(result.current.open.size).toBe(0);
	});

	describe("on a small screen", () => {
		const onASmallScreen = () =>
			vi.stubGlobal("matchMedia", (query: string) => ({
				matches: true,
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			}));

		afterEach(() => vi.unstubAllGlobals());

		it("folds every card even when the section opens by default", () => {
			onASmallScreen();

			const { result } = renderHook(() => useDisclosure(CARDS, true));

			expect(result.current.open.size).toBe(0);
		});

		it("opens all from folded, then folds all", () => {
			onASmallScreen();

			const { result } = renderHook(() => useDisclosure(CARDS, true));

			act(() => result.current.toggleAll());
			expect([...result.current.open]).toEqual(CARDS);

			act(() => result.current.toggleAll());
			expect(result.current.open.size).toBe(0);
		});
	});
});
