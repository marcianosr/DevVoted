import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	createPoll,
	updatePoll,
} from "~/modules/polls/authoring/application/authoring.serverfn";
import type { PollFormData } from "~/modules/polls/authoring/application/pollForm.viewmodel";
import { usePollAuthoring } from "~/modules/polls/authoring/application/usePollAuthoring.hook";
import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";
import { pollQueryKeys } from "~/shared/queryKeys";
import { createTestQueryClient } from "~/test/queryClient.harness";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => navigate,
}));

vi.mock("~/modules/polls/authoring/application/authoring.serverfn", () => ({
	createPoll: vi.fn(),
	updatePoll: vi.fn(),
}));

const FORM: PollFormData = {
	poll: {
		question: "Which town is Brock's gym in?",
		status: "draft",
		answerType: "single",
		categoryCode: "js",
		codeSandboxExample: null,
		explanation: null,
	},
	options: [
		{ option: "Pewter City", correct: true },
		{ option: "Cerulean City", correct: false },
		{ option: "Vermilion City", correct: false },
	],
};

const setup = (pollId?: number) => {
	const queryClient = createTestQueryClient();
	queryClient.setQueryData(pollQueryKeys.authored(), { success: true });
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	const { result } = renderHook(() => usePollAuthoring(pollId), { wrapper });
	return { queryClient, result };
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("usePollAuthoring", () => {
	it("suggests a new poll, stales the poll lists and opens the new poll", async () => {
		vi.mocked(createPoll).mockResolvedValue({
			success: true,
			data: createMockPoll({ id: 151 }),
		});
		const { queryClient, result } = setup();

		act(() => result.current.submit(FORM));

		await waitFor(() =>
			expect(navigate).toHaveBeenCalledWith({
				to: "/polls/$pollId",
				params: { pollId: "151" },
			})
		);
		expect(createPoll).toHaveBeenCalledWith({ data: FORM });
		expect(updatePoll).not.toHaveBeenCalled();
		expect(
			queryClient.getQueryState(pollQueryKeys.authored())?.isInvalidated
		).toBe(true);
	});

	it("edits the poll it was given and returns to it", async () => {
		vi.mocked(updatePoll).mockResolvedValue({
			success: true,
			data: createMockPoll({ id: 74 }),
		});
		const { result } = setup(74);

		act(() => result.current.submit(FORM));

		await waitFor(() =>
			expect(navigate).toHaveBeenCalledWith({
				to: "/polls/$pollId",
				params: { pollId: "74" },
			})
		);
		expect(updatePoll).toHaveBeenCalledWith({ data: { id: 74, ...FORM } });
		expect(createPoll).not.toHaveBeenCalled();
	});

	it("states a refused save and stays on the form", async () => {
		vi.mocked(updatePoll).mockResolvedValue({
			success: false,
			error: "Admin access required",
		});
		const { result } = setup(74);

		act(() => result.current.submit(FORM));

		await waitFor(() =>
			expect(result.current.error).toBe("Admin access required")
		);
		expect(result.current.submitting).toBe(false);
		expect(navigate).not.toHaveBeenCalled();
	});
});
