import { z } from "zod";

import { MAX_EXTRA_SPOTS } from "~/modules/run/run/domain/rules.model";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";

const configActionSchema = <T extends string>(type: T) =>
	z
		.object({
			type: z.literal(type),
			configId: z.string().min(1),
		})
		.strict();

const bareActionSchema = <T extends string>(type: T) =>
	z.object({ type: z.literal(type) }).strict();

const extraSpotActionSchema = <T extends string>(type: T) =>
	z
		.object({
			type: z.literal(type),
			spots: z.number().int().min(0).max(MAX_EXTRA_SPOTS),
		})
		.strict();

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
			optionIds: z.array(z.string().min(1)).min(1).readonly(),
			elapsedMs: z.number().int().min(0).max(600_000).optional(),
		})
		.strict(),
	bareActionSchema("lint-poll"),
	bareActionSchema("peek-poll"),
	configActionSchema("strip"),
	bareActionSchema("resume-climb"),
	configActionSchema("draft"),
	configActionSchema("upgrade"),
	bareActionSchema("rebuild-draft"),
	configActionSchema("lock-offer"),
	bareActionSchema("extend-offers"),
	bareActionSchema("plant-pin"),
	bareActionSchema("finish-reward"),
	configActionSchema("sell"),
	configActionSchema("drop"),
	configActionSchema("minify"),
	extraSpotActionSchema("set-extra-spots"),
]);

type SchemaAction = z.infer<typeof runActionSchema>;
type Assert<T extends true> = T;

export type SchemaCoversEveryAction = Assert<
	[RunAction["type"]] extends [SchemaAction["type"]] ? true : false
>;
export type SchemaAddsNoAction = Assert<
	[SchemaAction["type"]] extends [RunAction["type"]] ? true : false
>;
export type SchemaPayloadsMatchEngine = Assert<
	SchemaAction extends RunAction ? true : false
>;
