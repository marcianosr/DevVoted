import { QueryClientProvider } from "@tanstack/react-query";

import { createTestQueryClient } from "~/test/queryClient.harness";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useApiMutation } from "~/shared/hooks/useApiMutation.hook";
import type { ApiResponse } from "~/shared/utils/errorHandling";

type Badge = { readonly gym: string };

const BOULDER: Badge = { gym: "Pewter" };

const renderApiMutation = (mutationFn: () => Promise<ApiResponse<Badge>>) => {
	const queryClient = createTestQueryClient();
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	return renderHook(() => useApiMutation<Badge>({ mutationFn }), { wrapper });
};

describe("useApiMutation", () => {
	it("reports no error before the press and after a success", async () => {
		const { result } = renderApiMutation(async () => ({
			success: true,
			data: BOULDER,
		}));
		expect(result.current.errorMessage).toBeNull();

		act(() => result.current.mutate());

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.errorMessage).toBeNull();
	});

	it("reports a handled refusal as errorMessage", async () => {
		const { result } = renderApiMutation(async () => ({
			success: false,
			error: "Gym closed",
		}));

		act(() => result.current.mutate());

		await waitFor(() => expect(result.current.errorMessage).toBe("Gym closed"));
	});

	it("reports a rejected mutation as errorMessage too", async () => {
		const { result } = renderApiMutation(async () => {
			throw new Error("Route 3 is flooded");
		});

		act(() => result.current.mutate());

		await waitFor(() =>
			expect(result.current.errorMessage).toBe("Route 3 is flooded")
		);
	});
});
