-- The poll screen states how the room did on a poll: the share of players who
-- got it right on their very first deal of it. That reading is a grouped count
-- over one row per (poll, player), and deriving correctness at read time would
-- mean joining every option of every response and folding in JS — (players ×
-- options) rows for a single number on a hot screen.
--
-- So the grade is stored. One writer per loop sets it at answer time from the
-- same rule that has always decided full/partial/wrong, which keeps the
-- correctness rule single even though the value is now denormalised.

-- Postgres has no CREATE TYPE IF NOT EXISTS, and every migration here has to be
-- safe to re-apply.
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'answer_outcome') THEN
		CREATE TYPE answer_outcome AS ENUM ('correct', 'partial', 'wrong');
	END IF;
END
$$;

ALTER TABLE polls_responses
	ADD COLUMN IF NOT EXISTS outcome answer_outcome;

-- One-off backfill. This is the only place the rule is spelled in SQL: it
-- restates evaluatePollAnswer for rows written before the column existed, and
-- never runs again.
WITH tallies AS (
	SELECT
		r.response_id,
		count(*) FILTER (WHERE o.correct) AS total_correct,
		count(*) FILTER (WHERE o.correct AND s.option_id IS NOT NULL)
			AS selected_correct,
		count(*) FILTER (WHERE NOT o.correct AND s.option_id IS NOT NULL)
			AS selected_incorrect
	FROM polls_responses r
	JOIN polls_options o ON o.poll_id = r.poll_id
	LEFT JOIN polls_response_options s
		ON s.response_id = r.response_id AND s.option_id = o.id
	WHERE r.outcome IS NULL
	GROUP BY r.response_id
)
UPDATE polls_responses r
SET outcome = (
	CASE
		WHEN t.total_correct = 0 OR t.selected_correct = 0 THEN 'wrong'
		WHEN t.selected_correct = t.total_correct AND t.selected_incorrect = 0
			THEN 'correct'
		ELSE 'partial'
	END
)::answer_outcome
FROM tallies t
WHERE r.response_id = t.response_id;

-- The difficulty read walks a poll's responses in created_at order to find each
-- player's first, and needs the grade once it lands there. Partial on the
-- honest rows only, following polls_responses_unmirrored_poll_idx: a mirrored
-- answer answered a different question and never counts toward the room's
-- reading.
CREATE INDEX IF NOT EXISTS polls_responses_first_attempt_idx
	ON polls_responses (poll_id, user_id, created_at)
	INCLUDE (outcome)
	WHERE mirrored = false;
