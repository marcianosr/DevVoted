import * as Sentry from "@sentry/react";

import {
	type ApiResponse,
	createErrorResponse,
} from "~/shared/utils/errorHandling";

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

/**
 * Runs an operation with the session's user id, reporting a failed sign-in the
 * same way a failed domain call reports: as `ApiResponse`.
 *
 * Without it a server function has two error modes — `getAuthenticatedUserId`
 * rejects while everything downstream resolves — and callers reliably handle
 * only the second. A rejected read then looks identical to "no data", which is
 * how a signed-out player used to be sent to the start-a-run screen instead of
 * being told to sign in (DVTD-cmqj).
 */
export const withAuthenticatedUser = async <T>(
	operation: (userId: string) => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> => {
	try {
		const userId = await getAuthenticatedUserId();
		return await operation(userId);
	} catch (error) {
		// getAuthenticatedUserId already reported to Sentry; don't double-count.
		return createErrorResponse(error);
	}
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
