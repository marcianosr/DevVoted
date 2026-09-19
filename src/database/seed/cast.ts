import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";

export const SEED_PASSWORD = "kanto123";

const playerUUID = (index: number): string =>
	`50f7a1ed-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;

const climberUUID = (index: number): string =>
	`c0ffee00-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;

/**
 * Archetypes are derived from the effects a config actually carries, never from
 * a hardcoded id list: `Config` has no family field, so a list would drift
 * silently every time the roster gains or loses a card.
 */
const touches = (config: Config, keys: readonly (keyof Config)[]): boolean =>
	keys.some((key) => config[key] !== undefined);

const poolWhere = (keys: readonly (keyof Config)[]): readonly string[] => [
	...new Set([
		...FREE_CONFIG_IDS,
		...CONFIG_LIST.filter((config) => touches(config, keys)).map(
			(config) => config.id
		),
	]),
];

const EVERY_CONFIG_ID: readonly string[] = CONFIG_LIST.map(
	(config) => config.id
);

const COVERAGE_POOL = poolWhere([
	"coverageMultiplier",
	"coverageAdd",
	"focusCategory",
	"coveragePerEstimate",
	"openerCoverageMultiplier",
	"throttleCoverageMultiplier",
	"roundsPartialUnitsUp",
]);

const ECONOMY_POOL = poolWhere([
	"storagePerCorrect",
	"storageOnClear",
	"storageInterestPct",
	"storagePerExtraPick",
	"subscriptionKb",
	"draftCostFactor",
	"draftCost",
]);

const RISK_POOL = poolWhere([
	"wagersAnswer",
	"abArm",
	"suppressesAudit",
	"streakStepGrowth",
	"streakCapSteps",
	"coverageDecayPerClear",
]);

/** A playable account: a real auth login, an unlock ledger, and a build style. */
export type SeedPlayer = {
	readonly id: string;
	readonly displayName: string;
	readonly email: string;
	readonly githubUsername: string;
	readonly role: "user" | "poll-editor" | "admin";
	readonly buildStyle: string;
	readonly unlockedConfigIds: readonly string[];
	readonly pinnedGate?: number;
	readonly ownedSwatchIds?: readonly string[];
	readonly peakStorageKb?: number;
	readonly archivedStorage?: number;
};

export const SEED_PLAYERS: readonly SeedPlayer[] = [
	{
		id: playerUUID(1),
		displayName: "Lt. Surge",
		email: "lt.surge@kanto.dev",
		githubUsername: "ltsurge",
		role: "admin",
		buildStyle: "everything unlocked — widest possible deal",
		unlockedConfigIds: EVERY_CONFIG_ID,
		ownedSwatchIds: ["pallet", "pewter", "cerulean", "vermillion"],
		peakStorageKb: 4096,
		archivedStorage: 8_388_608,
	},
	{
		id: playerUUID(2),
		displayName: "Blaine",
		email: "blaine@kanto.dev",
		githubUsername: "blaine",
		role: "user",
		buildStyle: "risk — wagers, streak growth, audit suppression",
		unlockedConfigIds: RISK_POOL,
		peakStorageKb: 2048,
		archivedStorage: 2_097_152,
	},
	{
		id: playerUUID(3),
		displayName: "Koga",
		email: "koga@kanto.dev",
		githubUsername: "koga",
		role: "user",
		buildStyle: "coverage — multipliers and focus categories",
		unlockedConfigIds: COVERAGE_POOL,
		pinnedGate: 4,
		peakStorageKb: 1536,
	},
	{
		id: playerUUID(4),
		displayName: "Sabrina",
		email: "sabrina@kanto.dev",
		githubUsername: "sabrina",
		role: "poll-editor",
		buildStyle: "economy — storage, interest, subscriptions",
		unlockedConfigIds: ECONOMY_POOL,
		peakStorageKb: 3072,
		archivedStorage: 4_194_304,
	},
	{
		id: playerUUID(5),
		displayName: "Erika",
		email: "erika@kanto.dev",
		githubUsername: "erika",
		role: "user",
		buildStyle: "the free eight — a genuinely fresh account",
		unlockedConfigIds: FREE_CONFIG_IDS,
	},
];

/**
 * Climbers populate the community board and author the polls — `polls.created_by`
 * is a notNull FK, and the poll byline renders their handle, photo and role.
 * They get no auth row: nobody needs to log in as them.
 */
export type SeedClimber = {
	readonly id: string;
	readonly displayName: string;
	readonly email: string;
	readonly githubUsername: string;
	readonly accuracy: number;
	readonly climb: {
		readonly gatesCleared: number;
		readonly pollsIntoGate: number;
		readonly fell?: boolean;
		readonly configs: number;
		readonly coverageUnits: number;
		readonly configsLost?: number;
		readonly startedAtGate?: number;
	};
};

export const SEED_CLIMBERS: readonly SeedClimber[] = [
	{
		id: climberUUID(1),
		displayName: "Lance",
		email: "lance@kanto.dev",
		githubUsername: "lance",
		accuracy: 0.9,
		climb: { gatesCleared: 9, pollsIntoGate: 2, configs: 8, coverageUnits: 46 },
	},
	{
		id: climberUUID(2),
		displayName: "Agatha",
		email: "agatha@kanto.dev",
		githubUsername: "agatha",
		accuracy: 0.84,
		climb: {
			gatesCleared: 8,
			pollsIntoGate: 4,
			configs: 6,
			coverageUnits: 39,
			configsLost: 1,
		},
	},
	{
		id: climberUUID(3),
		displayName: "Lorelei",
		email: "lorelei@kanto.dev",
		githubUsername: "lorelei",
		accuracy: 0.78,
		climb: { gatesCleared: 7, pollsIntoGate: 1, configs: 7, coverageUnits: 33 },
	},
	{
		id: climberUUID(4),
		displayName: "Bruno",
		email: "bruno@kanto.dev",
		githubUsername: "bruno",
		accuracy: 0.7,
		climb: {
			gatesCleared: 6,
			pollsIntoGate: 3,
			configs: 4,
			coverageUnits: 27,
			startedAtGate: 2,
		},
	},
	{
		id: climberUUID(5),
		displayName: "Giovanni",
		email: "giovanni@kanto.dev",
		githubUsername: "giovanni",
		accuracy: 0.66,
		climb: { gatesCleared: 5, pollsIntoGate: 0, configs: 6, coverageUnits: 22 },
	},
	{
		id: climberUUID(6),
		displayName: "Janine",
		email: "janine@kanto.dev",
		githubUsername: "janine",
		accuracy: 0.6,
		climb: { gatesCleared: 4, pollsIntoGate: 2, configs: 3, coverageUnits: 18 },
	},
	{
		id: climberUUID(7),
		displayName: "Bill",
		email: "bill@kanto.dev",
		githubUsername: "bill",
		accuracy: 0.55,
		climb: { gatesCleared: 3, pollsIntoGate: 4, configs: 5, coverageUnits: 14 },
	},
	{
		id: climberUUID(8),
		displayName: "Daisy Oak",
		email: "daisy@kanto.dev",
		githubUsername: "daisyoak",
		accuracy: 0.5,
		climb: { gatesCleared: 2, pollsIntoGate: 1, configs: 2, coverageUnits: 9 },
	},
	{
		id: climberUUID(9),
		displayName: "Blue",
		email: "blue@kanto.dev",
		githubUsername: "blueoak",
		accuracy: 0.45,
		climb: {
			gatesCleared: 6,
			pollsIntoGate: 3,
			fell: true,
			configs: 5,
			coverageUnits: 24,
			configsLost: 2,
		},
	},
	{
		id: climberUUID(10),
		displayName: "Prof. Oak",
		email: "prof.oak@kanto.dev",
		githubUsername: "profoak",
		accuracy: 0.38,
		climb: {
			gatesCleared: 3,
			pollsIntoGate: 2,
			fell: true,
			configs: 3,
			coverageUnits: 11,
		},
	},
];

/** Polls are authored by the climbers, round-robin, so bylines vary across a run. */
export const POLL_AUTHOR_IDS: readonly string[] = SEED_CLIMBERS.map(
	(climber) => climber.id
);

export const ALL_SEEDED_USER_IDS: readonly string[] = [
	...SEED_PLAYERS.map((player) => player.id),
	...SEED_CLIMBERS.map((climber) => climber.id),
];
