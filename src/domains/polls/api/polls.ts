import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { ADMIN_EMAILS } from "~/utils/adminAuth";
import { getAuthenticatedUserId } from "~/utils/authorization";
import { getSupabaseServerClient } from "~/utils/supabase";

import {
	getAllPollsHandler,
	getPollByIdHandler,
	getPollByIdWithOptionsHandler,
	getPollsByUserHandler,
	getDailyPollHandler,
	postPollOptionsHandler,
	getPollsSeenInRunHandler,
	getRunPollHistoryHandler,
	createPollWithOptionsHandler,
	updatePollHandler,
} from "./handlers";

export const getPollByIdWithOptions = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			id: z.number().int().positive(),
		})
	)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { data: authData, error } = await supabase.auth.getUser();

		if (error || !authData.user) {
			throw new Error("Authentication required");
		}

		const userId = authData.user.id;
		const isAdmin = ADMIN_EMAILS.includes(
			authData.user.email as (typeof ADMIN_EMAILS)[number]
		);

		const result = await getPollByIdWithOptionsHandler({
			data: { ...data, userId },
		});

		if (!result.success) {
			return result;
		}

		// Check ownership: only creator or admin can view
		const isCreator = result.data.poll.createdBy === userId;
		if (!isAdmin && !isCreator) {
			return { success: false as const, error: "Access denied" };
		}

		return { ...result, isAdmin };
	});

export const getPollById = createServerFn()
	.inputValidator(z.object({ id: z.number().int().positive() }))
	.handler(async ({ data }) => getPollByIdHandler({ data }));

export const getAllPolls = createServerFn().handler(async () =>
	getAllPollsHandler()
);

export const getUserPollsOrAll = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.auth.getUser();

		if (error || !data.user) {
			throw new Error("Authentication required");
		}

		const isAdmin = ADMIN_EMAILS.includes(
			data.user.email as (typeof ADMIN_EMAILS)[number]
		);

		if (isAdmin) {
			return { ...(await getAllPollsHandler()), isAdmin: true };
		}

		return {
			...(await getPollsByUserHandler({ data: { userId: data.user.id } })),
			isAdmin: false,
		};
	}
);

export const getDailyPoll = createServerFn({ method: "GET" })
	.inputValidator(z.object({ runId: z.number().int().positive().optional() }))
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return getDailyPollHandler({ data: { userId, runId: data?.runId } });
	});

export const postPollOptions = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			pollId: z.number().int().positive(),
			selectedOptions: z.array(z.string()).min(1),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		// TODO: remove score calc here (only post) get score breakdown here instead of getting it from the POST IF needed?

		return postPollOptionsHandler({
			data: { ...data, userId },
		});
	});

export const getPollsSeenInRun = createServerFn({ method: "GET" })
	.inputValidator(z.object({ runId: z.number().int().positive() }))
	.handler(async ({ data }) => {
		return getPollsSeenInRunHandler({ data: { runId: data.runId } });
	});

export const getRunPollHistoryServerFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ runId: z.number().int().positive() }))
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return getRunPollHistoryHandler({ data: { userId, runId: data.runId } });
	});

// ============================================
// Poll CRUD Server Functions (Admin Only)
// ============================================

const ensureAdminAccess = async () => {
	const supabase = getSupabaseServerClient();
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user?.email) {
		throw new Error("Authentication required");
	}

	if (
		!ADMIN_EMAILS.includes(data.user.email as (typeof ADMIN_EMAILS)[number])
	) {
		throw new Error("Admin access required");
	}

	return data.user.id;
};

// Schema for create poll input
const createPollInputSchema = z.object({
	poll: z.object({
		question: z.string().min(10).max(2000),
		status: z.enum(["draft", "open", "closed", "archived"]),
		answerType: z.enum(["single", "multiple"]),
		categoryCode: z.string().min(1),
		codeBlock: z.string().nullable().optional(),
		codeSandboxExample: z.string().nullable().optional(),
	}),
	options: z.array(
		z.object({
			option: z.string().min(1).max(500),
			correct: z.boolean(),
		})
	),
});

export const createPollServerFn = createServerFn({ method: "POST" })
	.inputValidator(createPollInputSchema)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		// All user-created polls start as draft
		return createPollWithOptionsHandler({
			data: {
				...data,
				poll: { ...data.poll, status: "draft" },
				createdBy: userId,
			},
		});
	});

// Schema for update poll input
const updatePollInputSchema = z.object({
	id: z.number().int().positive(),
	poll: z.object({
		question: z.string().min(10).max(2000).optional(),
		status: z.enum(["draft", "open", "closed", "archived"]).optional(),
		answerType: z.enum(["single", "multiple"]).optional(),
		openingTime: z.coerce.date().optional(),
		closingTime: z.coerce.date().optional(),
		categoryCode: z.string().min(1).optional(),
		codeBlock: z.string().nullable().optional(),
		codeSandboxExample: z.string().nullable().optional(),
	}),
	options: z.array(
		z.object({
			option: z.string().min(1).max(500),
			correct: z.boolean(),
		})
	),
});

export const updatePollServerFn = createServerFn({ method: "POST" })
	.inputValidator(updatePollInputSchema)
	.handler(async ({ data }) => {
		await ensureAdminAccess();
		return updatePollHandler({ data });
	});
