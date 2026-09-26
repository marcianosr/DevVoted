-- Client-measured reveal→submit duration per answer (community "fastest answer"
-- standout). Nullable: legacy rows and untimed clients simply carry no timing.
ALTER TABLE polls_responses
	ADD COLUMN IF NOT EXISTS answer_time_ms integer;
