import { useCallback, useEffect, useRef, useState } from "react";

import type {
	AnsweredPoll,
	AnswerOutcome,
} from "~/modules/run/run/domain/runPoll.model";

export const ANSWER_HOLD_MS = { right: 650, wrong: 900 } as const;

export const answerHoldFor = (outcome: AnswerOutcome): number =>
	outcome === "wrong" ? ANSWER_HOLD_MS.wrong : ANSWER_HOLD_MS.right;

export type AnswerFeedback = {
	landed: boolean;
	land: () => void;
};

export const useAnswerFeedback = (
	answered: AnsweredPoll | undefined,
	onDone: () => void
): AnswerFeedback => {
	const done = useRef(onDone);
	const [landedId, setLandedId] = useState<string>();
	const answeredId = answered?.id;
	const outcome = answered?.outcome;

	useEffect(() => {
		done.current = onDone;
	}, [onDone]);

	useEffect(() => {
		if (outcome === undefined) return;
		const hold = setTimeout(() => done.current(), answerHoldFor(outcome));
		return () => clearTimeout(hold);
	}, [answeredId, outcome]);

	const land = useCallback(() => setLandedId(answeredId), [answeredId]);

	return {
		landed: answeredId !== undefined && landedId === answeredId,
		land,
	};
};
