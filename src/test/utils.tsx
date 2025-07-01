import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface CustomRenderOptions extends Omit<RenderOptions, "queries"> {
	route?: string;
	routerOptions?: {
		initialEntries?: string[];
		initialIndex?: number;
	};
}

export function renderWithProviders(
	ui: ReactElement,
	{
		route = "/",
		routerOptions = { initialEntries: ["/"] },
		...renderOptions
	}: CustomRenderOptions = {}
) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		);
	}

	return {
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
		queryClient,
	};
}
// Re-export everything from testing-library
export * from "@testing-library/react";
