import { useEffect, useRef, useState } from "react";

import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import type { PressAction } from "~/modules/run/run/application/pollScreen.viewmodel";
import { PollView } from "~/modules/run/run/presentation/PollView.component";
import { usePollClock } from "~/modules/run/run/presentation/usePollClock.hook";
import {
	type RunActionSuccess,
	useRunActions,
} from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

const MAX_ELAPSED_MS = 600_000;

const PRESS_ACTIONS = {
	lint: () => ({ type: "lint-poll" }),
	peek: () => ({ type: "peek-poll" }),
	"arm-strict": () => ({ type: "arm-strict" }),
	"switch-arm": (configId: string) => ({ type: "switch-arm", configId }),
} as const satisfies Record<PressAction, (configId: string) => RunAction>;

export const RunPoll = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, sendCrowdPickWith, commit, busy } = useRunActions();

	const [selected, setSelected] = useState<readonly string[]>([]);
	const [reveal, setReveal] = useState<RunActionSuccess | null>(null);
	const [approveRefusal, setApproveRefusal] = useState<string>();
	const unread = useRef<RunActionSuccess | null>(null);

	const stage = (result: RunActionSuccess | null) => {
		unread.current = result;
		setReveal(result);
	};

	useEffect(
		() => () => {
			if (unread.current) commit(unread.current);
		},
		[commit]
	);

	const clock = usePollClock(
		view?.poll?.id ?? null,
		view?.pollTimeLimitMs ?? view?.fastAnswer?.withinMs ?? null
	);
	useEffect(() => {
		setSelected([]);
		setApproveRefusal(undefined);
	}, [view?.poll?.id]);

	if (!view?.poll) return null;

	const submit = (optionIds: readonly string[]) => {
		if (busy || reveal || optionIds.length === 0) return;
		sendWith(
			{
				type: "answer",
				optionIds: [...optionIds],
				elapsedMs: Math.min(clock.elapsedMs(), MAX_ELAPSED_MS),
			},
			(result) => {
				if (result.success) stage(result);
			}
		);
	};

	const approveWithTheRoom = () => {
		if (busy || reveal) return;
		sendCrowdPickWith((result) => {
			if (!result.success) return setApproveRefusal(result.error);
			setApproveRefusal(undefined);
			stage(result);
		});
	};

	const advanceFromReveal = () => {
		if (!reveal) return;
		commit(reveal);
		if (reveal.data.gateComplete) send({ type: "close-gate" });
		stage(null);
	};

	const onSelect = (optionId: string) => {
		if (reveal) return;

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
			clockMs={clock.shownMs}
			onSelect={onSelect}
			onAnswer={submit}
			onNext={advanceFromReveal}
			onPress={(action, configId) => send(PRESS_ACTIONS[action](configId))}
			onUnseal={(optionId) => send({ type: "buy-back-option", optionId })}
			onApprove={approveWithTheRoom}
			approveRefusal={approveRefusal}
		/>
	);
};
