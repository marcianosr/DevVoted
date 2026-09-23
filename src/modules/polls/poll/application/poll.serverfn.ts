import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	getAllPollsService,
	getPollByIdWithOptionsService,
	getPollCreatorsService,
	getPollsByUserService,
} from "~/modules/polls/poll/application/poll.service";
import { isAdminEmail } from "~/shared/utils/adminAuth";
import { getSupabaseServerClient } from "~/shared/utils/supabase";

/** The signed-in account, or a thrown error — every poll read below needs one. */
const requireUser = async () => {
	const supabase = getSupabaseServerClient();
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user) {
		throw new Error("Authentication required");
	}

	return { id: data.user.id, isAdmin: isAdminEmail(data.user.email) };
};

export const getPollByIdWithOptions = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.number().int().positive() }))
	.handler(async ({ data }) => {
		const user = await requireUser();
		const result = await getPollByIdWithOptionsService({
			id: data.id,
			userId: user.id,
		});

		if (!result.success) {
			return result;
		}

		// A draft poll is visible to its author and to admins, nobody else.
		if (!user.isAdmin && result.data.poll.createdBy !== user.id) {
			return { success: false as const, error: "Access denied" };
		}

		return { ...result, isAdmin: user.isAdmin };
	});

export const getAllPolls = createServerFn().handler(async () =>
	getAllPollsService()
);

export const getUserPollsOrAll = createServerFn({ method: "GET" }).handler(
	async () => {
		const user = await requireUser();

		if (user.isAdmin) {
			return { ...(await getAllPollsService()), isAdmin: true };
		}

		return { ...(await getPollsByUserService(user.id)), isAdmin: false };
	}
);

export const getPollCreators = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireUser();
		return getPollCreatorsService();
	}
);
