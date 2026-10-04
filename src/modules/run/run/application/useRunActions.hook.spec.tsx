import { QueryClientProvider } from "@tanstack/react-query";

import { createTestQueryClient } from "~/test/queryClient.harness";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	abandonRun,
	dispatchRunAction,
	startRun,
} from "~/modules/run/run/application/run.serverfn";
import { submitCrowdPick } from "~/modules/run/community/application/community.serverfn";
import { createMockRunView } from "~/test/runView.factory";
import { sessionRunQueryKeys, userQueryKeys } from "~/shared/queryKeys";

import {
	type RunActionResult,
	useRunActions,
} from "~/modules/run/run/application/useRunActions.hook";

const todaysRunQueryKey = sessionRunQueryKeys.todaysRun;
const runCommunityQueryKey = sessionRunQueryKeys.todaysCommunity;

vi.mock("~/modules/run/run/application/run.serverfn", () => ({
	getTodaysRun: vi.fn(),
	startRun: vi.fn(),
	abandonRun: vi.fn(),
	dispatchRunAction: vi.fn(),
}));

vi.mock("~/modules/run/community/application/community.serverfn", () => ({
	submitCrowdPick: vi.fn(),
}));

const setup = () => {
	const queryClient = createTestQueryClient();
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

	it("sendThen commits first and only then hands the caller the new view", async () => {
		const advanced = {
			success: true as const,
			data: createMockRunView({ status: "rewarding" }),
		};
		vi.mocked(dispatchRunAction).mockResolvedValue(advanced);
		const { queryClient, result } = setup();
		const onCommitted = vi.fn(() =>
			queryClient.getQueryData(todaysRunQueryKey())
		);

		act(() => result.current.sendThen({ type: "skip-shop" }, onCommitted));

		await waitFor(() =>
			expect(onCommitted).toHaveBeenCalledWith(advanced.data)
		);
		expect(onCommitted).toHaveReturnedWith(advanced);
	});

	it("sendThen never calls back on a refused action", async () => {
		vi.mocked(dispatchRunAction).mockResolvedValue({
			success: false,
			error: "Not today",
		});
		const { result } = setup();
		const onCommitted = vi.fn();

		act(() => result.current.sendThen({ type: "skip-shop" }, onCommitted));

		await waitFor(() => expect(result.current.busy).toBe(false));
		expect(onCommitted).not.toHaveBeenCalled();
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

	it("commit stales the community board, the swatch collection and the unlock ledger", async () => {
		const { queryClient, result } = setup();
		queryClient.setQueryData(runCommunityQueryKey(), { success: true });
		queryClient.setQueryData(userQueryKeys.swatches("red"), { success: true });
		queryClient.setQueryData(userQueryKeys.unlocks("red"), { success: true });

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
			expect(
				queryClient.getQueryState(userQueryKeys.unlocks("red"))?.isInvalidated
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

	it("sendCrowdPickWith hands the room's answer to the caller without committing", async () => {
		const staged = { success: true as const, data: createMockRunView() };
		vi.mocked(submitCrowdPick).mockResolvedValue(staged);
		const { queryClient, result } = setup();
		const onResult = vi.fn();

		act(() => result.current.sendCrowdPickWith(onResult));

		await waitFor(() => expect(onResult).toHaveBeenCalledWith(staged));
		expect(vi.mocked(dispatchRunAction)).not.toHaveBeenCalled();
		expect(queryClient.getQueryData(todaysRunQueryKey())).toBeUndefined();
	});

	it("sendCrowdPickWith holds every other run press while the room answers", async () => {
		let answer: (value: RunActionResult) => void = () => {};
		vi.mocked(submitCrowdPick).mockReturnValue(
			new Promise((resolve) => {
				answer = resolve;
			})
		);
		const { result } = setup();

		act(() => result.current.sendCrowdPickWith(() => {}));

		await waitFor(() => expect(result.current.busy).toBe(true));
		act(() => answer({ success: false, error: "Not enough approvals" }));
		await waitFor(() => expect(result.current.busy).toBe(false));
	});

	it("sendCrowdPickWith hands a refusal to the caller so it can be stated", async () => {
		const refused = { success: false as const, error: "Not enough approvals" };
		vi.mocked(submitCrowdPick).mockResolvedValue(refused);
		const { result } = setup();
		const onResult = vi.fn();

		act(() => result.current.sendCrowdPickWith(onResult));

		await waitFor(() => expect(onResult).toHaveBeenCalledWith(refused));
	});

	it("start states a refused start as errorMessage", async () => {
		vi.mocked(startRun).mockResolvedValue({
			success: false,
			error: "Today's run is already over",
		});
		const { result } = setup();

		act(() => result.current.start.mutate());

		await waitFor(() =>
			expect(result.current.start.errorMessage).toBe(
				"Today's run is already over"
			)
		);
	});
});
