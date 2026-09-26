import {
	type ApiResponse,
	createErrorResponse,
} from "~/shared/utils/errorHandling";
import { reportHandledFailure } from "~/shared/utils/errorReporting";

import { getSupabaseServerClient } from "./supabase";

export const getAuthenticatedUserId = async () => {
	const supabase = getSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		const authError = new Error("Not authenticated");
		reportHandledFailure(authError, "getAuthenticatedUserId", {
			supabaseError: error?.message,
		});
		throw authError;
	}

	return user.id;
};

export const findAuthenticatedUserId = async (): Promise<string | null> => {
	try {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.auth.getClaims();
		if (error || !data) return null;
		return data.claims.sub ?? null;
	} catch {
		return null;
	}
};

export const withAuthenticatedUser = async <T>(
	operation: (userId: string) => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> => {
	try {
		const userId = await getAuthenticatedUserId();
		return await operation(userId);
	} catch (error) {
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
		reportHandledFailure(authError, "ensureAuthorizedUser", {
			authenticatedUserId,
			requestedUserId,
		});
		throw authError;
	}
};
