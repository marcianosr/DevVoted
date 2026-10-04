import {
	type AccountUser,
	findUserByEmail,
	findUserById,
	insertUser,
	touchLastSeen,
} from "~/modules/account/auth/infrastructure/user.repository";
import { reportHandledFailure } from "~/shared/utils/errorReporting";

export type User = AccountUser;

const rememberVisit = async (userId: string): Promise<void> => {
	try {
		await touchLastSeen(userId);
	} catch (error) {
		reportHandledFailure(error, "touchLastSeen", { userId });
	}
};

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
