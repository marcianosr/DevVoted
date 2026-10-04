import * as Sentry from "@sentry/tanstackstart-react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const queryClient = new QueryClient();
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		context: { queryClient },
	});

	if (!router.isServer) {
		Sentry.addIntegration(
			Sentry.tanstackRouterBrowserTracingIntegration(router)
		);
	}

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
