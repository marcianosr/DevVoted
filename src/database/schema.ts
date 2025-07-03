import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

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
 * - needs-revision: Reviewed but requires changes
 * - open: Currently accepting responses
 * - closed: No longer accepting responses
 * - archived: Historical poll, no longer relevant
 */
export const pollStatus = pgEnum("status", [
	"draft",
	"needs-revision",
	"open",
	"closed",
	"archived",
]);

export const runStatus = pgEnum("run_status", ["finished", "active"]);

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
	total_polls_submitted: integer("total_polls_submitted")
		.notNull()
		.default(0),
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
	status: pollStatus("status").notNull().default("draft"),
	answer_type: pollAnswerType("answer_type").notNull().default("single"),
	opening_time: timestamp("opening_time").notNull(),
	closing_time: timestamp("closing_time").notNull(),
	created_by: uuid("created_by")
		.references(() => usersTable.id, { onDelete: "set null" }) // Preserves poll history even if user is deleted
		.notNull(),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date()), // Automatically tracks last modification
	category_code: varchar("category_code", { length: 50 })
		.references(() => pollCategoriesTable.code)
		.notNull(),
});

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
 * - Enables streak and XP calculations
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
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

/**
 * User Category XP Table
 * Stands for tracking user's performance in a specific categories
 */
// export const pollUserPerformanceTable = pgTable(
// 	"polls_user_performance",
// 	{
// 		id: serial("id").primaryKey(),
// 		user_id: uuid("user_id")
// 			.references(() => usersTable.id, { onDelete: "cascade" })
// 			.notNull(),
// 		category_code: varchar("category_code", { length: 50 })
// 			.references(() => pollCategoriesTable.code)
// 			.notNull(),
// 		cumulative_xp: integer("cumulative_xp").notNull().default(0),
// 		best_xp: integer("best_xp").notNull().default(0),
// 		best_streak: integer("best_streak").notNull().default(0),
// 		best_multiplier: decimal("best_multiplier", { precision: 3, scale: 1 })
// 			.notNull()
// 			.default("0.0"),
// 		betting_average: decimal("betting_average", { precision: 4, scale: 1 }) // Allows values like 3.5, 12.6, 75.0
// 			.notNull()
// 			.default("0.0"),
// 		created_at: timestamp("created_at").defaultNow(),
// 		updated_at: timestamp("updated_at")
// 			.defaultNow()
// 			.$onUpdate(() => new Date()),
// 	},
// 	(table) => {
// 		return {
// 			userCategoryUnique: unique().on(table.user_id, table.category_code),
// 		};
// 	}
// );
