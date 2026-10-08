DO $baseline$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls'
  ) THEN
    RAISE NOTICE 'Base schema already exists — skipping baseline migration';
    RETURN;
  END IF;

  CREATE TYPE "public"."answer_outcome" AS ENUM (
      'correct',
      'partial',
      'wrong'
  );

  ALTER TYPE "public"."answer_outcome" OWNER TO "postgres";

  CREATE TYPE "public"."answer_type" AS ENUM (
      'single',
      'multiple'
  );

  ALTER TYPE "public"."answer_type" OWNER TO "postgres";

  CREATE TYPE "public"."audit_incident_status" AS ENUM (
      'queued',
      'locked',
      'survived',
      'failed',
      'lapsed'
  );

  ALTER TYPE "public"."audit_incident_status" OWNER TO "postgres";

  CREATE TYPE "public"."roles" AS ENUM (
      'user',
      'admin',
      'poll-editor'
  );

  ALTER TYPE "public"."roles" OWNER TO "postgres";

  CREATE TYPE "public"."run_status" AS ENUM (
      'finished',
      'active'
  );

  ALTER TYPE "public"."run_status" OWNER TO "postgres";

  CREATE TYPE "public"."season_status" AS ENUM (
      'upcoming',
      'active',
      'finished',
      'archived'
  );

  ALTER TYPE "public"."season_status" OWNER TO "postgres";

  CREATE TYPE "public"."status" AS ENUM (
      'draft',
      'published',
      'archived'
  );

  ALTER TYPE "public"."status" OWNER TO "postgres";

  CREATE TYPE "public"."visit_device" AS ENUM (
      'desktop',
      'mobile',
      'tablet',
      'bot'
  );

  ALTER TYPE "public"."visit_device" OWNER TO "postgres";

  CREATE TABLE IF NOT EXISTS "public"."active_tech_debts" (
      "id" integer NOT NULL,
      "run_id" integer NOT NULL,
      "template_id" character varying(64) NOT NULL,
      "acquired_at" timestamp with time zone DEFAULT "now"() NOT NULL,
      "progress_state" json NOT NULL
  );

  ALTER TABLE "public"."active_tech_debts" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."active_tech_debts_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."active_tech_debts_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."active_tech_debts_id_seq" OWNED BY "public"."active_tech_debts"."id";

  CREATE TABLE IF NOT EXISTS "public"."app_visits" (
      "id" integer NOT NULL,
      "visit_date" "date" NOT NULL,
      "visitor_hash" character varying(32) NOT NULL,
      "route_id" character varying(64) NOT NULL,
      "user_id" "uuid",
      "hits" integer DEFAULT 1 NOT NULL,
      "device" "public"."visit_device" DEFAULT 'desktop'::"public"."visit_device" NOT NULL,
      "country" character varying(2),
      "referrer_host" character varying(255),
      "first_seen_at" timestamp with time zone DEFAULT "now"() NOT NULL,
      "last_seen_at" timestamp with time zone DEFAULT "now"() NOT NULL
  );

  ALTER TABLE "public"."app_visits" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."app_visits_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."app_visits_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."app_visits_id_seq" OWNED BY "public"."app_visits"."id";

  CREATE TABLE IF NOT EXISTS "public"."audit_incidents" (
      "id" integer NOT NULL,
      "sent_by_user_id" "uuid" NOT NULL,
      "target_user_id" "uuid" NOT NULL,
      "target_run_id" integer NOT NULL,
      "target_gate" integer NOT NULL,
      "audit_id" character varying(32) NOT NULL,
      "status" "public"."audit_incident_status" DEFAULT 'queued'::"public"."audit_incident_status" NOT NULL,
      "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
      "locked_at" timestamp with time zone
  );

  ALTER TABLE "public"."audit_incidents" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."audit_incidents_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."audit_incidents_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."audit_incidents_id_seq" OWNED BY "public"."audit_incidents"."id";

  CREATE TABLE IF NOT EXISTS "public"."daily_exposed_deck" (
      "id" integer NOT NULL,
      "date" character varying(10) NOT NULL,
      "run_id" integer NOT NULL,
      "user_id" "uuid" NOT NULL,
      "created_at" timestamp with time zone DEFAULT "now"()
  );

  ALTER TABLE "public"."daily_exposed_deck" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."daily_exposed_deck_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."daily_exposed_deck_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."daily_exposed_deck_id_seq" OWNED BY "public"."daily_exposed_deck"."id";

  CREATE TABLE IF NOT EXISTS "public"."daily_polls" (
      "id" integer NOT NULL,
      "date" character varying(10) NOT NULL,
      "poll_id" integer,
      "created_at" timestamp with time zone DEFAULT "now"(),
      "category_weights" json
  );

  ALTER TABLE "public"."daily_polls" OWNER TO "postgres";

  COMMENT ON COLUMN "public"."daily_polls"."poll_id" IS 'Selected poll - nullable until poll is chosen using weights';

  COMMENT ON COLUMN "public"."daily_polls"."category_weights" IS 'Snapshot of global category weights at end of previous day';

  CREATE SEQUENCE IF NOT EXISTS "public"."daily_polls_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."daily_polls_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."daily_polls_id_seq" OWNED BY "public"."daily_polls"."id";

  CREATE TABLE IF NOT EXISTS "public"."daily_run_polls" (
      "id" integer NOT NULL,
      "date" character varying(10) NOT NULL,
      "position" integer NOT NULL,
      "poll_id" integer NOT NULL
  );

  ALTER TABLE "public"."daily_run_polls" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."daily_run_polls_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."daily_run_polls_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."daily_run_polls_id_seq" OWNED BY "public"."daily_run_polls"."id";

  CREATE TABLE IF NOT EXISTS "public"."daily_run_seeds" (
      "id" integer NOT NULL,
      "date" character varying(10) NOT NULL,
      "seed" character varying(64) NOT NULL,
      "created_at" timestamp with time zone DEFAULT "now"()
  );

  ALTER TABLE "public"."daily_run_seeds" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."daily_run_seeds_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."daily_run_seeds_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."daily_run_seeds_id_seq" OWNED BY "public"."daily_run_seeds"."id";

  CREATE TABLE IF NOT EXISTS "public"."leaderboard" (
      "id" integer NOT NULL,
      "user_id" "uuid" NOT NULL,
      "run_id" integer NOT NULL,
      "season_id" integer,
      "category_code" character varying(50) NOT NULL,
      "category_coverage" real DEFAULT 0 NOT NULL,
      "total_coverage" real DEFAULT 0 NOT NULL,
      "best_streak" integer DEFAULT 0 NOT NULL,
      "polls_answered" integer DEFAULT 0 NOT NULL,
      "completed_at" timestamp with time zone NOT NULL,
      "created_at" timestamp with time zone DEFAULT "now"()
  );

  ALTER TABLE "public"."leaderboard" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."leaderboard_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."leaderboard_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."leaderboard_id_seq" OWNED BY "public"."leaderboard"."id";

  CREATE TABLE IF NOT EXISTS "public"."polls" (
      "id" integer NOT NULL,
      "question" "text" NOT NULL,
      "status" "public"."status" DEFAULT 'draft'::"public"."status" NOT NULL,
      "answer_type" "public"."answer_type" DEFAULT 'single'::"public"."answer_type" NOT NULL,
      "opening_time" timestamp with time zone NOT NULL,
      "closing_time" timestamp with time zone NOT NULL,
      "created_by" "uuid" NOT NULL,
      "created_at" timestamp with time zone DEFAULT "now"(),
      "updated_at" timestamp with time zone DEFAULT "now"(),
      "category_code" character varying(50) NOT NULL,
      "poll_number" integer,
      "code_block" "text",
      "code_sandbox_example" "text",
      "explanation" "text",
      "author_paid_at" timestamp with time zone,
      "author_announced_at" timestamp with time zone,
      "reviewed_at" timestamp with time zone,
      "author_reward_kb" integer DEFAULT 16 NOT NULL
  );

  ALTER TABLE "public"."polls" OWNER TO "postgres";

  CREATE TABLE IF NOT EXISTS "public"."polls_categories" (
      "id" integer NOT NULL,
      "name" character varying(256) NOT NULL,
      "code" character varying(256) NOT NULL
  );

  ALTER TABLE "public"."polls_categories" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."polls_categories_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."polls_categories_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."polls_categories_id_seq" OWNED BY "public"."polls_categories"."id";

  CREATE TABLE IF NOT EXISTS "public"."polls_history" (
      "id" integer NOT NULL,
      "poll_id" integer NOT NULL,
      "user_id" "uuid" NOT NULL,
      "times_seen" integer DEFAULT 1 NOT NULL,
      "times_answered" integer DEFAULT 0 NOT NULL,
      "first_seen_at" timestamp with time zone DEFAULT "now"() NOT NULL,
      "last_seen_at" timestamp with time zone DEFAULT "now"() NOT NULL,
      "last_answered_at" timestamp with time zone,
      "run_id" integer NOT NULL
  );

  ALTER TABLE "public"."polls_history" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."polls_history_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."polls_history_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."polls_history_id_seq" OWNED BY "public"."polls_history"."id";

  CREATE SEQUENCE IF NOT EXISTS "public"."polls_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."polls_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."polls_id_seq" OWNED BY "public"."polls"."id";

  CREATE TABLE IF NOT EXISTS "public"."polls_options" (
      "id" integer NOT NULL,
      "poll_id" integer NOT NULL,
      "option" "text" NOT NULL,
      "correct" boolean DEFAULT false NOT NULL
  );

  ALTER TABLE "public"."polls_options" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."polls_options_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."polls_options_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."polls_options_id_seq" OWNED BY "public"."polls_options"."id";

  CREATE TABLE IF NOT EXISTS "public"."polls_response_options" (
      "id" integer NOT NULL,
      "response_id" integer NOT NULL,
      "option_id" integer NOT NULL
  );

  ALTER TABLE "public"."polls_response_options" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."polls_response_options_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."polls_response_options_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."polls_response_options_id_seq" OWNED BY "public"."polls_response_options"."id";

  CREATE TABLE IF NOT EXISTS "public"."polls_responses" (
      "response_id" integer NOT NULL,
      "poll_id" integer NOT NULL,
      "user_id" "uuid",
      "created_at" timestamp with time zone DEFAULT "now"(),
      "updated_at" timestamp with time zone DEFAULT "now"(),
      "run_id" integer,
      "answer_date" character varying(10) NOT NULL,
      "coverage_delta" real,
      "score_breakdown" json,
      "mode" character varying(16) DEFAULT 'calendar'::character varying NOT NULL,
      "answer_time_ms" integer,
      "mirrored" boolean DEFAULT false NOT NULL,
      "outcome" "public"."answer_outcome"
  );

  ALTER TABLE "public"."polls_responses" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."polls_responses_response_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."polls_responses_response_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."polls_responses_response_id_seq" OWNED BY "public"."polls_responses"."response_id";

  CREATE TABLE IF NOT EXISTS "public"."run_category_coverage" (
      "id" integer NOT NULL,
      "run_id" integer NOT NULL,
      "category_code" character varying(50) NOT NULL,
      "current_coverage" real DEFAULT 0 NOT NULL,
      "current_streak" integer DEFAULT 0 NOT NULL,
      "best_streak" integer DEFAULT 0 NOT NULL,
      "polls_answered" integer DEFAULT 0 NOT NULL,
      "final_coverage" real,
      "final_streak" integer,
      "final_polls_answered" integer,
      "created_at" timestamp with time zone DEFAULT "now"(),
      "updated_at" timestamp with time zone DEFAULT "now"(),
      "correct_polls_answered" integer DEFAULT 0 NOT NULL,
      "final_correct_polls_answered" integer
  );

  ALTER TABLE "public"."run_category_coverage" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."run_category_coverage_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."run_category_coverage_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."run_category_coverage_id_seq" OWNED BY "public"."run_category_coverage"."id";

  CREATE TABLE IF NOT EXISTS "public"."run_polls" (
      "id" integer NOT NULL,
      "run_id" integer NOT NULL,
      "position" integer NOT NULL,
      "poll_id" integer NOT NULL,
      "segment_date" character varying(10) NOT NULL
  );

  ALTER TABLE "public"."run_polls" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."run_polls_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."run_polls_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."run_polls_id_seq" OWNED BY "public"."run_polls"."id";

  CREATE TABLE IF NOT EXISTS "public"."run_shop_offerings" (
      "id" integer NOT NULL,
      "run_id" integer NOT NULL,
      "date" character varying(10) NOT NULL,
      "reroll_number" integer DEFAULT 0 NOT NULL,
      "config_ids" "jsonb" NOT NULL,
      "is_locked" boolean DEFAULT false NOT NULL,
      "created_at" timestamp with time zone DEFAULT "now"()
  );

  ALTER TABLE "public"."run_shop_offerings" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."run_shop_offerings_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."run_shop_offerings_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."run_shop_offerings_id_seq" OWNED BY "public"."run_shop_offerings"."id";

  CREATE TABLE IF NOT EXISTS "public"."run_states" (
      "id" integer NOT NULL,
      "run_id" integer NOT NULL,
      "state" json NOT NULL,
      "engine_status" character varying(16) NOT NULL,
      "gates_cleared" integer DEFAULT 0 NOT NULL,
      "coverage" real DEFAULT 0 NOT NULL,
      "polls_answered" integer DEFAULT 0 NOT NULL,
      "engine_version" integer DEFAULT 1 NOT NULL,
      "created_at" timestamp with time zone DEFAULT "now"(),
      "updated_at" timestamp with time zone DEFAULT "now"()
  );

  ALTER TABLE "public"."run_states" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."run_states_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."run_states_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."run_states_id_seq" OWNED BY "public"."run_states"."id";

  CREATE TABLE IF NOT EXISTS "public"."runs" (
      "id" integer NOT NULL,
      "user_id" "uuid" NOT NULL,
      "season_id" integer,
      "status" "public"."run_status" DEFAULT 'active'::"public"."run_status" NOT NULL,
      "storage_limit" integer DEFAULT 1048576 NOT NULL,
      "active_config_ids" json DEFAULT '[]'::json NOT NULL,
      "rerolls" integer DEFAULT 0 NOT NULL,
      "total_rerolls" integer DEFAULT 0 NOT NULL,
      "reroll_storage_used" integer DEFAULT 0 NOT NULL,
      "completion_reason" "text",
      "started_at" timestamp with time zone DEFAULT "now"(),
      "finished_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT "now"(),
      "updated_at" timestamp with time zone DEFAULT "now"(),
      "shop_skipped_date" character varying(10),
      "shop_interacted_date" character varying(10),
      "deinstall_penalty" integer DEFAULT 0 NOT NULL,
      "correct_polls_count" integer DEFAULT 0 NOT NULL,
      "victory_achieved_at" timestamp with time zone,
      "pipeline_slots" json DEFAULT '[]'::json NOT NULL,
      "pending_upgrade_cards" json,
      "pipeline_slot_snapshots" json DEFAULT '[]'::json NOT NULL,
      "looted_by_user_id" "uuid",
      "looted_at" timestamp with time zone,
      "loot_amount" integer,
      "injected_archive_bytes" integer DEFAULT 0 NOT NULL,
      "discounted_config_ids" json DEFAULT '[]'::json NOT NULL,
      "mode" character varying(16) DEFAULT 'calendar'::character varying NOT NULL,
      "seed_date" character varying(10)
  );

  ALTER TABLE "public"."runs" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."runs_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."runs_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."runs_id_seq" OWNED BY "public"."runs"."id";

  CREATE TABLE IF NOT EXISTS "public"."seasons" (
      "id" integer NOT NULL,
      "name" character varying(256) NOT NULL,
      "description" "text",
      "status" "public"."season_status" DEFAULT 'upcoming'::"public"."season_status" NOT NULL,
      "start_date" timestamp with time zone NOT NULL,
      "end_date" timestamp with time zone NOT NULL,
      "created_at" timestamp with time zone DEFAULT "now"(),
      "updated_at" timestamp with time zone DEFAULT "now"()
  );

  ALTER TABLE "public"."seasons" OWNER TO "postgres";

  CREATE SEQUENCE IF NOT EXISTS "public"."seasons_id_seq"
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;

  ALTER SEQUENCE "public"."seasons_id_seq" OWNER TO "postgres";

  ALTER SEQUENCE "public"."seasons_id_seq" OWNED BY "public"."seasons"."id";

  CREATE TABLE IF NOT EXISTS "public"."user_config_unlocks" (
      "user_id" "uuid" NOT NULL,
      "config_id" character varying(64) NOT NULL,
      "via_metric" character varying(64),
      "unlocked_at" timestamp with time zone DEFAULT "now"() NOT NULL,
      "first_installed_at" timestamp with time zone
  );

  ALTER TABLE "public"."user_config_unlocks" OWNER TO "postgres";

  CREATE TABLE IF NOT EXISTS "public"."user_objective_progress" (
      "user_id" "uuid" NOT NULL,
      "metric" character varying(64) NOT NULL,
      "count" integer DEFAULT 0 NOT NULL,
      "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
  );

  ALTER TABLE "public"."user_objective_progress" OWNER TO "postgres";

  CREATE TABLE IF NOT EXISTS "public"."user_service_unlocks" (
      "user_id" "uuid" NOT NULL,
      "service_id" character varying(64) NOT NULL,
      "via_metric" character varying(64),
      "unlocked_at" timestamp with time zone DEFAULT "now"() NOT NULL
  );

  ALTER TABLE "public"."user_service_unlocks" OWNER TO "postgres";

  CREATE TABLE IF NOT EXISTS "public"."user_titles" (
      "user_id" "uuid" NOT NULL,
      "title_id" character varying(64) NOT NULL,
      "exclusive" boolean DEFAULT false NOT NULL,
      "earned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
      "announced_at" timestamp with time zone
  );

  ALTER TABLE "public"."user_titles" OWNER TO "postgres";

  CREATE TABLE IF NOT EXISTS "public"."users" (
      "id" "uuid" NOT NULL,
      "display_name" character varying(256) NOT NULL,
      "email" character varying(256) NOT NULL,
      "photo_url" "text",
      "roles" "public"."roles" DEFAULT 'user'::"public"."roles" NOT NULL,
      "total_polls_submitted" integer DEFAULT 0 NOT NULL,
      "github_username" character varying(100),
      "archived_storage" bigint DEFAULT 0 NOT NULL,
      "owned_border_ids" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
      "equipped_border_id" "text",
      "owned_swatch_ids" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
      "pinned_gate" integer,
      "peak_storage_kb" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
      "last_seen_at" timestamp with time zone,
      "legacy_bonus_bytes" bigint,
      "equipped_title_ids" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
      "equipped_swatch_id" "text"
  );

  ALTER TABLE "public"."users" OWNER TO "postgres";

  ALTER TABLE ONLY "public"."active_tech_debts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."active_tech_debts_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."app_visits" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."app_visits_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."audit_incidents" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."audit_incidents_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."daily_exposed_deck" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."daily_exposed_deck_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."daily_polls" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."daily_polls_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."daily_run_polls" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."daily_run_polls_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."daily_run_seeds" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."daily_run_seeds_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."leaderboard" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."leaderboard_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."polls" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."polls_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."polls_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."polls_categories_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."polls_history" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."polls_history_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."polls_options" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."polls_options_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."polls_response_options" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."polls_response_options_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."polls_responses" ALTER COLUMN "response_id" SET DEFAULT "nextval"('"public"."polls_responses_response_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."run_category_coverage" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."run_category_coverage_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."run_polls" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."run_polls_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."run_shop_offerings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."run_shop_offerings_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."run_states" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."run_states_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."runs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."runs_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."seasons" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."seasons_id_seq"'::"regclass");

  ALTER TABLE ONLY "public"."active_tech_debts"
      ADD CONSTRAINT "active_tech_debts_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."app_visits"
      ADD CONSTRAINT "app_visits_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."audit_incidents"
      ADD CONSTRAINT "audit_incidents_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."daily_exposed_deck"
      ADD CONSTRAINT "daily_exposed_deck_date_key" UNIQUE ("date");

  ALTER TABLE ONLY "public"."daily_exposed_deck"
      ADD CONSTRAINT "daily_exposed_deck_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."daily_polls"
      ADD CONSTRAINT "daily_polls_date_key" UNIQUE ("date");

  ALTER TABLE ONLY "public"."daily_polls"
      ADD CONSTRAINT "daily_polls_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."daily_run_polls"
      ADD CONSTRAINT "daily_run_polls_date_poll_id_unique" UNIQUE ("date", "poll_id");

  ALTER TABLE ONLY "public"."daily_run_polls"
      ADD CONSTRAINT "daily_run_polls_date_position_unique" UNIQUE ("date", "position");

  ALTER TABLE ONLY "public"."daily_run_polls"
      ADD CONSTRAINT "daily_run_polls_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."daily_run_seeds"
      ADD CONSTRAINT "daily_run_seeds_date_key" UNIQUE ("date");

  ALTER TABLE ONLY "public"."daily_run_seeds"
      ADD CONSTRAINT "daily_run_seeds_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."leaderboard"
      ADD CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."polls_categories"
      ADD CONSTRAINT "polls_categories_code_unique" UNIQUE ("code");

  ALTER TABLE ONLY "public"."polls_categories"
      ADD CONSTRAINT "polls_categories_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."polls_history"
      ADD CONSTRAINT "polls_history_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."polls_history"
      ADD CONSTRAINT "polls_history_run_id_poll_id_unique" UNIQUE ("run_id", "poll_id");

  ALTER TABLE ONLY "public"."polls_options"
      ADD CONSTRAINT "polls_options_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."polls"
      ADD CONSTRAINT "polls_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."polls_response_options"
      ADD CONSTRAINT "polls_response_options_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."polls_responses"
      ADD CONSTRAINT "polls_responses_pkey" PRIMARY KEY ("response_id");

  ALTER TABLE ONLY "public"."run_category_coverage"
      ADD CONSTRAINT "run_category_coverage_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."run_category_coverage"
      ADD CONSTRAINT "run_category_coverage_run_id_category_code_unique" UNIQUE ("run_id", "category_code");

  ALTER TABLE ONLY "public"."run_polls"
      ADD CONSTRAINT "run_polls_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."run_polls"
      ADD CONSTRAINT "run_polls_run_id_position_unique" UNIQUE ("run_id", "position");

  ALTER TABLE ONLY "public"."run_shop_offerings"
      ADD CONSTRAINT "run_shop_offerings_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."run_shop_offerings"
      ADD CONSTRAINT "run_shop_offerings_run_id_date_reroll_number_key" UNIQUE ("run_id", "date", "reroll_number");

  ALTER TABLE ONLY "public"."run_states"
      ADD CONSTRAINT "run_states_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."run_states"
      ADD CONSTRAINT "run_states_run_id_key" UNIQUE ("run_id");

  ALTER TABLE ONLY "public"."runs"
      ADD CONSTRAINT "runs_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."seasons"
      ADD CONSTRAINT "seasons_pkey" PRIMARY KEY ("id");

  ALTER TABLE ONLY "public"."polls_responses"
      ADD CONSTRAINT "unique_poll_user_daily" UNIQUE ("poll_id", "user_id", "answer_date");

  ALTER TABLE ONLY "public"."user_config_unlocks"
      ADD CONSTRAINT "user_config_unlocks_pkey" PRIMARY KEY ("user_id", "config_id");

  ALTER TABLE ONLY "public"."user_objective_progress"
      ADD CONSTRAINT "user_objective_progress_pkey" PRIMARY KEY ("user_id", "metric");

  ALTER TABLE ONLY "public"."user_service_unlocks"
      ADD CONSTRAINT "user_service_unlocks_pkey" PRIMARY KEY ("user_id", "service_id");

  ALTER TABLE ONLY "public"."user_titles"
      ADD CONSTRAINT "user_titles_pkey" PRIMARY KEY ("user_id", "title_id");

  ALTER TABLE ONLY "public"."users"
      ADD CONSTRAINT "users_email_unique" UNIQUE ("email");

  ALTER TABLE ONLY "public"."users"
      ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

  CREATE INDEX "app_visits_day_route_idx" ON "public"."app_visits" USING "btree" ("visit_date", "route_id");

  CREATE UNIQUE INDEX "app_visits_day_visitor_route_uniq" ON "public"."app_visits" USING "btree" ("visit_date", "visitor_hash", "route_id");

  CREATE INDEX "app_visits_user_day_idx" ON "public"."app_visits" USING "btree" ("user_id", "visit_date") WHERE ("user_id" IS NOT NULL);

  CREATE INDEX "audit_incidents_created_idx" ON "public"."audit_incidents" USING "btree" ("created_at");

  CREATE INDEX "audit_incidents_target_queue_idx" ON "public"."audit_incidents" USING "btree" ("target_run_id", "target_gate", "status");

  CREATE UNIQUE INDEX "idx_daily_polls_date" ON "public"."daily_polls" USING "btree" ("date");

  CREATE INDEX "idx_leaderboard_category_code" ON "public"."leaderboard" USING "btree" ("category_code");

  CREATE INDEX "idx_leaderboard_lookup" ON "public"."leaderboard" USING "btree" ("season_id", "category_code", "user_id");

  CREATE INDEX "idx_leaderboard_season_id" ON "public"."leaderboard" USING "btree" ("season_id");

  CREATE INDEX "idx_leaderboard_user_id" ON "public"."leaderboard" USING "btree" ("user_id");

  CREATE INDEX "idx_polls_category_code" ON "public"."polls" USING "btree" ("category_code");

  CREATE INDEX "idx_polls_created_at" ON "public"."polls" USING "btree" ("created_at" DESC);

  CREATE INDEX "idx_polls_created_by" ON "public"."polls" USING "btree" ("created_by");

  CREATE INDEX "idx_polls_history_user_id" ON "public"."polls_history" USING "btree" ("user_id");

  CREATE INDEX "idx_polls_options_poll_id" ON "public"."polls_options" USING "btree" ("poll_id");

  CREATE INDEX "idx_polls_response_options_option_id" ON "public"."polls_response_options" USING "btree" ("option_id");

  CREATE INDEX "idx_polls_response_options_response_id" ON "public"."polls_response_options" USING "btree" ("response_id");

  CREATE INDEX "idx_polls_responses_created_at" ON "public"."polls_responses" USING "btree" ("created_at");

  CREATE INDEX "idx_polls_responses_poll_user_created" ON "public"."polls_responses" USING "btree" ("poll_id", "user_id", "created_at");

  CREATE INDEX "idx_polls_status" ON "public"."polls" USING "btree" ("status");

  CREATE INDEX "idx_run_category_coverage_category" ON "public"."run_category_coverage" USING "btree" ("category_code");

  CREATE INDEX "idx_run_category_coverage_run_id" ON "public"."run_category_coverage" USING "btree" ("run_id");

  CREATE INDEX "idx_runs_finished_at" ON "public"."runs" USING "btree" ("finished_at" DESC) WHERE ("status" = 'finished'::"public"."run_status");

  CREATE INDEX "idx_runs_season_id" ON "public"."runs" USING "btree" ("season_id");

  CREATE INDEX "idx_runs_user_status" ON "public"."runs" USING "btree" ("user_id", "status");

  CREATE INDEX "idx_seasons_dates" ON "public"."seasons" USING "btree" ("start_date", "end_date");

  CREATE INDEX "idx_seasons_status" ON "public"."seasons" USING "btree" ("status");

  CREATE UNIQUE INDEX "polls_responses_calendar_daily_uniq" ON "public"."polls_responses" USING "btree" ("poll_id", "user_id", "answer_date") WHERE (("mode")::"text" = 'calendar'::"text");

  CREATE INDEX "polls_responses_first_attempt_idx" ON "public"."polls_responses" USING "btree" ("poll_id", "user_id", "created_at") INCLUDE ("outcome") WHERE ("mirrored" = false);

  CREATE UNIQUE INDEX "polls_responses_session_run_poll_uniq" ON "public"."polls_responses" USING "btree" ("run_id", "poll_id") WHERE (("mode")::"text" = 'session'::"text");

  CREATE INDEX "polls_responses_unmirrored_poll_idx" ON "public"."polls_responses" USING "btree" ("poll_id") WHERE ("mirrored" = false);

  CREATE UNIQUE INDEX "user_titles_exclusive_title" ON "public"."user_titles" USING "btree" ("title_id") WHERE "exclusive";

  CREATE INDEX "users_created_at_idx" ON "public"."users" USING "btree" ("created_at");

  ALTER TABLE ONLY "public"."active_tech_debts"
      ADD CONSTRAINT "active_tech_debts_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."app_visits"
      ADD CONSTRAINT "app_visits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

  ALTER TABLE ONLY "public"."audit_incidents"
      ADD CONSTRAINT "audit_incidents_sent_by_user_id_fkey" FOREIGN KEY ("sent_by_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."audit_incidents"
      ADD CONSTRAINT "audit_incidents_target_run_id_fkey" FOREIGN KEY ("target_run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."audit_incidents"
      ADD CONSTRAINT "audit_incidents_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."daily_exposed_deck"
      ADD CONSTRAINT "daily_exposed_deck_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."daily_exposed_deck"
      ADD CONSTRAINT "daily_exposed_deck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."daily_polls"
      ADD CONSTRAINT "daily_polls_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."daily_run_polls"
      ADD CONSTRAINT "daily_run_polls_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE RESTRICT;

  ALTER TABLE ONLY "public"."leaderboard"
      ADD CONSTRAINT "leaderboard_category_code_polls_categories_code_fk" FOREIGN KEY ("category_code") REFERENCES "public"."polls_categories"("code");

  ALTER TABLE ONLY "public"."leaderboard"
      ADD CONSTRAINT "leaderboard_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."leaderboard"
      ADD CONSTRAINT "leaderboard_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE SET NULL;

  ALTER TABLE ONLY "public"."leaderboard"
      ADD CONSTRAINT "leaderboard_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."polls"
      ADD CONSTRAINT "polls_category_code_polls_categories_code_fk" FOREIGN KEY ("category_code") REFERENCES "public"."polls_categories"("code");

  ALTER TABLE ONLY "public"."polls"
      ADD CONSTRAINT "polls_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;

  ALTER TABLE ONLY "public"."polls_history"
      ADD CONSTRAINT "polls_history_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."polls_history"
      ADD CONSTRAINT "polls_history_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."polls_history"
      ADD CONSTRAINT "polls_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."polls_options"
      ADD CONSTRAINT "polls_options_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."polls_response_options"
      ADD CONSTRAINT "polls_response_options_option_id_polls_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."polls_options"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."polls_response_options"
      ADD CONSTRAINT "polls_response_options_response_id_polls_responses_response_id_" FOREIGN KEY ("response_id") REFERENCES "public"."polls_responses"("response_id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."polls_responses"
      ADD CONSTRAINT "polls_responses_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."polls_responses"
      ADD CONSTRAINT "polls_responses_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."polls_responses"
      ADD CONSTRAINT "polls_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

  ALTER TABLE ONLY "public"."run_category_coverage"
      ADD CONSTRAINT "run_category_coverage_category_code_polls_categories_code_fk" FOREIGN KEY ("category_code") REFERENCES "public"."polls_categories"("code");

  ALTER TABLE ONLY "public"."run_category_coverage"
      ADD CONSTRAINT "run_category_coverage_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."run_polls"
      ADD CONSTRAINT "run_polls_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE RESTRICT;

  ALTER TABLE ONLY "public"."run_polls"
      ADD CONSTRAINT "run_polls_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."run_shop_offerings"
      ADD CONSTRAINT "run_shop_offerings_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."run_states"
      ADD CONSTRAINT "run_states_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."runs"
      ADD CONSTRAINT "runs_looted_by_user_id_users_id_fk" FOREIGN KEY ("looted_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

  ALTER TABLE ONLY "public"."runs"
      ADD CONSTRAINT "runs_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE SET NULL;

  ALTER TABLE ONLY "public"."runs"
      ADD CONSTRAINT "runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."user_config_unlocks"
      ADD CONSTRAINT "user_config_unlocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."user_objective_progress"
      ADD CONSTRAINT "user_objective_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."user_service_unlocks"
      ADD CONSTRAINT "user_service_unlocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  ALTER TABLE ONLY "public"."user_titles"
      ADD CONSTRAINT "user_titles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  ALTER TABLE "public"."active_tech_debts" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."app_visits" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."audit_incidents" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."daily_exposed_deck" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."daily_polls" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."daily_run_polls" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."daily_run_seeds" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."leaderboard" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."polls" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."polls_categories" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."polls_history" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."polls_options" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."polls_response_options" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."polls_responses" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."run_category_coverage" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."run_polls" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."run_shop_offerings" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."run_states" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."runs" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."seasons" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."user_config_unlocks" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."user_objective_progress" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."user_service_unlocks" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."user_titles" ENABLE ROW LEVEL SECURITY;

  ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
END $baseline$;
