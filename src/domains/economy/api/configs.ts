import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { addConfigToRunHandler, removeConfigFromRunHandler } from "./handlers";

export const addConfigToRunServerFn = createServerFn()
	.validator(
		z.object({
			runId: z.number().int().positive(),
			configIds: z.array(z.string().min(1)),
			date: z
				.string()
				.regex(/^\d{4}-\d{2}-\d{2}$/)
				.optional(),
		})
	)
	.handler(async ({ data }) => addConfigToRunHandler({ data }));

export const removeConfigFromRunServerFn = createServerFn()
	.validator(
		z.object({
			runId: z.number().int().positive(),
			configIds: z.array(z.string().min(1)),
			date: z
				.string()
				.regex(/^\d{4}-\d{2}-\d{2}$/)
				.optional(),
		})
	)
	.handler(async ({ data }) => removeConfigFromRunHandler({ data }));
