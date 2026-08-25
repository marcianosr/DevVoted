import { clsx } from "clsx";

import type { AnswerOutcome } from "~/modules/run/run/domain/runPoll.model";

type PollOutcomeBarProps = {
	/** This gate's answers so far, in the order they were given. */
	outcomes: readonly AnswerOutcome[];
	pollsPerGate: number;
};

const OUTCOME_FILL: Record<AnswerOutcome, string> = {
	correct: "bg-viridian",
	partial: "bg-saffron",
	wrong: "bg-cinnabar",
};

const OUTCOME_SPOKEN: Record<AnswerOutcome, string> = {
	correct: "correct",
	partial: "partly correct",
	wrong: "wrong",
};

/**
 * The gate's window as one dash per poll: answered dashes wear their outcome,
 * the rest sit dim. It replaces the bare "3 / 5" counter because the count only
 * ever said how far in you were, never how it was going — and how it is going is
 * what the player is deciding against, since a gate's checks judge the window as
 * a whole. Two reds by poll 3 is a different day from two greens, and the counter
 * read identically in both.
 *
 * Deliberately not a progress bar: the segments are a record, not a fill, so they
 * keep their own colours rather than merging into one measured length.
 */
export const PollOutcomeBar = ({
	outcomes,
	pollsPerGate,
}: PollOutcomeBarProps) => (
	<span
		role="group"
		aria-label={`${outcomes.length} of ${pollsPerGate} polls answered`}
		className="flex w-full items-center gap-1"
	>
		{Array.from({ length: pollsPerGate }, (_, index) => {
			const outcome = outcomes[index];
			return (
				<span
					key={index}
					aria-label={
						outcome
							? `poll ${index + 1}, ${OUTCOME_SPOKEN[outcome]}`
							: `poll ${index + 1}, not answered`
					}
					className={clsx(
						"block h-2 flex-1 rounded-sm transition-colors",
						outcome ? OUTCOME_FILL[outcome] : "bg-zinc-700"
					)}
				/>
			);
		})}
	</span>
);
