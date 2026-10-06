import * as Sentry from "@sentry/tanstackstart-react";

export const reportApiFailure = (error: unknown, operation: string): void => {
	Sentry.captureException(error, {
		level: "error",
		tags: { operation },
		fingerprint: ["api-operation", operation],
	});
};

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

type RecoverableErrorInfo = { componentStack?: string };

export const reportRecoverableReactError = (
	error: unknown,
	errorInfo: RecoverableErrorInfo
): void => {
	console.error(error);
	Sentry.captureException(error, {
		level: "error",
		tags: { operation: "react.recoverable" },
		contexts: { react: { componentStack: errorInfo.componentStack } },
	});
};

export const identifyUser = (userId: string): void => {
	Sentry.setUser({ id: userId });
};
