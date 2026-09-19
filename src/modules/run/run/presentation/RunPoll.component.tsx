import { useEffect, useState } from "react";

import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import type { PressAction } from "~/modules/run/run/application/pollScreen.viewmodel";
import { PollView } from "~/modules/run/run/presentation/PollView.component";
import { usePollClock } from "~/modules/run/run/presentation/usePollClock.hook";
import {
	type RunActionSuccess,
	useRunActions,
} from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

/** The ceiling the engine records; a tab left open must not read as thought. */
const MAX_ELAPSED_MS = 600_000;

const PRESS_ACTIONS = {
	lint: () => ({ type: "lint-poll" }),
	peek: () => ({ type: "peek-poll" }),
	"arm-strict": () => ({ type: "arm-strict" }),
	"switch-arm": (configId: string) => ({ type: "switch-arm", configId }),
} as const satisfies Record<PressAction, (configId: string) => RunAction>;

export const RunPoll = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, commit, busy } = useRunActions();

	const [selected, setSelected] = useState<readonly string[]>([]);
	const [reveal, setReveal] = useState<RunActionSuccess | null>(null);

	const clock = usePollClock(
		view?.poll?.id ?? null,
		view?.pollTimeLimitMs ?? null
	);
	useEffect(() => {
		setSelected([]);
	}, [view?.poll?.id]);

	if (!view?.poll) return null;
	const poll = view.poll;

	/**
	 * The reveal stages the answered view without committing it: the kanto screen
	 * reads its answered mood off `answered`, so the staged result is the only
	 * source and no second "pinned" flag is needed. Committing is what lets the
	 * layout's route sync see the new status.
	 */
	const submit = (optionIds: readonly string[]) => {
		if (busy || reveal || optionIds.length === 0) return;
		sendWith(
			{
				type: "answer",
				optionIds: [...optionIds],
				elapsedMs: Math.min(clock.elapsedMs(), MAX_ELAPSED_MS),
			},
			(result) => {
				if (result.success) setReveal(result);
			}
		);
	};

	const advanceFromReveal = () => {
		if (!reveal) return;
		commit(reveal);
		if (reveal.data.gateComplete) send({ type: "close-gate" });
		setReveal(null);
	};

	const onSelect = (optionId: string) => {
		if (reveal) return;
		if (poll.answerType === "single") return setSelected([optionId]);

		setSelected((current) =>
			current.includes(optionId)
				? current.filter((id) => id !== optionId)
				: [...current, optionId]
		);
	};

	return (
		<PollView
			view={reveal?.data ?? view}
			answered={reveal?.data.answeredThisGate.at(-1)}
			selectedOptionIds={selected}
			onSelect={onSelect}
			onSubmit={() => submit(selected)}
			onNext={advanceFromReveal}
			onPress={(action, configId) => send(PRESS_ACTIONS[action](configId))}
			onUnseal={(optionId) => send({ type: "buy-back-option", optionId })}
		/>
	);
};
