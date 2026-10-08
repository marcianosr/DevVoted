import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";

export const SEED_PASSWORD = "kanto123";

const playerUUID = (index: number): string =>
	`50f7a1ed-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;

const climberUUID = (index: number): string =>
	`c0ffee00-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;

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
	"commitsBand",
	"openerCoverageMultiplier",
	"throttleCoverageMultiplier",
	"roundsPartialUnitsUp",
]);

const ECONOMY_POOL = poolWhere([
	"storagePerCorrect",
	"escrowPerCorrect",
	"chainStartKb",
	"emptySlotDiscountKb",
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
	"catchesFatal",
	"coverageDecayPerClear",
	"submitsCrowdPick",
]);

const portraitOf = (slug: string): string => `/editors/${slug}.png`;

export type SeedClimb = {
	readonly gatesCleared: number;
	readonly pollsIntoGate: number;
	readonly fell?: boolean;
	readonly configs: number;
	readonly coverageUnits: number;
	readonly configsLost?: number;
	readonly startedAtGate?: number;
	readonly storageKb?: number;
	readonly lootedBy?: string;
	readonly closingBand?: CoverageBandId;
};

export type SeedPlayer = {
	readonly id: string;
	readonly displayName: string;
	readonly email: string;
	readonly githubUsername: string;
	readonly photoUrl: string;
	readonly role: "user" | "poll-editor" | "admin";
	readonly accuracy: number;
	readonly buildStyle: string;
	readonly unlockedConfigIds: readonly string[];
	readonly pinnedGate?: number;
	readonly ownedSwatchIds?: readonly string[];
	readonly equippedSwatchId?: string;
	readonly peakStorageKb?: number;
	readonly archivedStorage?: number;
	readonly ownedTitleIds?: readonly string[];
	readonly legacyCalendarRuns?: {
		readonly finished: number;
		readonly active?: boolean;
	};
	readonly todaysRun?: "started" | SeedClimb;
};

export const SEED_PLAYERS: readonly SeedPlayer[] = [
	{
		id: playerUUID(1),
		displayName: "Lance",
		email: "lance@kanto.dev",
		githubUsername: "lance",
		photoUrl: portraitOf("lance"),
		accuracy: 0.88,
		role: "admin",
		buildStyle: "everything unlocked — widest possible deal",
		todaysRun: "started",
		unlockedConfigIds: EVERY_CONFIG_ID,
		ownedTitleIds: [
			"title-rank-poll-newbie",
			"title-rank-poll-acquaintance",
			"title-maintainer-ts",
		],
		ownedSwatchIds: [
			"swatch-pallet",
			"swatch-pewter",
			"swatch-cerulean",
			"swatch-cinnabar",
		],
		equippedSwatchId: "swatch-cinnabar",
		peakStorageKb: 4096,
		archivedStorage: 8_388_608,
	},
	{
		id: playerUUID(2),
		displayName: "Agatha",
		email: "agatha@kanto.dev",
		githubUsername: "agatha",
		photoUrl: portraitOf("agatha"),
		accuracy: 0.72,
		role: "user",
		buildStyle: "risk — wagers, streak growth, audit suppression",
		todaysRun: {
			gatesCleared: 4,
			pollsIntoGate: 2,
			fell: true,
			configs: 5,
			coverageUnits: 17,
			configsLost: 1,
			storageKb: 150,
			closingBand: "danger",
		},
		unlockedConfigIds: RISK_POOL,
		ownedTitleIds: ["title-maintainer-js", "title-i-m-a-teapot"],
		legacyCalendarRuns: { finished: 3 },
		peakStorageKb: 2048,
		archivedStorage: 2_097_152,
	},
	{
		id: playerUUID(3),
		displayName: "Lorelei",
		email: "lorelei@kanto.dev",
		githubUsername: "lorelei",
		photoUrl: portraitOf("lorelei"),
		accuracy: 0.8,
		role: "user",
		buildStyle: "coverage — multipliers and focus categories",
		todaysRun: "started",
		unlockedConfigIds: COVERAGE_POOL,
		pinnedGate: 4,
		legacyCalendarRuns: { finished: 2, active: true },
		peakStorageKb: 1536,
	},
	{
		id: playerUUID(4),
		displayName: "Bruno",
		email: "bruno@kanto.dev",
		githubUsername: "bruno",
		photoUrl: portraitOf("bruno"),
		accuracy: 0.65,
		role: "poll-editor",
		buildStyle: "economy — storage, interest, subscriptions",
		todaysRun: "started",
		unlockedConfigIds: ECONOMY_POOL,
		ownedTitleIds: ["title-maintainer-git"],
		legacyCalendarRuns: { finished: 2 },
		peakStorageKb: 3072,
		archivedStorage: 4_194_304,
	},
	{
		id: playerUUID(5),
		displayName: "Blue",
		email: "blue@kanto.dev",
		githubUsername: "blueoak",
		photoUrl: portraitOf("blue"),
		accuracy: 0.76,
		role: "user",
		buildStyle: "the free eight — a genuinely fresh account",
		unlockedConfigIds: FREE_CONFIG_IDS,
	},
];

export type SeedClimber = {
	readonly id: string;
	readonly displayName: string;
	readonly email: string;
	readonly githubUsername: string;
	readonly photoUrl?: string;
	readonly borderId: string;
	readonly accuracy: number;
	readonly climb: SeedClimb;
};

export const SEED_CLIMBERS: readonly SeedClimber[] = [
	{
		id: climberUUID(1),
		displayName: "Giovanni",
		email: "giovanni@kanto.dev",
		githubUsername: "giovanni",
		photoUrl: portraitOf("giovanni"),
		borderId: "border-ts",
		accuracy: 0.9,
		climb: {
			gatesCleared: 9,
			pollsIntoGate: 2,
			configs: 8,
			coverageUnits: 46,
			storageKb: 288,
		},
	},
	{
		id: climberUUID(2),
		displayName: "Blaine",
		email: "blaine@kanto.dev",
		githubUsername: "blaine",
		photoUrl: portraitOf("blaine"),
		borderId: "border-ruby",
		accuracy: 0.84,
		climb: {
			gatesCleared: 8,
			pollsIntoGate: 4,
			configs: 6,
			coverageUnits: 39,
			configsLost: 1,
			storageKb: 164,
		},
	},
	{
		id: climberUUID(3),
		displayName: "Sabrina",
		email: "sabrina@kanto.dev",
		githubUsername: "sabrina",
		photoUrl: portraitOf("sabrina"),
		borderId: "border-js",
		accuracy: 0.78,
		climb: {
			gatesCleared: 7,
			pollsIntoGate: 1,
			configs: 7,
			coverageUnits: 33,
			storageKb: 96,
		},
	},
	{
		id: climberUUID(4),
		displayName: "Koga",
		email: "koga@kanto.dev",
		githubUsername: "koga",
		photoUrl: portraitOf("koga"),
		borderId: "border-frontend",
		accuracy: 0.7,
		climb: {
			gatesCleared: 6,
			pollsIntoGate: 3,
			configs: 4,
			coverageUnits: 27,
			startedAtGate: 2,
			storageKb: 132,
		},
	},
	{
		id: climberUUID(5),
		displayName: "Erika",
		email: "erika@kanto.dev",
		githubUsername: "erika",
		photoUrl: portraitOf("erika"),
		borderId: "border-react",
		accuracy: 0.66,
		climb: {
			gatesCleared: 5,
			pollsIntoGate: 0,
			configs: 6,
			coverageUnits: 22,
			storageKb: 72,
		},
	},
	{
		id: climberUUID(6),
		displayName: "Lt. Surge",
		email: "lt.surge@kanto.dev",
		githubUsername: "ltsurge",
		photoUrl: portraitOf("ltsurge"),
		borderId: "border-html",
		accuracy: 0.6,
		climb: {
			gatesCleared: 6,
			pollsIntoGate: 3,
			fell: true,
			configs: 5,
			coverageUnits: 24,
			configsLost: 2,
			storageKb: 120,
			lootedBy: climberUUID(7),
		},
	},
	{
		id: climberUUID(7),
		displayName: "Misty",
		email: "misty@kanto.dev",
		githubUsername: "misty",
		photoUrl: portraitOf("misty"),
		borderId: "border-css",
		accuracy: 0.55,
		climb: {
			gatesCleared: 3,
			pollsIntoGate: 4,
			configs: 5,
			coverageUnits: 14,
			storageKb: 48,
		},
	},
	{
		id: climberUUID(8),
		displayName: "Brock",
		email: "brock@kanto.dev",
		githubUsername: "brock",
		photoUrl: portraitOf("brock"),
		borderId: "border-git",
		accuracy: 0.5,
		climb: {
			gatesCleared: 3,
			pollsIntoGate: 2,
			fell: true,
			configs: 3,
			coverageUnits: 11,
			storageKb: 180,
			closingBand: "danger",
		},
	},
	{
		id: climberUUID(9),
		displayName: "Red",
		email: "red@kanto.dev",
		githubUsername: "red",
		photoUrl: portraitOf("red"),
		borderId: "border-ts",
		accuracy: 0.94,
		climb: {
			gatesCleared: 11,
			pollsIntoGate: 1,
			configs: 9,
			coverageUnits: 58,
			storageKb: 512,
			closingBand: "perfect",
		},
	},
	{
		id: climberUUID(10),
		displayName: "Bill",
		email: "bill@kanto.dev",
		githubUsername: "bill",
		photoUrl: portraitOf("bill"),
		borderId: "border-js",
		accuracy: 0.82,
		climb: {
			gatesCleared: 4,
			pollsIntoGate: 2,
			configs: 6,
			coverageUnits: 21,
			storageKb: 224,
			closingBand: "perfect",
		},
	},
	{
		id: climberUUID(11),
		displayName: "Prof. Oak",
		email: "oak@kanto.dev",
		githubUsername: "samueloak",
		photoUrl: portraitOf("oak"),
		borderId: "border-react",
		accuracy: 0.86,
		climb: {
			gatesCleared: 4,
			pollsIntoGate: 0,
			configs: 7,
			coverageUnits: 19,
			storageKb: 308,
			closingBand: "healthy",
		},
	},
	{
		id: climberUUID(12),
		displayName: "Daisy",
		email: "daisy@kanto.dev",
		githubUsername: "daisyoak",
		borderId: "border-css",
		accuracy: 0.68,
		climb: {
			gatesCleared: 2,
			pollsIntoGate: 3,
			configs: 4,
			coverageUnits: 9,
			storageKb: 64,
			closingBand: "shaky",
		},
	},
	{
		id: climberUUID(13),
		displayName: "Mr. Fuji",
		email: "fuji@kanto.dev",
		githubUsername: "mrfuji",
		borderId: "border-git",
		accuracy: 0.6,
		climb: {
			gatesCleared: 1,
			pollsIntoGate: 4,
			configs: 3,
			coverageUnits: 5,
			storageKb: 40,
			closingBand: "shaky",
		},
	},
	{
		id: climberUUID(14),
		displayName: "Nurse Joy",
		email: "joy@kanto.dev",
		githubUsername: "nursejoy",
		borderId: "border-frontend",
		accuracy: 0.58,
		climb: {
			gatesCleared: 0,
			pollsIntoGate: 3,
			configs: 2,
			coverageUnits: 2,
			storageKb: 24,
		},
	},
	{
		id: climberUUID(15),
		displayName: "Officer Jenny",
		email: "jenny@kanto.dev",
		githubUsername: "officerjenny",
		borderId: "border-html",
		accuracy: 0.63,
		climb: {
			gatesCleared: 1,
			pollsIntoGate: 1,
			configs: 3,
			coverageUnits: 6,
			storageKb: 56,
			closingBand: "ok",
		},
	},
	{
		id: climberUUID(16),
		displayName: "Jessie",
		email: "jessie@kanto.dev",
		githubUsername: "jessie",
		borderId: "border-ruby",
		accuracy: 0.52,
		climb: {
			gatesCleared: 2,
			pollsIntoGate: 2,
			fell: true,
			configs: 4,
			coverageUnits: 7,
			configsLost: 1,
			storageKb: 88,
			closingBand: "danger",
		},
	},
	{
		id: climberUUID(17),
		displayName: "James",
		email: "james@kanto.dev",
		githubUsername: "jamesrocket",
		borderId: "border-ruby",
		accuracy: 0.54,
		climb: {
			gatesCleared: 2,
			pollsIntoGate: 0,
			configs: 4,
			coverageUnits: 8,
			startedAtGate: 1,
			storageKb: 72,
			closingBand: "shaky",
		},
	},
	{
		id: climberUUID(18),
		displayName: "Copycat",
		email: "copycat@kanto.dev",
		githubUsername: "copycat",
		borderId: "border-js",
		accuracy: 0.71,
		climb: {
			gatesCleared: 3,
			pollsIntoGate: 1,
			configs: 5,
			coverageUnits: 13,
			startedAtGate: 2,
			storageKb: 104,
			closingBand: "ok",
		},
	},
	{
		id: climberUUID(19),
		displayName: "Gold",
		email: "gold@johto.dev",
		githubUsername: "gold",
		photoUrl: portraitOf("gold"),
		borderId: "border-ts",
		accuracy: 0.92,
		climb: {
			gatesCleared: 10,
			pollsIntoGate: 3,
			configs: 9,
			coverageUnits: 52,
			storageKb: 420,
			closingBand: "perfect",
		},
	},
	{
		id: climberUUID(20),
		displayName: "Silver",
		email: "silver@johto.dev",
		githubUsername: "silver",
		photoUrl: portraitOf("silver"),
		borderId: "border-ruby",
		accuracy: 0.8,
		climb: {
			gatesCleared: 9,
			pollsIntoGate: 4,
			fell: true,
			configs: 8,
			coverageUnits: 44,
			configsLost: 2,
			storageKb: 360,
			closingBand: "danger",
		},
	},
	{
		id: climberUUID(21),
		displayName: "Clair",
		email: "clair@johto.dev",
		githubUsername: "clair",
		photoUrl: portraitOf("clair"),
		borderId: "border-frontend",
		accuracy: 0.86,
		climb: {
			gatesCleared: 8,
			pollsIntoGate: 0,
			configs: 8,
			coverageUnits: 38,
			storageKb: 260,
			closingBand: "perfect",
		},
	},
	{
		id: climberUUID(22),
		displayName: "Pryce",
		email: "pryce@johto.dev",
		githubUsername: "pryce",
		photoUrl: portraitOf("pryce"),
		borderId: "border-css",
		accuracy: 0.74,
		climb: {
			gatesCleared: 7,
			pollsIntoGate: 3,
			configs: 7,
			coverageUnits: 34,
			startedAtGate: 2,
			storageKb: 200,
			closingBand: "healthy",
		},
	},
	{
		id: climberUUID(23),
		displayName: "Jasmine",
		email: "jasmine@johto.dev",
		githubUsername: "jasmine",
		photoUrl: portraitOf("jasmine"),
		borderId: "border-git",
		accuracy: 0.77,
		climb: {
			gatesCleared: 6,
			pollsIntoGate: 1,
			configs: 6,
			coverageUnits: 28,
			storageKb: 150,
		},
	},
	{
		id: climberUUID(24),
		displayName: "Morty",
		email: "morty@johto.dev",
		githubUsername: "morty",
		photoUrl: portraitOf("morty"),
		borderId: "border-js",
		accuracy: 0.72,
		climb: {
			gatesCleared: 5,
			pollsIntoGate: 2,
			configs: 6,
			coverageUnits: 24,
			storageKb: 110,
			closingBand: "healthy",
		},
	},
	{
		id: climberUUID(25),
		displayName: "Chuck",
		email: "chuck@johto.dev",
		githubUsername: "chuck",
		photoUrl: portraitOf("chuck"),
		borderId: "border-html",
		accuracy: 0.62,
		climb: {
			gatesCleared: 4,
			pollsIntoGate: 4,
			configs: 5,
			coverageUnits: 18,
			storageKb: 96,
			closingBand: "shaky",
		},
	},
	{
		id: climberUUID(26),
		displayName: "Whitney",
		email: "whitney@johto.dev",
		githubUsername: "whitney",
		photoUrl: portraitOf("whitney"),
		borderId: "border-react",
		accuracy: 0.57,
		climb: {
			gatesCleared: 3,
			pollsIntoGate: 3,
			fell: true,
			configs: 4,
			coverageUnits: 12,
			configsLost: 1,
			storageKb: 140,
			closingBand: "danger",
		},
	},
	{
		id: climberUUID(27),
		displayName: "Bugsy",
		email: "bugsy@johto.dev",
		githubUsername: "bugsy",
		photoUrl: portraitOf("bugsy"),
		borderId: "border-react",
		accuracy: 0.69,
		climb: {
			gatesCleared: 2,
			pollsIntoGate: 1,
			configs: 4,
			coverageUnits: 9,
			storageKb: 60,
			closingBand: "ok",
		},
	},
	{
		id: climberUUID(28),
		displayName: "Falkner",
		email: "falkner@johto.dev",
		githubUsername: "falkner",
		photoUrl: portraitOf("falkner"),
		borderId: "border-js",
		accuracy: 0.64,
		climb: {
			gatesCleared: 1,
			pollsIntoGate: 2,
			configs: 3,
			coverageUnits: 5,
			storageKb: 32,
			closingBand: "ok",
		},
	},
];

export const POLL_AUTHOR_IDS: readonly string[] = SEED_CLIMBERS.map(
	(climber) => climber.id
);

export const ALL_SEEDED_USER_IDS: readonly string[] = [
	...SEED_PLAYERS.map((player) => player.id),
	...SEED_CLIMBERS.map((climber) => climber.id),
];
