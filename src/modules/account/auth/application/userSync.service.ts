import {
	type AccountUser,
	findUserByEmail,
	findUserById,
	insertUser,
	touchLastSeen,
} from "~/modules/account/auth/infrastructure/user.repository";
import { reportHandledFailure } from "~/shared/utils/errorReporting";

export type User = AccountUser;

/**
 * Bookkeeping must never sign the player out: `fetchUser` turns any throw from
 * here into a null user, which the router reads as "logged out".
 */
const rememberVisit = async (userId: string): Promise<void> => {
	try {
		await touchLastSeen(userId);
	} catch (error) {
		reportHandledFailure(error, "touchLastSeen", { userId });
	}
};

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
	if (existing) {
		await rememberVisit(existing.id);
		return existing;
	}

	try {
		return await insertUser(userData);
	} catch (error) {
		reportHandledFailure(error, "ensureUserExists.insert", {
			userId: userData.id,
		});

		const byEmail = await findUserByEmail(userData.email);
		if (byEmail) return byEmail;

		throw error;
	}
};
