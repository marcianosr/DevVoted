import {
	boolean,
	integer,
	json,
	pgEnum,
	pgTable,
	real,
	serial,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { STORAGE_UNITS } from "~/lib/storage";

/**
 * Database Schema for DevVoted Quiz Game
 *
 * This schema represents the data structure for a quiz game where users can:
 * - Create and answer polls
 * - Track their progress and submissions
 * - Maintain streaks and earn XP
 * - Participate in community-driven poll selection
 */

// === ENUMS ===

/**
 * User role types for access control and permissions
 * - user: Regular player with standard permissions
 * - admin: Administrative user with extended capabilities
 */
export const userRoles = pgEnum("roles", [
	"user",
	"poll-editor",
	"admin",
] as const);

/**
 * Poll status types to track the lifecycle of each poll
 * - draft: Initial state, not yet published
 * - open: Currently accepting responses
 * - closed: No longer accepting responses
 * - archived: Historical poll, no longer relevant
 */
export const pollStatus = pgEnum("status", ["draft", "published", "archived"]);

export const runStatus = pgEnum("run_status", ["finished", "active"]);

/**
 * Season status types to manage season lifecycle
 * - upcoming: Season scheduled but not yet started
 * - active: Current season accepting new runs
 * - finished: Season completed, no new runs allowed
 * - archived: Historical season, no longer displayed
 */
export const seasonStatus = pgEnum("season_status", [
	"upcoming",
	"active",
	"finished",
	"archived",
] as const);

/**
 * Poll answer type to determine if a poll accepts single or multiple answers
 * - single: Only one answer can be selected
 * - multiple: Multiple answers can be selected
 */
export const pollAnswerType = pgEnum("answer_type", [
	"single",
	"multiple",
] as const);

// === TABLES ===

/**
 * Users Table
 * Stores player profiles and authentication data
 * - Tracks basic user information
 * - Manages authentication state
 * - Records gameplay statistics
 */
export const usersTable = pgTable("users", {
	id: uuid("id").primaryKey(),
	display_name: varchar("display_name", { length: 256 }).notNull(),
	email: varchar("email", { length: 256 }).notNull().unique(),
	photo_url: text("photo_url"),
	github_username: varchar("github_username", { length: 100 }),
	role: userRoles("roles").notNull().default("user"),
	total_polls_submitted: integer("total_polls_submitted").notNull().default(0),
});

/**
 * Polls Table
 * Core table for quiz questions and their metadata
 * - Stores the actual poll questions
 * - Manages poll lifecycle through status
 * - Tracks creation and modification timestamps
 * - Links to categories and creators
 */
export const pollsTable = pgTable("polls", {
	id: serial("id").primaryKey(),
	question: text("question").notNull(),
	poll_number: integer("poll_number"),
	code_block: text("code_block"), // Optional code block shown in poll
	code_sandbox_example: text("code_sandbox_example"),
	explanation: text("explanation"), // Optional explanation shown after answering
	status: pollStatus("status").notNull().default("draft"),
	answer_type: pollAnswerType("answer_type").notNull().default("single"),
	opening_time: timestamp("opening_time", { withTimezone: true }).notNull(),
	closing_time: timestamp("closing_time", { withTimezone: true }).notNull(),
	created_by: uuid("created_by")
		.references(() => usersTable.id, { onDelete: "set null" }) // Preserves poll history even if user is deleted
		.notNull(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()), // Automatically tracks last modification
	category_code: varchar("category_code", { length: 50 })
		.references(() => pollCategoriesTable.code)
		.notNull(),
});

/**
 * Daily Polls Table
 * Scheduling layer for daily poll selection - provides O(1) lookup by date
 * - One poll per day (enforced by unique constraint on date)
 * - Eliminates expensive full-table scans for poll selection
 * - category_weights: Snapshot of global weights at end of previous day
 * - poll_id: Selected poll (nullable until poll is chosen using weights)
 */
export const dailyPollsTable = pgTable("daily_polls", {
	id: serial("id").primaryKey(),
	date: varchar("date", { length: 10 }).notNull().unique(), // "YYYY-MM-DD"
	poll_id: integer("poll_id").references(() => pollsTable.id, {
		onDelete: "cascade",
	}), // Nullable - filled when poll is selected
	category_weights: json("category_weights").$type<Record<string, number>>(), // Weights snapshot from previous day
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Poll History Table
 * Tracks poll viewing and answering statistics per run
 * - One record per run per poll (enforced by unique constraint)
 * - Counters for views and answers within the specific run
 * - Timestamps for first/last view and last answer
 * - Run-scoped to enable proper gate and round resets between runs
 */
export const pollHistoryTable = pgTable(
	"polls_history",
	{
		id: serial("id").primaryKey().notNull(),
		run_id: integer("run_id")
			.references(() => runsTable.id, { onDelete: "cascade" })
			.notNull(),
		poll_id: integer("poll_id")
			.references(() => pollsTable.id, { onDelete: "cascade" })
			.notNull(),
		user_id: uuid("user_id")
			.references(() => usersTable.id, { onDelete: "cascade" })
			.notNull(),
		times_seen: integer("times_seen").notNull().default(1),
		times_answered: integer("times_answered").notNull().default(0),
		first_seen_at: timestamp("first_seen_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		last_seen_at: timestamp("last_seen_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		last_answered_at: timestamp("last_answered_at", { withTimezone: true }),
	},
	(table) => {
		return {
			runPollUnique: unique().on(table.run_id, table.poll_id),
		};
	}
);

/**
 * Poll Options Table
 * Stores answer choices for each poll
 * - Contains all possible answers for a poll
 * - Marks correct answers for scoring
 * - Automatically deleted when parent poll is removed
 */
export const pollOptionsTable = pgTable("polls_options", {
	id: serial("id").primaryKey().notNull(),
	poll_id: integer("poll_id")
		.references(() => pollsTable.id, { onDelete: "cascade" })
		.notNull(),
	option: text("option").notNull(),
	correct: boolean("correct").notNull().default(false),
});

/**
 * Poll Categories Table
 * Manages quiz categories for organization and filtering
 * - Enables category-based progression
 * - Supports streak tracking per category
 * - Allows for targeted learning paths
 */
export const pollCategoriesTable = pgTable("polls_categories", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 256 }).notNull(),
	code: varchar("code", { length: 256 }).notNull().unique(),
});

/**
 * Poll Response Options Table
 * Links user responses to specific answer choices
 * - Implements many-to-many relationship between responses and options
 * - Enables tracking of specific answer selections
 * - Maintains response history for analytics
 */
export const pollResponseOptionsTable = pgTable("polls_response_options", {
	id: serial("id").primaryKey().notNull(),
	response_id: integer("response_id")
		.references(() => pollResponsesTable.response_id, {
			onDelete: "cascade",
		})
		.notNull(),
	option_id: integer("option_id")
		.references(() => pollOptionsTable.id, { onDelete: "cascade" })
		.notNull(),
});

/**
 * Poll Responses Table
 * Records user submissions and answers
 * - Tracks who answered what and when
 * - Scoped to runs for game session tracking
 * - Daily unique constraint prevents race condition duplicates
 * - Maintains response history even if user is deleted
 */
export const pollResponsesTable = pgTable(
	"polls_responses",
	{
		response_id: serial("response_id").primaryKey(),
		poll_id: integer("poll_id")
			.references(() => pollsTable.id, { onDelete: "cascade" })
			.notNull(),
		user_id: uuid("user_id").references(() => usersTable.id, {
			onDelete: "set null",
		}),
		run_id: integer("run_id").references(() => runsTable.id, {
			onDelete: "cascade",
		}), // Nullable for legacy responses before this column existed
		coverage_delta: real("coverage_delta"), // Coverage % gained for this response (null for legacy rows)
		score_breakdown:
			json("score_breakdown").$type<
				import("~/domains/runs/services/score.service").ScoreCalculation
			>(),
		// Intentionally redundant with created_at — derived date used solely for unique constraint.
		// Drizzle doesn't support unique constraints on expressions like DATE(created_at).
		answer_date: varchar("answer_date", { length: 10 }).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		uniquePollUserDaily: unique().on(
			table.poll_id,
			table.user_id,
			table.answer_date
		),
	})
);

/**
 * Runs Table
 * Stores individual game runs for players
 * - Each run represents a complete game session
 * - Players can have multiple runs over time
 * - Only one active run per user at a time
 */
export const runsTable = pgTable("runs", {
	id: serial("id").primaryKey(),
	user_id: uuid("user_id")
		.references(() => usersTable.id, { onDelete: "cascade" })
		.notNull(),
	season_id: integer("season_id").references(() => seasonsTable.id, {
		onDelete: "set null",
	}), // Nullable for backward compatibility with pre-season runs
	status: runStatus("status").notNull().default("active"),
	storage_limit: integer("storage_limit").notNull().default(STORAGE_UNITS.MB), // 1MB in bytes
	active_config_ids: json("active_config_ids")
		.$type<string[]>()
		.notNull()
		.default([]), // Array of config IDs
	rerolls: integer("rerolls").notNull().default(0), // Current poll session rerolls (resets each poll)
	total_rerolls: integer("total_rerolls").notNull().default(0), // Total rerolls across entire run
	reroll_storage_used: integer("reroll_storage_used").notNull().default(0), // Actual storage bytes used on rerolls
	shop_skipped_date: varchar("shop_skipped_date", { length: 10 }), // Date when shop was skipped "YYYY-MM-DD"
	shop_interacted_date: varchar("shop_interacted_date", { length: 10 }), // Date when user interacted with shop
	deinstall_penalty: integer("deinstall_penalty").notNull().default(0), // Storage penalty from deinstalling configs
	correct_polls_count: integer("correct_polls_count").notNull().default(0), // Number of correctly answered polls in this run
	pipeline_slots: json("pipeline_slots")
		.$type<
			Array<{
				gateTypeId: string;
				difficulty: string;
				requirement: object;
				reward: number;
			}>
		>()
		.notNull()
		.default([]), // Active pipeline slots for the current run
	pipeline_slot_snapshots: json("pipeline_slot_snapshots")
		.$type<
			Array<
				Array<{
					gateTypeId: string;
					difficulty: string;
					requirement: object;
					reward: number;
				}>
			>
		>()
		.notNull()
		.default([]), // Per-gate slot snapshots: index 0 = slots active during gate 1, index 1 = gate 2, etc.
	pending_upgrade_cards: json("pending_upgrade_cards").$type<
		Array<{
			kind: string;
			slot: object;
			gateTypeId?: string;
			from?: string;
			to?: string;
		}>
	>(), // Upgrade cards pending player decision — null when no decision is pending
	completion_reason: text("completion_reason"), // Reason for run completion — stores JSON for pipeline failures, plain strings for others
	victory_achieved_at: timestamp("victory_achieved_at", { withTimezone: true }), // When player passed all gates (run continues in post-victory mode)
	started_at: timestamp("started_at", { withTimezone: true }).defaultNow(),
	finished_at: timestamp("finished_at", { withTimezone: true }),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

/**
 * Run Category Coverage Table
 * Tracks coverage score earned in each category during a specific run
 * - Each run starts with 0% coverage in all categories
 * - Coverage accumulates as players answer polls correctly (1% per correct answer)
 * - Enables category-specific progression within runs
 */
export const runCategoryCoverageTable = pgTable(
	"run_category_coverage",
	{
		id: serial("id").primaryKey(),
		run_id: integer("run_id")
			.references(() => runsTable.id, { onDelete: "cascade" })
			.notNull(),
		category_code: varchar("category_code", { length: 50 })
			.references(() => pollCategoriesTable.code)
			.notNull(),
		current_coverage: real("current_coverage").notNull().default(0),
		current_streak: integer("current_streak").notNull().default(0),
		best_streak: integer("best_streak").notNull().default(0),
		polls_answered: integer("polls_answered").notNull().default(0),
		final_coverage: real("final_coverage"),
		final_streak: integer("final_streak"),
		final_polls_answered: integer("final_polls_answered"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => {
		return {
			runCategoryUnique: unique().on(table.run_id, table.category_code),
		};
	}
);
/**
 * Seasons Table
 * Manages game seasons for temporal organization and progression tracking
 * - Provides context for runs, leaderboards, and events
 * - Enables season-specific mechanics and rewards
 * - Supports historical tracking and analytics
 */
export const seasonsTable = pgTable("seasons", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 256 }).notNull(),
	description: text("description"),
	status: seasonStatus("status").notNull().default("upcoming"),
	start_date: timestamp("start_date", { withTimezone: true }).notNull(),
	end_date: timestamp("end_date", { withTimezone: true }).notNull(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

/**
 *  This is a read optimization pattern - leaderboards are read thousands of times but written once per run. The duplication is intentional and beneficial. No expensive JOINs needed when displaying leaderboards.
 * Leaderboard Table
 * Pre-computed leaderboard entries for completed runs
 * - Created when a run finishes to enable fast leaderboard queries
 * - Aggregates data from run_category_xp for simplified queries
 * - Eliminates need for complex JOINs in leaderboard displays
 */
export const leaderboardTable = pgTable("leaderboard", {
	id: serial("id").primaryKey(),
	user_id: uuid("user_id")
		.references(() => usersTable.id, { onDelete: "cascade" })
		.notNull(),
	run_id: integer("run_id")
		.references(() => runsTable.id, { onDelete: "cascade" })
		.notNull(), // Multiple leaderboard entries allowed for run history
	season_id: integer("season_id").references(() => seasonsTable.id, {
		onDelete: "set null",
	}), // Nullable for pre-season runs
	category_code: varchar("category_code", { length: 50 })
		.references(() => pollCategoriesTable.code)
		.notNull(), // Category for this leaderboard entry
	category_coverage: real("category_coverage").notNull().default(0), // Coverage % achieved in this category for this run
	total_coverage: real("total_coverage").notNull().default(0), // Overall coverage % for the run (for global leaderboards)
	best_streak: integer("best_streak").notNull().default(0),
	polls_answered: integer("polls_answered").notNull().default(0),
	completed_at: timestamp("completed_at", { withTimezone: true }).notNull(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Run Shop Offerings Table
 * Stores randomly generated shop configs per run per day
 * - Replaces seed-based deterministic generation with persisted random selection
 * - One offering per run + date + reroll combination
 * - is_locked: When true (yarn.lock config), offering persists across days until reroll
 */
export const runShopOfferingsTable = pgTable(
	"run_shop_offerings",
	{
		id: serial("id").primaryKey(),
		run_id: integer("run_id")
			.references(() => runsTable.id, { onDelete: "cascade" })
			.notNull(),
		date: varchar("date", { length: 10 }).notNull(), // "YYYY-MM-DD"
		reroll_number: integer("reroll_number").notNull().default(0),
		config_ids: json("config_ids").$type<string[]>().notNull(),
		is_locked: boolean("is_locked").notNull().default(false),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(table) => ({
		runDateRerollUnique: unique().on(
			table.run_id,
			table.date,
			table.reroll_number
		),
	})
);

/**
 * Daily Exposed Deck Table
 * Stores the randomly selected player's deck exposed to public-config holders each day
 * - One row per day (enforced by unique date)
 * - All users with public-config see the same player's deck
 * - Replaces seed-based selection with persisted random choice
 */
export const dailyExposedDeckTable = pgTable("daily_exposed_deck", {
	id: serial("id").primaryKey(),
	date: varchar("date", { length: 10 }).notNull().unique(), // "YYYY-MM-DD"
	run_id: integer("run_id")
		.references(() => runsTable.id, { onDelete: "cascade" })
		.notNull(),
	user_id: uuid("user_id")
		.references(() => usersTable.id, { onDelete: "cascade" })
		.notNull(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * User Awards Table
 * Permanent record of category run awards ever held by a player.
 * Once a player first holds a living-record award (e.g. "CSS Connoisseur"),
 * it is saved here permanently — re-earning it updates nothing, but the record stands.
 */
export const userAwardsTable = pgTable(
	"user_awards",
	{
		id: serial("id").primaryKey(),
		user_id: uuid("user_id")
			.references(() => usersTable.id, { onDelete: "cascade" })
			.notNull(),
		category_code: varchar("category_code", { length: 50 })
			.references(() => pollCategoriesTable.code)
			.notNull(),
		metric: varchar("metric", { length: 50 }).notNull(),
		first_earned_at: timestamp("first_earned_at", {
			withTimezone: true,
		})
			.defaultNow()
			.notNull(),
	},
	(table) => ({
		uniqueUserAward: unique().on(
			table.user_id,
			table.category_code,
			table.metric
		),
	})
);
