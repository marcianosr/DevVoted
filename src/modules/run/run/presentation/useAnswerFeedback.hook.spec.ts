import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";

import {
	CARD_LEAVE_MS,
	FLIGHT_FALLBACK_MS,
	useAnswerFeedback,
} from "./useAnswerFeedback.hook";

const answeredWith = (outcome: AnsweredPoll["outcome"]): AnsweredPoll => ({
	id: "pallet-1",
	question: "Which town does Ash leave from?",
	category: "js",
	outcome,
	picked: [],
});

describe("useAnswerFeedback", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("keeps the answered card on screen until Next is pressed", () => {
		const onDone = vi.fn();
		const { result } = renderHook(() =>
			useAnswerFeedback(answeredWith("correct"), onDone)
		);

		act(() => vi.advanceTimersByTime(60_000));
		expect(result.current.leaving).toBe(false);

		act(() => result.current.next());
		expect(result.current.leaving).toBe(true);
		expect(onDone).not.toHaveBeenCalled();

		act(() => vi.advanceTimersByTime(CARD_LEAVE_MS));
		expect(onDone).toHaveBeenCalledOnce();
	});

	it("waits for the gain chip to land before a pressed Next sends the card away", () => {
		const onDone = vi.fn();
		const { result } = renderHook(() =>
			useAnswerFeedback(answeredWith("correct"), onDone, true)
		);

		act(() => result.current.next());
		expect(result.current.leaving).toBe(false);

		act(() => result.current.settle());
		expect(result.current.leaving).toBe(true);
	});

	it("lets Next through when the chip never settles", () => {
		const onDone = vi.fn();
		const { result } = renderHook(() =>
			useAnswerFeedback(answeredWith("correct"), onDone, true)
		);

		act(() => result.current.next());
		act(() => vi.advanceTimersByTime(FLIGHT_FALLBACK_MS));
		expect(onDone).toHaveBeenCalledOnce();
	});

	it("sends the card away only once, however often Next is pressed", () => {
		const onDone = vi.fn();
		const { result } = renderHook(() =>
			useAnswerFeedback(answeredWith("wrong"), onDone)
		);

		act(() => {
			result.current.next();
			result.current.next();
		});
		act(() => vi.advanceTimersByTime(CARD_LEAVE_MS));
		expect(onDone).toHaveBeenCalledOnce();
	});

	it("keeps a live poll's card in place", () => {
		const { result } = renderHook(() => useAnswerFeedback(undefined, vi.fn()));

		act(() => vi.advanceTimersByTime(60_000));
		expect(result.current.leaving).toBe(false);
	});
});
