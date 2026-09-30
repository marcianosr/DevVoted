import { eq } from "drizzle-orm";

import { db } from "~/database/db";
import { usersTable, userTitlesTable } from "~/database/schema";
import {
	findTitleById,
	type Title,
} from "~/modules/account/profile/domain/title.model";

const TESTBED_TITLE_IDS = [
	"title-maintainer-ts",
	"title-maintainer-js",
	"title-maintainer-react",
	"title-rank-poll-newbie",
	"title-it-compiles",
];

const resolveTitle = (titleId: string): Title => {
	const title = findTitleById(titleId);
	if (!title) throw new Error(`Unknown title ${titleId}`);
	return title;
};

const titleRowsFor = (userId: string) =>
	TESTBED_TITLE_IDS.map(resolveTitle).map((title) => ({
		user_id: userId,
		title_id: title.id,
		announced_at: new Date(),
	}));

const findUserIdByEmail = async (email: string): Promise<string> => {
	const [user] = await db
		.select({ id: usersTable.id })
		.from(usersTable)
		.where(eq(usersTable.email, email));

	if (!user) throw new Error(`No account with email ${email}`);
	return user.id;
};

const applyTitles = async (userId: string): Promise<void> => {
	await db
		.update(usersTable)
		.set({ equipped_title_ids: [] })
		.where(eq(usersTable.id, userId));

	await db.delete(userTitlesTable).where(eq(userTitlesTable.user_id, userId));
	await db.insert(userTitlesTable).values(titleRowsFor(userId));
};

const main = async () => {
	const email = process.argv[2];
	if (!email) throw new Error("Usage: npm run db:titles -- <email>");

	const userId = await findUserIdByEmail(email);
	await applyTitles(userId);

	console.info(
		`🏷️  Granted ${TESTBED_TITLE_IDS.length} titles to ${email}. Worn: none.`
	);
	process.exit(0);
};

void main();
