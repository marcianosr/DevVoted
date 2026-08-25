import { Meter } from "~/ui/Meter.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

export type PollClockProps = {
	/** Milliseconds left on this poll's clock; 0 once it has run out. */
	remainingMs: number;
	/** What the audit allowed, so the rail knows what full looks like. */
	limitMs: number;
};

/** Under this, the clock is the loudest thing on the poll. */
const URGENT_MS = 10_000;

/**
 * A Timeout audit's clock (ADR-038). Deliberately small and inline rather than a
 * headline: it sits beside the audit's cue, so the pressure is legible without
 * the screen turning into a game show. Seconds round up, because a clock that
 * shows 0 while an answer still counts reads as broken.
 *
 * Running out does not submit anything — it only means the answer will score as
 * a miss — so the expired state says that rather than pretending to be over.
 */
export const PollClock = ({ remainingMs, limitMs }: PollClockProps) => {
	const secondsLeft = Math.ceil(remainingMs / 1000);
	const expired = remainingMs <= 0;
	const urgent = remainingMs <= URGENT_MS;

	return (
		<span className="flex shrink-0 flex-col items-end gap-1">
			<Paragraph
				as="span"
				size="sm"
				tone={expired || urgent ? "cinnabar" : "saffron"}
				className="whitespace-nowrap font-bold tabular-nums"
			>
				{expired ? "out of time" : `${secondsLeft}s`}
			</Paragraph>
			<span className="w-20">
				<Meter
					cap={limitMs}
					trackClassName="h-1 rounded-full"
					segments={[
						{
							value: remainingMs,
							className: urgent ? "bg-cinnabar" : "bg-saffron",
						},
					]}
					label="time left on this poll"
					value={secondsLeft}
				/>
			</span>
		</span>
	);
};
