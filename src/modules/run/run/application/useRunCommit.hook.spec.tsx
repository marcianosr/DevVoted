import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { createMockRunView } from "~/test/runView.factory";
import { createTestQueryClient } from "~/test/queryClient.harness";
import {
	archiveQueryKeys,
	pollQueryKeys,
	sessionRunQueryKeys,
	titleQueryKeys,
	userQueryKeys,
} from "~/shared/queryKeys";
import { QueryClientProvider } from "@tanstack/react-query";

import { useRunCommit } from "~/modules/run/run/application/useRunCommit.hook";

const RED = "red-from-pallet-town";

const setup = () => {
	const queryClient = createTestQueryClient();
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	const { result } = renderHook(() => useRunCommit(), { wrapper });
	return { queryClient, result };
};

const SIDE_VIEWS = [
	sessionRunQueryKeys.todaysCommunity(),
	sessionRunQueryKeys.todaysAttackTargets(),
	sessionRunQueryKeys.todaysIncidents(),
	sessionRunQueryKeys.runNumber(),
	userQueryKeys.swatches(RED),
	userQueryKeys.card(RED),
	titleQueryKeys.announcement(RED),
	archiveQueryKeys.state(RED),
	pollQueryKeys.polldex(RED),
];

describe("useRunCommit", () => {
	it("commit writes the returned view into today's cache", () => {
		const { queryClient, result } = setup();
		const advanced = { success: true as const, data: createMockRunView() };

		act(() => result.current.commit(advanced));

		expect(queryClient.getQueryData(sessionRunQueryKeys.todaysRun())).toEqual(
			advanced
		);
	});

	it("commit stales every view a run action can move", () => {
		const { queryClient, result } = setup();
		for (const queryKey of SIDE_VIEWS)
			queryClient.setQueryData(queryKey, { success: true });

		act(() =>
			result.current.commit({ success: true, data: createMockRunView() })
		);

		for (const queryKey of SIDE_VIEWS)
			expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
	});

	it("refresh stales today's run as well, so it refetches", () => {
		const { queryClient, result } = setup();
		queryClient.setQueryData(sessionRunQueryKeys.todaysRun(), {
			success: true,
			data: createMockRunView(),
		});

		act(() => result.current.refresh());

		expect(
			queryClient.getQueryState(sessionRunQueryKeys.todaysRun())?.isInvalidated
		).toBe(true);
	});

	it("hands back the same commit across renders, so an unmount effect holds one", () => {
		const queryClient = createTestQueryClient();
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result, rerender } = renderHook(() => useRunCommit(), { wrapper });
		const first = result.current.commit;

		rerender();

		expect(result.current.commit).toBe(first);
	});
});
