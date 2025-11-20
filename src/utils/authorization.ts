import * as Sentry from "@sentry/react";

import { getSupabaseServerClient } from "./supabase";

export const getAuthenticatedUserId = async () => {
	const supabase = getSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		const authError = new Error("Not authenticated");
		Sentry.captureException(authError, {
			level: "warning",
			extra: {
				operation: "getAuthenticatedUserId",
				supabaseError: error?.message,
			},
		});
		throw authError;
	}

	return user.id;
};

export const ensureAuthorizedUser = (
	authenticatedUserId: string,
	requestedUserId: string
) => {
	if (authenticatedUserId !== requestedUserId) {
		const authError = new Error(
			"Unauthorized: Cannot access another user's data"
		);
		Sentry.captureException(authError, {
			level: "warning",
			extra: {
				operation: "ensureAuthorizedUser",
				authenticatedUserId,
				requestedUserId,
			},
		});
		throw authError;
	}
};
