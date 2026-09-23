import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	createPollService,
	updatePollService,
} from "~/modules/polls/authoring/application/authoring.service";
import { POLL_STATUSES } from "~/modules/polls/poll/domain/poll.model";
import { isAdminEmail } from "~/shared/utils/adminAuth";
import { getAuthenticatedUserId } from "~/shared/utils/authorization";
import { getSupabaseServerClient } from "~/shared/utils/supabase";

const ensureAdminAccess = async () => {
	const supabase = getSupabaseServerClient();
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user?.email) {
		throw new Error("Authentication required");
	}

	if (!isAdminEmail(data.user.email)) {
		throw new Error("Admin access required");
	}

	return data.user.id;
};

/** Whether the signed-in account may edit any poll — the edit screen's gate. */
export const hasPollAdminAccess = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.auth.getUser();

		return { hasAccess: !error && isAdminEmail(data.user?.email) };
	}
);

const optionInput = z.object({
	option: z.string().min(1).max(500),
	correct: z.boolean(),
});

export const createPoll = createServerFn({ method: "POST" })
	.validator(
		z.object({
			poll: z.object({
				question: z.string().min(10).max(2000),
				status: z.enum(POLL_STATUSES),
				answerType: z.enum(["single", "multiple"]),
				categoryCode: z.string().min(1),
				codeBlock: z.string().nullable().optional(),
				codeSandboxExample: z.string().nullable().optional(),
			}),
			options: z.array(optionInput),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();

		// Every player-authored poll enters as a draft, whoever submits it.
		return createPollService({
			...data,
			poll: { ...data.poll, status: "draft" },
			createdBy: userId,
		});
	});

export const updatePoll = createServerFn({ method: "POST" })
	.validator(
		z.object({
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
				optionInput.extend({ id: z.number().int().positive().optional() })
			),
		})
	)
	.handler(async ({ data }) => {
		await ensureAdminAccess();
		return updatePollService(data);
	});
