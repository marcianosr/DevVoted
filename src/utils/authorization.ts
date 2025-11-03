import { getSupabaseServerClient } from "./supabase";

export const getAuthenticatedUserId = async () => {
	const supabase = getSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		throw new Error("Not authenticated");
	}

	return user.id;
};

export const ensureAuthorizedUser = (
	authenticatedUserId: string,
	requestedUserId: string
) => {
	if (authenticatedUserId !== requestedUserId) {
		throw new Error("Unauthorized: Cannot access another user's data");
	}
};
