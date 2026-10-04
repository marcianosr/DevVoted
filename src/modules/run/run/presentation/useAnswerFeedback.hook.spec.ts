import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";

import {
	ANSWER_HOLD_MS,
	CARD_LEAVE_MS,
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

	it("sends the card away just before the next poll, keeping the hold", () => {
		const onDone = vi.fn();
		const { result } = renderHook(() =>
			useAnswerFeedback(answeredWith("correct"), onDone)
		);

		act(() => vi.advanceTimersByTime(ANSWER_HOLD_MS.right - CARD_LEAVE_MS - 1));
		expect(result.current.leaving).toBe(false);

		act(() => vi.advanceTimersByTime(1));
		expect(result.current.leaving).toBe(true);
		expect(onDone).not.toHaveBeenCalled();

		act(() => vi.advanceTimersByTime(CARD_LEAVE_MS));
		expect(onDone).toHaveBeenCalledOnce();
	});

	it("holds a wrong answer longer before the card leaves", () => {
		const { result } = renderHook(() =>
			useAnswerFeedback(answeredWith("wrong"), vi.fn())
		);

		act(() => vi.advanceTimersByTime(ANSWER_HOLD_MS.right));
		expect(result.current.leaving).toBe(false);

		act(() =>
			vi.advanceTimersByTime(ANSWER_HOLD_MS.wrong - ANSWER_HOLD_MS.right)
		);
		expect(result.current.leaving).toBe(true);
	});

	it("keeps a live poll's card in place", () => {
		const { result } = renderHook(() => useAnswerFeedback(undefined, vi.fn()));

		act(() => vi.advanceTimersByTime(ANSWER_HOLD_MS.wrong));
		expect(result.current.leaving).toBe(false);
	});
});
