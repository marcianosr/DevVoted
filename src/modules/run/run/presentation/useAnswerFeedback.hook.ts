import { useCallback, useEffect, useRef, useState } from "react";

import type {
	AnsweredPoll,
	AnswerOutcome,
} from "~/modules/run/run/domain/runPoll.model";

export const ANSWER_HOLD_MS = { right: 650, wrong: 900 } as const;

export const CARD_LEAVE_MS = 180;

export const answerHoldFor = (outcome: AnswerOutcome): number =>
	outcome === "wrong" ? ANSWER_HOLD_MS.wrong : ANSWER_HOLD_MS.right;

export type AnswerFeedback = {
	landed: boolean;
	leaving: boolean;
	land: () => void;
};

export const useAnswerFeedback = (
	answered: AnsweredPoll | undefined,
	onDone: () => void
): AnswerFeedback => {
	const done = useRef(onDone);
	const [landedId, setLandedId] = useState<string>();
	const [leavingId, setLeavingId] = useState<string>();
	const answeredId = answered?.id;
	const outcome = answered?.outcome;

	useEffect(() => {
		done.current = onDone;
	}, [onDone]);

	useEffect(() => {
		if (outcome === undefined) return;
		const holdMs = answerHoldFor(outcome);
		const leave = setTimeout(
			() => setLeavingId(answeredId),
			holdMs - CARD_LEAVE_MS
		);
		const hold = setTimeout(() => done.current(), holdMs);
		return () => {
			clearTimeout(leave);
			clearTimeout(hold);
		};
	}, [answeredId, outcome]);

	const land = useCallback(() => setLandedId(answeredId), [answeredId]);

	return {
		landed: answeredId !== undefined && landedId === answeredId,
		leaving: answeredId !== undefined && leavingId === answeredId,
		land,
	};
};
