import * as Sentry from "@sentry/react";

import {
	type AccountUser,
	findUserByEmail,
	findUserById,
	insertUser,
} from "~/modules/account/auth/infrastructure/user.repository";

export type User = AccountUser;

/**
 * First sight of a Supabase identity in our own tables. The insert can lose a
 * race against a concurrent sign-in with the same email, so a failure is
 * retried as a lookup rather than surfaced: by then the other request has
 * created the row we wanted.
 */
export const ensureUserExists = async (
	userData: User
): Promise<AccountUser> => {
	const existing = await findUserById(userData.id);
	if (existing) return existing;

	try {
		return await insertUser(userData);
	} catch (error) {
		Sentry.captureException(error, {
			level: "warning",
			extra: { userId: userData.id, email: userData.email },
		});

		const byEmail = await findUserByEmail(userData.email);
		if (byEmail) return byEmail;

		throw error;
	}
};
