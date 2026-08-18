-- ADR-038: a response answered under the Mirror audit is a correct answer to a
-- different question (pick the INCORRECT options), so readers have to be able to
-- tell the two apart. The community split excludes these rows; the run's
-- community board grades them against the mirrored expectation.
ALTER TABLE polls_responses
	ADD COLUMN IF NOT EXISTS mirrored boolean NOT NULL DEFAULT false;

-- The split filters on it for every poll it prices, so it is worth an index on
-- the honest rows only: mirrored answers are the rare case, and a partial index
-- stays small as the table grows.
CREATE INDEX IF NOT EXISTS polls_responses_unmirrored_poll_idx
	ON polls_responses (poll_id)
	WHERE mirrored = false;
