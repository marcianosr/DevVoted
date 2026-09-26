import { sql } from "drizzle-orm";
import {
	bigint,
	boolean,
	date,
	integer,
	json,
	index,
	pgEnum,
	pgTable,
	primaryKey,
	real,
	serial,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { STORAGE_UNITS } from "~/shared/lib/storage";

export const userRoles = pgEnum("roles", [
	"user",
	"poll-editor",
	"admin",
] as const);

export const pollStatus = pgEnum("status", ["draft", "published", "archived"]);

export const runStatus = pgEnum("run_status", ["finished", "active"]);

export const seasonStatus = pgEnum("season_status", [
	"upcoming",
	"active",
	"finished",
	"archived",
] as const);

export const pollAnswerType = pgEnum("answer_type", [
	"single",
	"multiple",
] as const);

export const pollAnswerOutcome = pgEnum("answer_outcome", [
	"correct",
	"partial",
	"wrong",
] as const);

export const visitDevice = pgEnum("visit_device", [
	"desktop",
	"mobile",
	"tablet",
	"bot",
] as const);

export const usersTable = pgTable("users", {
	id: uuid("id").primaryKey(),
	display_name: varchar("display_name", { length: 256 }).notNull(),
	email: varchar("email", { length: 256 }).notNull().unique(),
	photo_url: text("photo_url"),
	github_username: varchar("github_username", { length: 100 }),
	role: userRoles("roles").notNull().default("user"),
	total_polls_submitted: integer("total_polls_submitted").notNull().default(0),
	archived_storage: bigint("archived_storage", { mode: "number" })
		.notNull()
		.default(0),
	legacy_bonus_bytes: bigint("legacy_bonus_bytes", { mode: "number" }),
	peak_storage_kb: integer("peak_storage_kb").notNull().default(0),
	owned_border_ids: text("owned_border_ids")
		.array()
		.notNull()
		.default(sql`'{}'::text[]`),
	equipped_border_id: text("equipped_border_id"),
	equipped_title_ids: text("equipped_title_ids")
		.array()
		.notNull()
		.default(sql`'{}'::text[]`),
	owned_swatch_ids: text("owned_swatch_ids")
		.array()
		.notNull()
		.default(sql`'{}'::text[]`),
	pinned_gate: integer("pinned_gate"),
	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	last_seen_at: timestamp("last_seen_at", { withTimezone: true }),
});

export const userConfigUnlocksTable = pgTable(
	"user_config_unlocks",
	{
		user_id: uuid("user_id")
			.references(() => usersTable.id, { onDelete: "cascade" })
			.notNull(),
		config_id: varchar("config_id", { length: 64 }).notNull(),
		via_metric: varchar("via_metric", { length: 64 }),
		unlocked_at: timestamp("unlocked_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		first_installed_at: timestamp("first_installed_at", {
			withTimezone: true,
		}),
	},
	(table) => [primaryKey({ columns: [table.user_id, table.config_id] })]
);

export const userServiceUnlocksTable = pgTable(
	"user_service_unlocks",
	{
		user_id: uuid("user_id")
			.references(() => usersTable.id, { onDelete: "cascade" })
			.notNull(),
		service_id: varchar("service_id", { length: 64 }).notNull(),
		via_metric: varchar("via_metric", { length: 64 }),
		unlocked_at: timestamp("unlocked_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [primaryKey({ columns: [table.user_id, table.service_id] })]
);

export const userObjectiveProgressTable = pgTable(
	"user_objective_progress",
	{
		user_id: uuid("user_id")
			.references(() => usersTable.id, { onDelete: "cascade" })
			.notNull(),
		metric: varchar("metric", { length: 64 }).notNull(),
		count: integer("count").notNull().default(0),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [primaryKey({ columns: [table.user_id, table.metric] })]
);

export const userTitlesTable = pgTable(
	"user_titles",
	{
		user_id: uuid("user_id")
			.references(() => usersTable.id, { onDelete: "cascade" })
			.notNull(),
		title_id: varchar("title_id", { length: 64 }).notNull(),
		exclusive: boolean("exclusive").notNull().default(false),
		earned_at: timestamp("earned_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		announced_at: timestamp("announced_at", { withTimezone: true }),
	},
	(table) => [
		primaryKey({ columns: [table.user_id, table.title_id] }),
		uniqueIndex("user_titles_exclusive_title")
			.on(table.title_id)
			.where(sql`${table.exclusive}`),
	]
);

export const pollsTable = pgTable("polls", {
	id: serial("id").primaryKey(),
	question: text("question").notNull(),
	poll_number: integer("poll_number"),
	code_block: text("code_block"),
	code_sandbox_example: text("code_sandbox_example"),
	explanation: text("explanation"),
	status: pollStatus("status").notNull().default("draft"),
	answer_type: pollAnswerType("answer_type").notNull().default("single"),
	opening_time: timestamp("opening_time", { withTimezone: true }).notNull(),
	closing_time: timestamp("closing_time", { withTimezone: true }).notNull(),
	created_by: uuid("created_by")
		.references(() => usersTable.id, { onDelete: "set null" })
		.notNull(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
	category_code: varchar("category_code", { length: 50 })
		.references(() => pollCategoriesTable.code)
		.notNull(),
});

export const dailyPollsTable = pgTable("daily_polls", {
	id: serial("id").primaryKey(),
	date: varchar("date", { length: 10 }).notNull().unique(),
	poll_id: integer("poll_id").references(() => pollsTable.id, {
		onDelete: "cascade",
	}),
	category_weights: json("category_weights").$type<Record<string, number>>(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

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

export const pollOptionsTable = pgTable("polls_options", {
	id: serial("id").primaryKey().notNull(),
	poll_id: integer("poll_id")
		.references(() => pollsTable.id, { onDelete: "cascade" })
		.notNull(),
	option: text("option").notNull(),
	correct: boolean("correct").notNull().default(false),
});

export const pollCategoriesTable = pgTable("polls_categories", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 256 }).notNull(),
	code: varchar("code", { length: 256 }).notNull().unique(),
});

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
		}),
		mode: varchar("mode", { length: 16 })
			.notNull()
			.default("calendar")
			.$type<"calendar" | "session">(),
		coverage_delta: real("coverage_delta"),
		answer_time_ms: integer("answer_time_ms"),
		mirrored: boolean("mirrored").notNull().default(false),
		outcome: pollAnswerOutcome("outcome"),
		score_breakdown:
			json("score_breakdown").$type<
				import("~/database/scoreBreakdown").ScoreCalculation
			>(),
		answer_date: varchar("answer_date", { length: 10 }).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		uniqueCalendarDaily: uniqueIndex("polls_responses_calendar_daily_uniq")
			.on(table.poll_id, table.user_id, table.answer_date)
			.where(sql`${table.mode} = 'calendar'`),
		uniqueSessionRunPoll: uniqueIndex("polls_responses_session_run_poll_uniq")
			.on(table.run_id, table.poll_id)
			.where(sql`${table.mode} = 'session'`),
	})
);

export const runsTable = pgTable("runs", {
	id: serial("id").primaryKey(),
	user_id: uuid("user_id")
		.references(() => usersTable.id, { onDelete: "cascade" })
		.notNull(),
	season_id: integer("season_id").references(() => seasonsTable.id, {
		onDelete: "set null",
	}),
	status: runStatus("status").notNull().default("active"),
	mode: varchar("mode", { length: 16 })
		.notNull()
		.default("calendar")
		.$type<"calendar" | "session">(),
	storage_limit: integer("storage_limit").notNull().default(STORAGE_UNITS.MB),
	injected_archive_bytes: integer("injected_archive_bytes")
		.notNull()
		.default(0),
	active_config_ids: json("active_config_ids")
		.$type<string[]>()
		.notNull()
		.default([]),
	rerolls: integer("rerolls").notNull().default(0),
	total_rerolls: integer("total_rerolls").notNull().default(0),
	reroll_storage_used: integer("reroll_storage_used").notNull().default(0),
	shop_skipped_date: varchar("shop_skipped_date", { length: 10 }),
	shop_interacted_date: varchar("shop_interacted_date", { length: 10 }),
	deinstall_penalty: integer("deinstall_penalty").notNull().default(0),
	correct_polls_count: integer("correct_polls_count").notNull().default(0),
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
		.default([]),
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
		.default([]),
	pending_upgrade_cards: json("pending_upgrade_cards").$type<
		Array<{
			kind: string;
			slot: object;
			gateTypeId?: string;
			from?: string;
			to?: string;
		}>
	>(),
	seed_date: varchar("seed_date", { length: 10 }),
	completion_reason: text("completion_reason"),
	victory_achieved_at: timestamp("victory_achieved_at", {
		withTimezone: true,
	}),
	looted_by_user_id: uuid("looted_by_user_id").references(() => usersTable.id, {
		onDelete: "set null",
	}),
	looted_at: timestamp("looted_at", { withTimezone: true }),
	loot_amount: integer("loot_amount"),
	started_at: timestamp("started_at", { withTimezone: true }).defaultNow(),
	finished_at: timestamp("finished_at", { withTimezone: true }),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const runStatesTable = pgTable("run_states", {
	id: serial("id").primaryKey(),
	run_id: integer("run_id")
		.references(() => runsTable.id, { onDelete: "cascade" })
		.notNull()
		.unique(),
	state: json("state")
		.$type<import("~/modules/run/run/domain/runSnapshot.model").RunSnapshot>()
		.notNull(),
	engine_status: varchar("engine_status", { length: 16 })
		.notNull()
		.$type<import("~/modules/run/run/domain/run.model").RunStatus>(),
	gates_cleared: integer("gates_cleared").notNull().default(0),
	coverage: real("coverage").notNull().default(0),
	polls_answered: integer("polls_answered").notNull().default(0),
	engine_version: integer("engine_version").notNull().default(1),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const auditIncidentStatus = pgEnum("audit_incident_status", [
	"queued",
	"locked",
	"survived",
	"failed",
	"lapsed",
]);

export const auditIncidentsTable = pgTable(
	"audit_incidents",
	{
		id: serial("id").primaryKey(),
		sent_by_user_id: uuid("sent_by_user_id")
			.references(() => usersTable.id, { onDelete: "cascade" })
			.notNull(),
		target_user_id: uuid("target_user_id")
			.references(() => usersTable.id, { onDelete: "cascade" })
			.notNull(),
		target_run_id: integer("target_run_id")
			.references(() => runsTable.id, { onDelete: "cascade" })
			.notNull(),
		target_gate: integer("target_gate").notNull(),
		audit_id: varchar("audit_id", { length: 32 })
			.notNull()
			.$type<import("~/modules/run/gate/domain/audit.model").AuditId>(),
		status: auditIncidentStatus("status").notNull().default("queued"),
		created_at: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		locked_at: timestamp("locked_at", { withTimezone: true }),
	},
	(table) => [
		index("audit_incidents_target_queue_idx").on(
			table.target_run_id,
			table.target_gate,
			table.status
		),
		index("audit_incidents_created_idx").on(table.created_at),
	]
);

export const dailyRunSeedsTable = pgTable("daily_run_seeds", {
	id: serial("id").primaryKey(),
	date: varchar("date", { length: 10 }).notNull().unique(),
	seed: varchar("seed", { length: 64 }).notNull(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const dailyRunPollsTable = pgTable(
	"daily_run_polls",
	{
		id: serial("id").primaryKey(),
		date: varchar("date", { length: 10 }).notNull(),
		position: integer("position").notNull(),
		poll_id: integer("poll_id")
			.references(() => pollsTable.id, { onDelete: "restrict" })
			.notNull(),
	},
	(table) => [
		unique().on(table.date, table.position),
		unique().on(table.date, table.poll_id),
	]
);

export const runPollsTable = pgTable(
	"run_polls",
	{
		id: serial("id").primaryKey(),
		run_id: integer("run_id")
			.references(() => runsTable.id, { onDelete: "cascade" })
			.notNull(),
		position: integer("position").notNull(),
		poll_id: integer("poll_id")
			.references(() => pollsTable.id, { onDelete: "restrict" })
			.notNull(),
		segment_date: varchar("segment_date", { length: 10 }).notNull(),
	},
	(table) => [unique().on(table.run_id, table.position)]
);

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
		correct_polls_answered: integer("correct_polls_answered")
			.notNull()
			.default(0),
		final_coverage: real("final_coverage"),
		final_streak: integer("final_streak"),
		final_polls_answered: integer("final_polls_answered"),
		final_correct_polls_answered: integer("final_correct_polls_answered"),
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

export const leaderboardTable = pgTable("leaderboard", {
	id: serial("id").primaryKey(),
	user_id: uuid("user_id")
		.references(() => usersTable.id, { onDelete: "cascade" })
		.notNull(),
	run_id: integer("run_id")
		.references(() => runsTable.id, { onDelete: "cascade" })
		.notNull(),
	season_id: integer("season_id").references(() => seasonsTable.id, {
		onDelete: "set null",
	}),
	category_code: varchar("category_code", { length: 50 })
		.references(() => pollCategoriesTable.code)
		.notNull(),
	category_coverage: real("category_coverage").notNull().default(0),
	total_coverage: real("total_coverage").notNull().default(0),
	best_streak: integer("best_streak").notNull().default(0),
	polls_answered: integer("polls_answered").notNull().default(0),
	completed_at: timestamp("completed_at", { withTimezone: true }).notNull(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const runShopOfferingsTable = pgTable(
	"run_shop_offerings",
	{
		id: serial("id").primaryKey(),
		run_id: integer("run_id")
			.references(() => runsTable.id, { onDelete: "cascade" })
			.notNull(),
		date: varchar("date", { length: 10 }).notNull(),
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

export const dailyExposedDeckTable = pgTable("daily_exposed_deck", {
	id: serial("id").primaryKey(),
	date: varchar("date", { length: 10 }).notNull().unique(),
	run_id: integer("run_id")
		.references(() => runsTable.id, { onDelete: "cascade" })
		.notNull(),
	user_id: uuid("user_id")
		.references(() => usersTable.id, { onDelete: "cascade" })
		.notNull(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const appVisitsTable = pgTable(
	"app_visits",
	{
		id: serial("id").primaryKey(),
		visit_date: date("visit_date", { mode: "string" }).notNull(),
		visitor_hash: varchar("visitor_hash", { length: 32 }).notNull(),
		route_id: varchar("route_id", { length: 64 }).notNull(),
		user_id: uuid("user_id").references(() => usersTable.id, {
			onDelete: "set null",
		}),
		hits: integer("hits").notNull().default(1),
		device: visitDevice("device").notNull().default("desktop"),
		country: varchar("country", { length: 2 }),
		referrer_host: varchar("referrer_host", { length: 255 }),
		first_seen_at: timestamp("first_seen_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		last_seen_at: timestamp("last_seen_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		uniqueIndex("app_visits_day_visitor_route_uniq").on(
			table.visit_date,
			table.visitor_hash,
			table.route_id
		),
		index("app_visits_day_route_idx").on(table.visit_date, table.route_id),
		index("app_visits_user_day_idx")
			.on(table.user_id, table.visit_date)
			.where(sql`${table.user_id} is not null`),
	]
);
