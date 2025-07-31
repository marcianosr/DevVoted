import { db } from "~/database/db";
import { usersTable } from "~/database/schema";
import { eq } from "drizzle-orm";

export interface UserSyncData {
	id: string;
	email: string;
	displayName?: string;
	photoUrl?: string;
}

export const ensureUserExists = async (userData: UserSyncData) => {
	const { id, email, displayName, photoUrl } = userData;

	const [existingUser] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, id))
		.limit(1);

	if (existingUser) {
		return {
			id: existingUser.id,
			email: existingUser.email,
			displayName: existingUser.display_name,
			photoUrl: existingUser.photo_url,
		};
	}

	const newUser = {
		id,
		display_name: displayName || email.split("@")[0],
		email,
		photo_url: photoUrl || null,
		role: "user" as const,
	};

	const [createdUser] = await db
		.insert(usersTable)
		.values(newUser)
		.returning();

	return {
		id: createdUser.id,
		email: createdUser.email,
		displayName: createdUser.display_name,
		photoUrl: createdUser.photo_url,
	};
};