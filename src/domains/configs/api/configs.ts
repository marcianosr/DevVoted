import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { addConfigToRunHandler, removeConfigFromRunHandler } from "./handlers";

export const addConfigToRunServerFn = createServerFn()
	.validator(
		z.object({
			runId: z.number().int().positive(),
			configIds: z.array(z.string().min(1)),
		})
	)
	.handler(async ({ data }) => addConfigToRunHandler({ data }));

export const removeConfigFromRunServerFn = createServerFn()
	.validator(
		z.object({
			runId: z.number().int().positive(),
			configIds: z.array(z.string().min(1)),
		})
	)
	.handler(async ({ data }) => removeConfigFromRunHandler({ data }));
