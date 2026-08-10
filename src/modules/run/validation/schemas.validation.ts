import { z } from "zod";

/**
 * Wire schema for RunAction (climb/run.model.ts). Strict on purpose: the
 * client sends intent only — never state, storage, coverage, or gatesCleared
 * (anti-cheat, DVTD-ay5e). Unknown action types and extra fields are rejected.
 */
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
	bareActionSchema("start"),
	z
		.object({
			type: z.literal("answer"),
			optionIds: z.array(z.string().min(1)).min(1),
			// Reveal→submit ms, client-measured. Capped at 10 minutes: award
			// data, not gameplay-relevant — a spoofed low value is accepted risk.
			elapsedMs: z.number().int().min(0).max(600_000).optional(),
		})
		.strict(),
	bareActionSchema("lint-poll"),
	configActionSchema("strip"),
	bareActionSchema("resume-climb"),
	configActionSchema("draft"),
	configActionSchema("upgrade"),
	bareActionSchema("rebuild-draft"),
	bareActionSchema("finish-reward"),
	configActionSchema("sell"),
	configActionSchema("drop"),
	// Tier is intent, not state: the reducer rejects unknown tiers and the
	// change is shop-only, so the wire only vouches for the shape.
	z
		.object({ type: z.literal("change-plan"), tier: z.number().int().min(1) })
		.strict(),
]);

export type RunActionInput = z.infer<typeof runActionSchema>;
