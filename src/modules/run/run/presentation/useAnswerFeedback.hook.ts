import { useCallback, useEffect, useRef, useState } from "react";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";

export const CARD_LEAVE_MS = 180;

export const FLIGHT_FALLBACK_MS = 3000;

export type AnswerFeedback = {
	landed: boolean;
	leaving: boolean;
	land: () => void;
	settle: () => void;
	next: () => void;
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
		gate.current = { ...OPEN_GATE, settled: !flies };

		const fallback = flies
			? setTimeout(
					() => leaveOnceFree({ settled: true }),
					FLIGHT_FALLBACK_MS - CARD_LEAVE_MS
				)
			: undefined;

		return () => {
			clearTimeout(fallback);
			clearTimeout(leaveTimer.current);
		};
	}, [answeredId, outcome, flies, leaveOnceFree]);

	const land = useCallback(() => setLandedId(answeredId), [answeredId]);
	const settle = useCallback(
		() => leaveOnceFree({ settled: true }),
		[leaveOnceFree]
	);

	const next = useCallback(
		() => leaveOnceFree({ held: true }),
		[leaveOnceFree]
	);

	return {
		next,
		landed: answeredId !== undefined && landedId === answeredId,
		leaving: answeredId !== undefined && leavingId === answeredId,
		land,
		settle,
	};
};
