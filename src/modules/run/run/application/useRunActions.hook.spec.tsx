import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	abandonRun,
	dispatchRunAction,
	startRun,
} from "~/modules/run/run/application/run.serverfn";
import { createMockRunView } from "~/test/runView.factory";
import { userQueryKeys } from "~/shared/queryKeys";

import { runCommunityQueryKey } from "~/modules/run/community/application/useRunCommunity.hook";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { todaysRunQueryKey } from "~/modules/run/run/application/useTodaysRun.hook";

vi.mock("~/modules/run/run/application/run.serverfn", () => ({
	getTodaysRun: vi.fn(),
	startRun: vi.fn(),
	abandonRun: vi.fn(),
	dispatchRunAction: vi.fn(),
}));

const setup = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	const { result } = renderHook(() => useRunActions(), { wrapper });
	return { queryClient, result };
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("useRunActions", () => {
	it("send commits the returned view to today's cache", async () => {
		const advanced = {
			success: true as const,
			data: createMockRunView({ status: "rewarding" }),
		};
		vi.mocked(dispatchRunAction).mockResolvedValue(advanced);
		const { queryClient, result } = setup();

		act(() => result.current.send({ type: "finish-reward" }));

		await waitFor(() =>
			expect(queryClient.getQueryData(todaysRunQueryKey())).toEqual(advanced)
		);
	});

	it("send leaves the cache untouched when the action fails", async () => {
		vi.mocked(dispatchRunAction).mockResolvedValue({
			success: false,
			error: "Not today",
		});
		const { queryClient, result } = setup();

		act(() => result.current.send({ type: "finish-reward" }));

		await waitFor(() => expect(result.current.busy).toBe(false));
		expect(queryClient.getQueryData(todaysRunQueryKey())).toBeUndefined();
	});

	it("sendWith hands the result to the caller without committing", async () => {
		const staged = { success: true as const, data: createMockRunView() };
		vi.mocked(dispatchRunAction).mockResolvedValue(staged);
		const { queryClient, result } = setup();
		const onResult = vi.fn();

		act(() =>
			result.current.sendWith(
				{ type: "answer", optionIds: ["option-1"] },
				onResult
			)
		);

		await waitFor(() => expect(onResult).toHaveBeenCalledWith(staged));
		expect(queryClient.getQueryData(todaysRunQueryKey())).toBeUndefined();
	});

	it("commit writes a staged result into today's cache", () => {
		const staged = { success: true as const, data: createMockRunView() };
		const { queryClient, result } = setup();

		act(() => result.current.commit(staged));

		expect(queryClient.getQueryData(todaysRunQueryKey())).toEqual(staged);
	});

	it("start commits the fresh run", async () => {
		const fresh = {
			success: true as const,
			data: createMockRunView({ status: "configuring" }),
		};
		vi.mocked(startRun).mockResolvedValue(fresh);
		const { queryClient, result } = setup();

		act(() => result.current.start.mutate());

		await waitFor(() =>
			expect(queryClient.getQueryData(todaysRunQueryKey())).toEqual(fresh)
		);
	});

	// DVTD-63ur: both caches used to sit unwritten and unread until their screen
	// happened to remount, which only worked because the root client leaves
	// staleTime at 0. A global staleTime would have frozen them silently.
	it("commit stales the community board and the swatch collection", async () => {
		const { queryClient, result } = setup();
		queryClient.setQueryData(runCommunityQueryKey(), { success: true });
		queryClient.setQueryData(userQueryKeys.swatches("red"), { success: true });

		act(() =>
			result.current.commit({
				success: true,
				data: createMockRunView({ status: "rewarding" }),
			})
		);

		await waitFor(() => {
			expect(
				queryClient.getQueryState(runCommunityQueryKey())?.isInvalidated
			).toBe(true);
			expect(
				queryClient.getQueryState(userQueryKeys.swatches("red"))?.isInvalidated
			).toBe(true);
		});
	});

	it("abandon invalidates today's run so it refetches", async () => {
		vi.mocked(abandonRun).mockResolvedValue({
			success: true,
			data: { abandoned: true },
		});
		const { queryClient, result } = setup();
		queryClient.setQueryData(todaysRunQueryKey(), {
			success: true,
			data: createMockRunView(),
		});

		act(() => result.current.abandon.mutate());

		await waitFor(() =>
			expect(
				queryClient.getQueryState(todaysRunQueryKey())?.isInvalidated
			).toBe(true)
		);
	});
});
