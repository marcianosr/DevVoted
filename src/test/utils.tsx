import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	RouterProvider,
	createRouter,
	createMemoryHistory,
} from "@tanstack/react-router";

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, "queries"> {
	route?: string;
	routerOptions?: {
		initialEntries?: string[];
		initialIndex?: number;
	};
}

/**
 * Custom render function that wraps components with necessary providers
 * @param ui - The React component to render
 * @param options - Custom render options including route and router options
 */
export function renderWithProviders(
	ui: ReactElement,
	{
		route = "/",
		routerOptions = { initialEntries: ["/"] },
		...renderOptions
	}: CustomRenderOptions = {}
) {
	// Create a fresh QueryClient for each test
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

/**
 * Creates a router provider for testing components that use router hooks
 * @param routeTree - The route tree configuration
 * @param options - Router options
 */
export function createTestRouter(
	routeTree: any,
	options: { initialEntries?: string[]; initialIndex?: number } = {}
) {
	const memoryHistory = createMemoryHistory({
		initialEntries: options.initialEntries || ["/"],
		initialIndex: options.initialIndex || 0,
	});

	const router = createRouter({
		routeTree,
		history: memoryHistory,
	});

	return <RouterProvider router={router} />;
}

// Re-export everything from testing-library
export * from "@testing-library/react";
