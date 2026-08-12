import { z } from "zod";

const configActionSchema = <T extends string>(type: T) =>
	z
		.object({
			type: z.literal(type),
			configId: z.string().min(1),
		})
		.strict();

const bareActionSchema = <T extends string>(type: T) =>
	z.object({ type: z.literal(type) }).strict();

export const runActionSchema = z.discriminatedUnion("type", [
	configActionSchema("slot"),
	configActionSchema("unslot"),
	z
		.object({ type: z.literal("pick-stack"), stackId: z.string().min(1) })
		.strict(),
	bareActionSchema("start"),
	z
		.object({
			type: z.literal("answer"),
			optionIds: z.array(z.string().min(1)).min(1),
			elapsedMs: z.number().int().min(0).max(600_000).optional(),
		})
		.strict(),
	bareActionSchema("lint-poll"),
	configActionSchema("strip"),
	bareActionSchema("resume-climb"),
	configActionSchema("draft"),
	configActionSchema("upgrade"),
	bareActionSchema("rebuild-draft"),
	configActionSchema("lock-offer"),
	bareActionSchema("extend-offers"),
	bareActionSchema("finish-reward"),
	configActionSchema("sell"),
	configActionSchema("drop"),
	z
		.object({ type: z.literal("change-plan"), tier: z.number().int().min(1) })
		.strict(),
]);

export type RunActionInput = z.infer<typeof runActionSchema>;
