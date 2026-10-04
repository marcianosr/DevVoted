import { useCallback, useEffect, useRef, useState } from "react";

import type {
	AnsweredPoll,
	AnswerOutcome,
} from "~/modules/run/run/domain/runPoll.model";

export const ANSWER_HOLD_MS = { right: 650, wrong: 900 } as const;

export const CARD_LEAVE_MS = 180;

export const FLIGHT_FALLBACK_MS = 3000;

export const answerHoldFor = (outcome: AnswerOutcome): number =>
	outcome === "wrong" ? ANSWER_HOLD_MS.wrong : ANSWER_HOLD_MS.right;

export type AnswerFeedback = {
	landed: boolean;
	leaving: boolean;
	land: () => void;
	settle: () => void;
};

type FlightGate = { held: boolean; settled: boolean; left: boolean };

const OPEN_GATE: FlightGate = { held: false, settled: false, left: false };

export const useAnswerFeedback = (
	answered: AnsweredPoll | undefined,
	onDone: () => void,
	flies = false
): AnswerFeedback => {
	const done = useRef(onDone);
	const gate = useRef<FlightGate>(OPEN_GATE);
	const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const [landedId, setLandedId] = useState<string>();
	const [leavingId, setLeavingId] = useState<string>();
	const answeredId = answered?.id;
	const outcome = answered?.outcome;

	useEffect(() => {
		done.current = onDone;
	}, [onDone]);

	const leaveOnceFree = useCallback(
		(change: Partial<FlightGate>) => {
			gate.current = { ...gate.current, ...change };
			const { held, settled, left } = gate.current;
			if (!held || !settled || left) return;
			gate.current = { ...gate.current, left: true };
			setLeavingId(answeredId);
			leaveTimer.current = setTimeout(() => done.current(), CARD_LEAVE_MS);
		},
		[answeredId]
	);

	useEffect(() => {
		if (outcome === undefined) return;
		const holdMs = answerHoldFor(outcome);
		gate.current = { ...OPEN_GATE, settled: !flies };

		const hold = setTimeout(
			() => leaveOnceFree({ held: true }),
			holdMs - CARD_LEAVE_MS
		);
		const fallback = flies
			? setTimeout(
					() => leaveOnceFree({ settled: true }),
					FLIGHT_FALLBACK_MS - CARD_LEAVE_MS
				)
			: undefined;

		return () => {
			clearTimeout(hold);
			clearTimeout(fallback);
			clearTimeout(leaveTimer.current);
		};
	}, [answeredId, outcome, flies, leaveOnceFree]);

	const land = useCallback(() => setLandedId(answeredId), [answeredId]);
	const settle = useCallback(
		() => leaveOnceFree({ settled: true }),
		[leaveOnceFree]
	);

	return {
		landed: answeredId !== undefined && landedId === answeredId,
		leaving: answeredId !== undefined && leavingId === answeredId,
		land,
		settle,
	};
};
