import { z } from "zod";

import {
	BOOT_CACHE_RUNGS,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import {
	isRegistryControlId,
	REGISTRY_CONTROL_IDS,
	type RegistryControlId,
} from "~/modules/run/shop/domain/registryControl.model";

const configActionSchema = <T extends string>(type: T) =>
	z
		.object({
			type: z.literal(type),
			configId: z.string().min(1),
		})
		.strict();

const bareActionSchema = <T extends string>(type: T) =>
	z.object({ type: z.literal(type) }).strict();

const optionActionSchema = <T extends string>(type: T) =>
	z.object({ type: z.literal(type), optionId: z.string().min(1) }).strict();

const gateSlotSchema = z
	.number()
	.int()
	.min(0)
	.max(SLICE_WINDOW - 1);

export const runActionSchema = z.discriminatedUnion("type", [
	configActionSchema("install"),
	configActionSchema("uninstall"),
	bareActionSchema("start"),
	z
		.object({
			type: z.literal("rebase"),
			from: gateSlotSchema,
			to: gateSlotSchema,
		})
		.strict(),
	z
		.object({
			type: z.literal("estimate"),
			count: z.number().int().min(1).max(SLICE_WINDOW),
		})
		.strict(),
	z
		.object({
			type: z.literal("commit-band"),
			band: z.string(),
		})
		.strict(),
	z
		.object({
			type: z.literal("approve-slot"),
			pollId: z.string().min(1),
		})
		.strict(),
	z
		.object({
			type: z.literal("answer"),
			optionIds: z.array(z.string().min(1)).min(1).readonly(),
			elapsedMs: z.number().int().min(0).max(600_000).optional(),
		})
		.strict(),
	bareActionSchema("fire-audit"),
	bareActionSchema("buy-incident"),
	bareActionSchema("refresh-incident"),
	bareActionSchema("close-gate"),
	bareActionSchema("skip"),
	bareActionSchema("lint-poll"),
	bareActionSchema("peek-poll"),
	bareActionSchema("arm-strict"),
	optionActionSchema("buy-back-option"),
	z
		.object({
			type: z.literal("strip"),
			configIds: z.array(z.string().min(1)).readonly(),
			fromStorage: z.boolean().optional(),
		})
		.strict()
		.refine(
			(action) => action.configIds.length > 0 || action.fromStorage === true,
			{ message: "A strip must drop a config, settle from storage, or both." }
		),
	bareActionSchema("refuse-gate"),
	bareActionSchema("resume-climb"),
	configActionSchema("draft"),
	configActionSchema("upgrade"),
	bareActionSchema("rebuild-draft"),
	configActionSchema("lock-offer"),
	configActionSchema("unlock-offer"),
	bareActionSchema("extend-offers"),
	bareActionSchema("plant-pin"),
	bareActionSchema("finish-reward"),
	bareActionSchema("skip-shop"),
	configActionSchema("sell"),
	configActionSchema("drop"),
	configActionSchema("minify"),
	configActionSchema("switch-arm"),
	configActionSchema("vendor-lock"),
]);

export type WireRunAction = z.infer<typeof runActionSchema>;

type SchemaAction = WireRunAction;
type Assert<T extends true> = T;

export type ServerMintedAction = "loot" | "warm-boot";

type ClientAction = Exclude<RunAction["type"], ServerMintedAction>;

export type SchemaCoversEveryAction = Assert<
	[ClientAction] extends [SchemaAction["type"]] ? true : false
>;
export type SchemaMintsNothingForTheClient = Assert<
	[Extract<SchemaAction["type"], ServerMintedAction>] extends [never]
		? true
		: false
>;
export type SchemaAddsNoAction = Assert<
	[SchemaAction["type"]] extends [RunAction["type"]] ? true : false
>;
export type SchemaPayloadsMatchEngine = Assert<
	SchemaAction extends RunAction ? true : false
>;

const registryControlIdSchema = z.custom<RegistryControlId>(
	(value) => typeof value === "string" && isRegistryControlId(value)
);

export const warmBootPickSchema = z
	.object({
		bootCacheRung: z
			.number()
			.int()
			.min(0)
			.max(BOOT_CACHE_RUNGS.length - 1)
			.optional(),
		serviceIds: z
			.array(registryControlIdSchema)
			.max(REGISTRY_CONTROL_IDS.length),
	})
	.strict();

export type WireWarmBootPick = z.infer<typeof warmBootPickSchema>;
