import { useEffect, useState } from "react";

import {
	type AnswerScore,
	correctOptionIdsFor,
	latestAnswerScore,
} from "~/modules/run/run/application/answerScore.viewmodel";
import { ConfirmDialog } from "~/ui/ConfirmDialog.component";
import { Screen } from "~/ui/Screen.ui";

import { AnsweringScreen } from "~/modules/run/run/presentation/AnsweringScreen.ui";
import { usePollClock } from "~/modules/run/run/presentation/usePollClock.hook";
import { usePollSplit } from "~/modules/run/community/application/usePollSplit.hook";
import {
	type RunActionSuccess,
	useRunActions,
} from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useUpcomingCategories } from "~/modules/run/run/application/useUpcomingCategories.hook";

// Post-submit reveal beat: the answered poll stays on screen with its options
// painted ✓/✕ and the coverage score, while the server result waits here. The
// player advances it themselves (the "Next →" action) so they can read their
// answer and score — nothing auto-commits.
type RevealState = {
	readonly result: RunActionSuccess;
	readonly correctOptionIds: readonly string[];
	readonly score: AnswerScore | null;
};

/** Tier 2: the answering screen, including the reveal beat and abandoning. */
export const RunAnswer = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, commit, busy, abandon } = useRunActions();
	const upcoming = useUpcomingCategories(view);

	const [selected, setSelected] = useState<readonly string[]>([]);
	// One clock per poll, owned by the hook: it feeds the "fastest answer"
	// standout (DVTD-smye) and, at a Timeout gate, the countdown the player
	// watches — the same start for both, so the display can never disagree with
	// the reading the gate grades.
	const clock = usePollClock(
		view?.poll?.id ?? null,
		view?.pollTimeLimitMs ?? null
	);
	useEffect(() => {
		setSelected([]);
	}, [view?.poll?.id]);

	const [reveal, setReveal] = useState<RevealState | null>(null);

	// Above the early return, so the hook count never moves. The engine decides
	// whether this poll is paid for; the query only asks once it says so.
	const { split } = usePollSplit({
		pollId: view?.poll?.id ?? null,
		paid: view?.currentPollPeeked ?? false,
	});

	// Abandoning is destructive (all leftover storage forfeits), so the button
	// opens a confirm dialog instead of firing directly.
	const [confirmingAbandon, setConfirmingAbandon] = useState(false);

	if (!view?.poll) return null;
	const poll = view.poll;

	const submitAnswer = () =>
		sendWith(
			{
				type: "answer",
				optionIds: [...selected],
				elapsedMs: Math.min(clock.elapsedMs(), 600_000),
			},
			(result) => {
				if (!result.success) return;
				setReveal({
					result,
					correctOptionIds: correctOptionIdsFor(poll, result.data),
					score: latestAnswerScore(result.data),
				});
			}
		);

	const advanceFromReveal = () => {
		if (!reveal) return;
		commit(reveal.result);
		setReveal(null);
	};

	const canSubmit = selected.length > 0 && !busy && reveal === null;

	const onSelect = (optionId: string) => {
		if (poll.answerType === "single") return setSelected([optionId]);
		setSelected((current) =>
			current.includes(optionId)
				? current.filter((id) => id !== optionId)
				: [...current, optionId]
		);
	};

	return (
		<Screen
			gateTheme={view.gateTheme}
			leftAction={{
				label: "Abandon run",
				onClick: () => setConfirmingAbandon(true),
				disabled: abandon.isPending,
			}}
		>
			<AnsweringScreen
				configs={view.configs}
				audits={view.audits}
				offlineConfigs={view.offlineConfigs.map((offline) => offline.config)}
				mirroredPolls={view.mirroredPolls}
				timeLimitMs={view.pollTimeLimitMs ?? undefined}
				// The clock stops mattering the moment the answer is in: the reveal
				// is not the poll, and a ticking rail there would read as pressure to
				// hurry through the explanation.
				remainingMs={reveal ? undefined : (clock.remainingMs ?? undefined)}
				category={poll.category}
				question={poll.question}
				codeBlock={poll.codeBlock}
				codeSandboxUrl={poll.codeSandboxUrl}
				answerType={poll.answerType}
				options={poll.options}
				selectedOptionIds={selected}
				disabledOptionIds={view.disabledOptionIds}
				pollOutcomes={view.answeredThisGate.map((poll) => poll.outcome)}
				pollsPerGate={view.pollsPerGate}
				correctOptionIds={reveal?.correctOptionIds}
				chosenOptionIds={reveal ? selected : undefined}
				revealScore={reveal?.score ?? undefined}
				slots={view.slots}
				canLint={view.paidActions.canLint}
				lintReady={view.paidActions.lintReady && !busy && !reveal}
				linter={view.paidActions.linter ?? undefined}
				lintCost={view.paidActions.lintCost}
				canPeek={view.paidActions.canPeek}
				peekReady={view.paidActions.peekReady && !busy && !reveal}
				peeker={view.paidActions.peeker ?? undefined}
				peekCost={view.paidActions.peekCost}
				split={split ?? undefined}
				correctAnswersThisGate={view.correctAnswersThisGate ?? undefined}
				upcoming={upcoming}
				canSubmit={canSubmit}
				onSelect={onSelect}
				onSubmit={submitAnswer}
				onNext={advanceFromReveal}
				onLint={() => send({ type: "lint-poll" })}
				onPeek={() => send({ type: "peek-poll" })}
			/>
			<ConfirmDialog
				isOpen={confirmingAbandon}
				theme="cinnabar"
				title="Abandon this run?"
				message="The climb ends here and every KB of leftover storage is forfeited. You can start a fresh run today — it skips the polls you already answered."
				confirmText="Abandon run"
				cancelText="Keep climbing"
				isConfirming={abandon.isPending}
				errorMessage={
					abandon.data?.success === false ? abandon.data.error : null
				}
				onConfirm={() =>
					abandon.mutate(undefined, {
						onSuccess: (result) => {
							if (result.success) setConfirmingAbandon(false);
						},
					})
				}
				onCancel={() => setConfirmingAbandon(false)}
			/>
		</Screen>
	);
};
