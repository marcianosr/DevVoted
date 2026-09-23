import * as Sentry from "@sentry/tanstackstart-react";

/**
 * A failed API operation. `operation` is a tag and the fingerprint's only
 * variable, so one broken service is one issue however its message varies —
 * Sentry's default message grouping files "Poll 12 not found" and
 * "Poll 13 not found" as two.
 */
export const reportApiFailure = (error: unknown, operation: string): void => {
	Sentry.captureException(error, {
		level: "error",
		tags: { operation },
		fingerprint: ["api-operation", operation],
	});
};

/** A failure the caller has already recovered from: reported, never paged on. */
export const reportHandledFailure = (
	error: unknown,
	operation: string,
	context?: Record<string, unknown>
): void => {
	Sentry.captureException(error, {
		level: "warning",
		tags: { operation },
		fingerprint: ["handled", operation],
		...(context && { extra: context }),
	});
};

/**
 * Who the events on this request's scope belong to. Only the id: PII is off
 * precisely so a Supabase session cookie never rides along with a stack trace.
 */
export const identifyUser = (userId: string): void => {
	Sentry.setUser({ id: userId });
};
