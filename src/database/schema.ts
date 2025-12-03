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
export const userRoles = pgEnum("roles", ["user", "admin"] as const);

/**
 * Poll status types to track the lifecycle of each poll
 * - draft: Initial state, not yet published
 * - open: Currently accepting responses
 * - closed: No longer accepting responses
 * - archived: Historical poll, no longer relevant
 */
export const pollStatus = pgEnum("status", [
	"draft",
	"open",
	"closed",
	"archived",
]);

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
	code_block: text("code_block"),
	code_sandbox_example: text("code_sandbox_example"),
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
 * - Maintains response history even if user is deleted
 * - Enables streak and coverage calculations
 * - Automatically updates timestamps for analytics
 */
export const pollResponsesTable = pgTable("polls_responses", {
	response_id: serial("response_id").primaryKey(),
	poll_id: integer("poll_id")
		.references(() => pollsTable.id, { onDelete: "cascade" })
		.notNull(),
	user_id: uuid("user_id").references(() => usersTable.id, {
		onDelete: "set null",
	}),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

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
	completion_reason: varchar("completion_reason", { length: 50 }), // Reason for run completion: "victory", "threshold_not_met", "wrong_answer", "manual_break_off"
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
