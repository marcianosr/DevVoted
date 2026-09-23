import * as Sentry from "@sentry/tanstackstart-react";

declare const __COMMIT_SHA__: string;
declare const __DEPLOY_ENVIRONMENT__: string;

// Keyed on the DSN, not on PROD: a preview deploy is a build we want errors
// from, and initialising without a DSN leaves a live SDK that swallows every
// event and reports nothing.
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
