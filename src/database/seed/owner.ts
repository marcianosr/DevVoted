import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/database/db";
import { usersTable } from "~/database/schema";
import { insertUser } from "~/modules/account/auth/infrastructure/user.repository";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

export const SEED_OWNER_HANDLE = "marciano_schildmeijer";

const SEED_OWNER_SWATCH_IDS = [
	"swatch-pallet",
	"swatch-boulder",
	"swatch-cascade",
	"swatch-thunder",
	"swatch-lavender",
	"swatch-seafoam",
	"swatch-volcano",
	"swatch-elite",
] as const;

const authUserSchema = z.object({
	id: z.string(),
	email: z.string(),
	raw_user_meta_data: z
		.object({
			display_name: z.string().optional(),
			full_name: z.string().optional(),
			avatar_url: z.string().optional(),
		})
		.nullable(),
});

type SeedOwner = { readonly id: string; readonly displayName: string };

const isKnownSwatchId = (swatchId: string): boolean =>
	ALL_SWATCHES.some((swatch) => swatch.id === swatchId);

const findOwnerAuthUser = async (handle: string) => {
	const rows = await db.execute(sql`
		select id::text, email, raw_user_meta_data
		from auth.users
		where ${handle} in (
			raw_user_meta_data->>'user_name',
			raw_user_meta_data->>'display_name',
			raw_user_meta_data->>'full_name',
			split_part(email, '@', 1)
		)
		limit 1
	`);
	return z.array(authUserSchema).parse(rows)[0];
};

export const seedOwner = async (): Promise<SeedOwner | null> => {
	const unknown = SEED_OWNER_SWATCH_IDS.filter((id) => !isKnownSwatchId(id));
	if (unknown.length > 0) {
		throw new Error(`Seed names unknown swatches ${unknown.join(", ")}`);
	}

	const authUser = await findOwnerAuthUser(SEED_OWNER_HANDLE);
	if (!authUser) return null;

	const meta = authUser.raw_user_meta_data;
	const owner = await insertUser({
		id: authUser.id,
		email: authUser.email,
		displayName: meta?.display_name || meta?.full_name,
		photoUrl: meta?.avatar_url,
	});

	await db
		.update(usersTable)
		.set({ owned_swatch_ids: [...SEED_OWNER_SWATCH_IDS] })
		.where(eq(usersTable.id, owner.id));

	return { id: owner.id, displayName: owner.displayName ?? owner.email };
};
