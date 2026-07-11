import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { POLL_STATUSES } from "~/domains/polls/models/poll.model";
import { ADMIN_EMAILS } from "~/utils/adminAuth";
import { getAuthenticatedUserId } from "~/utils/authorization";
import { getSupabaseServerClient } from "~/utils/supabase";

import {
	getAllPollsHandler,
	getPollByIdHandler,
	getPollByIdWithOptionsHandler,
	getPollsByUserHandler,
	getPollCreatorsHandler,
} from "./poll.handlers";
import {
	getDailyPollHandler,
	postPollOptionsHandler,
	getPollsSeenInRunHandler,
	getRunPollHistoryHandler,
} from "./dailyPoll.handlers";
import {
	createPollWithOptionsHandler,
	updatePollHandler,
} from "./admin.handlers";

export const getPollByIdWithOptions = createServerFn({ method: "GET" })
	.validator(
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
	.validator(z.object({ id: z.number().int().positive() }))
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

export const getPollCreators = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.auth.getUser();

		if (error || !data.user) {
			throw new Error("Authentication required");
		}

		return getPollCreatorsHandler();
	}
);

export const getDailyPoll = createServerFn({ method: "GET" })
	.validator(
		z.object({
			runId: z.number().int().positive().optional(),
			date: z.string().optional(),
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

		const result = await getDailyPollHandler({
			data: { userId, runId: data?.runId, date: data?.date },
		});

		return { ...result, isAdmin };
	});

export const postPollOptions = createServerFn({ method: "POST" })
	.validator(
		z.object({
			pollId: z.number().int().positive(),
			selectedOptions: z.array(z.string()).min(1),
			armedTryCatch: z.boolean().optional(),
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
	.validator(z.object({ runId: z.number().int().positive() }))
	.handler(async ({ data }) => {
		return getPollsSeenInRunHandler({ data: { runId: data.runId } });
	});

export const getRunPollHistoryServerFn = createServerFn({ method: "GET" })
	.validator(z.object({ runId: z.number().int().positive() }))
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
		status: z.enum(POLL_STATUSES),
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
	.validator(createPollInputSchema)
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
		status: z.enum(POLL_STATUSES).optional(),
		answerType: z.enum(["single", "multiple"]).optional(),
		openingTime: z.coerce.date().optional(),
		closingTime: z.coerce.date().optional(),
		categoryCode: z.string().min(1).optional(),
		codeBlock: z.string().nullable().optional(),
		codeSandboxExample: z.string().nullable().optional(),
		explanation: z.string().max(2000).nullable().optional(),
	}),
	options: z.array(
		z.object({
			id: z.number().int().positive().optional(),
			option: z.string().min(1).max(500),
			correct: z.boolean(),
		})
	),
});

export const updatePollServerFn = createServerFn({ method: "POST" })
	.validator(updatePollInputSchema)
	.handler(async ({ data }) => {
		await ensureAdminAccess();
		return updatePollHandler({ data });
	});
