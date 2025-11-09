import { db } from "~/database/db";
import { usersTable } from "~/database/schema";
import { eq } from "drizzle-orm";
import * as Sentry from "@sentry/react";

export type User = {
	id: string;
	email: string;
	displayName?: string;
	photoUrl?: string | null;
};

export const ensureUserExists = async (userData: User) => {
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

	try {
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
	} catch (error) {
		Sentry.captureException(error, {
			level: "warning",
			extra: { userId: id, email },
		});

		const [existingUserByEmail] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, email))
			.limit(1);

		if (existingUserByEmail) {
			return {
				id: existingUserByEmail.id,
				email: existingUserByEmail.email,
				displayName: existingUserByEmail.display_name,
				photoUrl: existingUserByEmail.photo_url,
			};
		}

		throw error;
	}
};
