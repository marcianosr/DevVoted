import {
	sentryGlobalFunctionMiddleware,
	sentryGlobalRequestMiddleware,
} from "@sentry/tanstackstart-react";
import { createStart } from "@tanstack/react-start";

/**
 * Gives every server function an isolated Sentry scope carrying its own request,
 * user and trace — without it the 39 failures funnelled through
 * handleApiOperation land on a shared global scope and attribute to whoever ran
 * last.
 */
export const startInstance = createStart(() => ({
	requestMiddleware: [sentryGlobalRequestMiddleware],
	functionMiddleware: [sentryGlobalFunctionMiddleware],
}));
