// src/router.tsx
import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
	});

	// Browser-only: the integration instruments navigations, which the server
	// render does not have.
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
