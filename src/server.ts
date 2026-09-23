import "./instrument.server";

import { wrapFetchWithSentry } from "@sentry/tanstackstart-react";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import type { ServerEntry } from "@tanstack/react-start/server-entry";

/**
 * Sentry's "no --import flag" setup: the Vercel preset runs the emitted function
 * directly, so there is no launch command to hook. The cost is documented —
 * OpenTelemetry only auto-instruments native Node APIs, so there are no Postgres
 * spans. Errors and request spans, which is what this is for, are unaffected.
 */
const requestHandler: ServerEntry = wrapFetchWithSentry({
	fetch: (request: Request) => handler.fetch(request),
});

export default createServerEntry(requestHandler);
