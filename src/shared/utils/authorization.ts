import { isAdminEmail } from "~/shared/utils/adminAuth";
import {
	type ApiResponse,
	createErrorResponse,
	createSuccessResponse,
} from "~/shared/utils/errorHandling";
import { reportHandledFailure } from "~/shared/utils/errorReporting";
import { getSupabaseServerClient } from "~/shared/utils/supabase";

export type Session = {
	readonly userId: string;
	readonly isAdmin: boolean;
};

export const NOT_AUTHENTICATED = "Not authenticated";
export const ADMIN_REQUIRED = "Admin access required";

const readSession = async (): Promise<ApiResponse<Session>> => {
	const supabase = getSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		const authError = new Error(NOT_AUTHENTICATED);
		reportHandledFailure(authError, "readSession", {
			supabaseError: error?.message,
		});
		return createErrorResponse(authError);
	}

	return createSuccessResponse({
		userId: user.id,
		isAdmin: isAdminEmail(user.email),
	});
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

const runAs = async <T>(
	session: Session,
	operation: (session: Session) => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> => {
	try {
		return await operation(session);
	} catch (error) {
		reportHandledFailure(error, "withAuthenticatedUser");
		return createErrorResponse(error);
	}
};

export const withAuthenticatedUser = async <T>(
	operation: (session: Session) => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> => {
	const session = await readSession();
	return session.success ? runAs(session.data, operation) : session;
};

export const withAdminUser = async <T>(
	operation: (session: Session) => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> =>
	withAuthenticatedUser(async (session) =>
		session.isAdmin
			? operation(session)
			: createErrorResponse(new Error(ADMIN_REQUIRED))
	);
