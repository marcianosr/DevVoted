import { useEffect, useState } from "react";

import {
	type AnswerReveal,
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
import {
	type PollView,
	revealedPoll,
} from "~/modules/run/run/application/pollView.viewmodel";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useUpcomingCategories } from "~/modules/run/run/application/useUpcomingCategories.hook";

type RevealState = {
	readonly result: RunActionSuccess;
	readonly correctOptionIds: readonly string[];
	readonly score: AnswerScore | null;
	readonly poll: PollView;
};

export const RunAnswer = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, commit, busy, abandon } = useRunActions();
	const upcoming = useUpcomingCategories(view);

	const [selected, setSelected] = useState<readonly string[]>([]);
	const clock = usePollClock(
		view?.poll?.id ?? null,
		view?.pollTimeLimitMs ?? null
	);
	useEffect(() => {
		setSelected([]);
	}, [view?.poll?.id]);

	const [reveal, setReveal] = useState<RevealState | null>(null);

	const { split } = usePollSplit({
		pollId: view?.poll?.id ?? null,
		paid: view?.currentPollPeeked ?? false,
	});

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
				// Unsealed before the marks are worked out: a redacted poll would
				// otherwise stay ????? through the reveal, and correctness is
				// matched by label, so nothing would light up either.
				const shown = revealedPoll(
					poll,
					result.data.answeredThisGate.at(-1)?.options
				);
				setReveal({
					result,
					poll: shown,
					correctOptionIds: correctOptionIdsFor(shown, result.data),
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

	const limitMs = view.pollTimeLimitMs;
	const pollClock =
		limitMs !== null && !reveal && clock.remainingMs !== null
			? { limitMs, remainingMs: clock.remainingMs }
			: undefined;

	const answerReveal: AnswerReveal | undefined = reveal
		? {
				correctOptionIds: reveal.correctOptionIds,
				chosenOptionIds: selected,
				score: reveal.score ?? undefined,
			}
		: undefined;

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
				clock={pollClock}
				poll={reveal?.poll ?? poll}
				selectedOptionIds={selected}
				disabledOptionIds={view.disabledOptionIds}
				hiddenOptionIds={reveal ? [] : view.hiddenOptionIds}
				buyBack={{
					costKb: view.buyBack.costKb,
					ready: view.buyBack.ready && !busy && reveal === null,
					onBuyBack: (optionId) => send({ type: "buy-back-option", optionId }),
				}}
				pollOutcomes={view.answeredThisGate.map((poll) => poll.outcome)}
				pollsPerGate={view.pollsPerGate}
				reveal={answerReveal}
				slots={view.slots}
				paidActions={view.paidActions}
				interactive={!busy && reveal === null}
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
