import { useEffect, useState } from "react";

import {
	type AnswerScore,
	correctOptionIdsFor,
	latestAnswerScore,
} from "~/modules/run/view/runView.viewmodel";
import { ConfirmDialog } from "~/ui/ConfirmDialog.component";
import { Screen } from "~/ui/Screen.ui";

import { AnsweringScreen } from "../screens/AnsweringScreen.ui";
import { type RunActionSuccess, useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

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

	const [selected, setSelected] = useState<readonly string[]>([]);
	useEffect(() => {
		setSelected([]);
	}, [view?.poll?.id]);

	const [reveal, setReveal] = useState<RevealState | null>(null);

	// Abandoning is destructive (all leftover storage forfeits), so the button
	// opens a confirm dialog instead of firing directly.
	const [confirmingAbandon, setConfirmingAbandon] = useState(false);

	if (!view?.poll) return null;
	const poll = view.poll;

	const submitAnswer = () =>
		sendWith({ type: "answer", optionIds: [...selected] }, (result) => {
			if (!result.success) return;
			setReveal({
				result,
				correctOptionIds: correctOptionIdsFor(poll, result.data),
				score: latestAnswerScore(result.data),
			});
		});

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
			categoryCode={poll.category}
			leftAction={{
				label: "Abandon run",
				onClick: () => setConfirmingAbandon(true),
				disabled: abandon.isPending,
			}}
		>
			<AnsweringScreen
				configs={view.configs}
				checks={view.checks}
				category={poll.category}
				question={poll.question}
				codeBlock={poll.codeBlock}
				codeSandboxUrl={poll.codeSandboxUrl}
				answerType={poll.answerType}
				options={poll.options}
				selectedOptionIds={selected}
				disabledOptionIds={view.disabledOptionIds}
				correctOptionIds={reveal?.correctOptionIds}
				chosenOptionIds={reveal ? selected : undefined}
				revealScore={reveal?.score ?? undefined}
				canLint={view.canLint}
				lintReady={view.lintReady && !busy && !reveal}
				linter={view.linter ?? undefined}
				lintCost={view.lintCost}
				canSubmit={canSubmit}
				onSelect={onSelect}
				onSubmit={submitAnswer}
				onNext={advanceFromReveal}
				onLint={() => send({ type: "lint-poll" })}
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
