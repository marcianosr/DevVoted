import { z } from "zod";

import { STORAGE_PLANS } from "~/modules/run/run/domain/rules.model";
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

const storagePlanActionSchema = <T extends string>(type: T) =>
	z
		.object({
			type: z.literal(type),
			tier: z
				.number()
				.int()
				.min(0)
				.max(STORAGE_PLANS.length - 1),
		})
		.strict();

export const runActionSchema = z.discriminatedUnion("type", [
	configActionSchema("install"),
	configActionSchema("uninstall"),
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
	configActionSchema("unlock-offer"),
	bareActionSchema("extend-offers"),
	bareActionSchema("plant-pin"),
	bareActionSchema("finish-reward"),
	configActionSchema("sell"),
	configActionSchema("drop"),
	configActionSchema("minify"),
	configActionSchema("switch-arm"),
	bareActionSchema("buy-slot"),
	bareActionSchema("cash-slot"),
	storagePlanActionSchema("set-storage-plan"),
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
