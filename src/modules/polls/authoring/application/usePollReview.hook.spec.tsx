import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { markPollReviewed } from "~/modules/polls/authoring/application/authoring.serverfn";
import { usePollReview } from "~/modules/polls/authoring/application/usePollReview.hook";
import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";
import { pollQueryKeys } from "~/shared/queryKeys";
import { createTestQueryClient } from "~/test/queryClient.harness";

vi.mock("~/modules/polls/authoring/application/authoring.serverfn", () => ({
	markPollReviewed: vi.fn(),
}));

const setup = () => {
	const queryClient = createTestQueryClient();
	queryClient.setQueryData(pollQueryKeys.authored(), { success: true });
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	const { result } = renderHook(() => usePollReview(74), { wrapper });
	return { queryClient, result };
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("usePollReview", () => {
	it("marks the poll reviewed and stales the poll lists", async () => {
		vi.mocked(markPollReviewed).mockResolvedValue({
			success: true,
			data: createMockPoll({ id: 74, reviewedAt: new Date() }),
		});
		const { queryClient, result } = setup();

		act(() => result.current.review());

		await waitFor(() =>
			expect(
				queryClient.getQueryState(pollQueryKeys.authored())?.isInvalidated
			).toBe(true)
		);
		expect(markPollReviewed).toHaveBeenCalledWith({ data: { id: 74 } });
	});

	it("leaves the lists alone when the mark is refused", async () => {
		vi.mocked(markPollReviewed).mockResolvedValue({
			success: false,
			error: "Admin access required",
		});
		const { queryClient, result } = setup();

		act(() => result.current.review());

		await waitFor(() => expect(result.current.reviewing).toBe(false));
		expect(
			queryClient.getQueryState(pollQueryKeys.authored())?.isInvalidated
		).toBe(false);
	});
});
