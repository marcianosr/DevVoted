import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});

export const withQueryClient = (
	children: ReactNode,
	queryClient: QueryClient = createTestQueryClient()
) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
