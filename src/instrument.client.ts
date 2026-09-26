import * as Sentry from "@sentry/tanstackstart-react";

declare const __COMMIT_SHA__: string;
declare const __DEPLOY_ENVIRONMENT__: string;

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
	Sentry.init({
		dsn,
		environment: __DEPLOY_ENVIRONMENT__,
		release: __COMMIT_SHA__,
		tracesSampleRate: 0.1,
		sendDefaultPii: false,
	});
}
