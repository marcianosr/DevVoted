export type RunJeopardyStreak = {
	categoryName: string;
	streak: number;
};

type RunJeopardyProps = {
	gate: number;
	/** Polls left in the window before the next gate check. */
	pollsUntilGate: number;
	/** Active checks — all must pass at the gate. */
	checkCount: number;
	/** The viewer's strongest live category streak, if worth protecting. */
	topStreak?: RunJeopardyStreak | null;
	/** Live countdown to the next poll, e.g. "Next poll in 5h 23m 10s". */
	countdownLabel: string;
};

const plural = (count: number, noun: string) =>
	`${count} ${noun}${count === 1 ? "" : "s"}`;

const gateLine = (
	gate: number,
	pollsUntilGate: number,
	checkCount: number
): string =>
	pollsUntilGate <= 1
		? `One more answer reaches Gate ${gate} — all ${plural(checkCount, "check")} must pass. Tomorrow decides it.`
		: `You're ${plural(pollsUntilGate, "poll")} from Gate ${gate}. Keep every one of your ${plural(checkCount, "pipeline")} intact to clear it.`;

/**
 * A forward-looking "come back tomorrow" nudge for the community screen: turns
 * the viewer's live run state into stakes for the next poll (loss aversion) —
 * how close the next gate is, and the strongest streak they'd keep alive by
 * answering. Purely presentational; the caller derives the numbers.
 */
export const RunJeopardy = ({
	gate,
	pollsUntilGate,
	checkCount,
	topStreak,
	countdownLabel,
}: RunJeopardyProps) => (
	<section className="border border-theme bg-theme-soft px-5 py-4 flex flex-col gap-2">
		<h3 className="text-2xl text-theme">🎯 Your run continues tomorrow</h3>
		<ul className="space-y-1 text-lg">
			<li className="flex items-start gap-2">
				<span aria-hidden>⛳</span>
				<span>{gateLine(gate, pollsUntilGate, checkCount)}</span>
			</li>
			{topStreak && (
				<li className="flex items-start gap-2">
					<span aria-hidden>🔥</span>
					<span>
						Your{" "}
						<span className="text-theme font-bold">
							{topStreak.streak}× {topStreak.categoryName}
						</span>{" "}
						streak is live — answer right to keep it climbing.
					</span>
				</li>
			)}
		</ul>
		<p className="text-sm text-zinc-400">
			Pick up your run where you left off:
		</p>
		<p className="flex items-center gap-2 text-theme font-bold">
			<span aria-hidden>⏳</span>
			<span>{countdownLabel}</span>
		</p>
	</section>
);
