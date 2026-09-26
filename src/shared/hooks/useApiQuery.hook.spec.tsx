import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import type { ApiResponse } from "~/shared/utils/errorHandling";

type Board = { readonly trainer: string };

const BROCK: Board = { trainer: "Brock" };

const renderApiQuery = (queryFn: () => Promise<ApiResponse<Board>>) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	return renderHook(
		() => useApiQuery<Board>({ queryKey: ["pewter-gym"], queryFn }),
		{ wrapper }
	);
};

describe("useApiQuery", () => {
	it("unwraps a successful response into view", async () => {
		const { result } = renderApiQuery(async () => ({
			success: true,
			data: BROCK,
		}));

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(result.current.view).toEqual(BROCK);
		expect(result.current.errorMessage).toBeNull();
	});

	it("reports a handled failure as errorMessage and leaves view null", async () => {
		const { result } = renderApiQuery(async () => ({
			success: false,
			error: "Gym closed",
		}));

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(result.current.view).toBeNull();
		expect(result.current.errorMessage).toBe("Gym closed");
	});

	it("reports a rejected query as errorMessage, so a failure is not read as empty", async () => {
		const { result } = renderApiQuery(async () => {
			throw new Error("Network down");
		});

		await waitFor(() =>
			expect(result.current.errorMessage).toBe("Network down")
		);
		expect(result.current.view).toBeNull();
	});

	it("is pending with no view and no error before the response lands", () => {
		const { result } = renderApiQuery(
			() => new Promise<ApiResponse<Board>>(() => {})
		);

		expect(result.current.isPending).toBe(true);
		expect(result.current.view).toBeNull();
		expect(result.current.errorMessage).toBeNull();
	});
});
