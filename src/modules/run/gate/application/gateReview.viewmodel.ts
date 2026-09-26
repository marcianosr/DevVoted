import { plural } from "~/shared/lib/displayValue";
import { gateSwatchAt } from "./swatchTrack.viewmodel";
import {
	answerTallyOf,
	categoryName,
	coverageColor,
	type GateAnswer,
	GATE_SHOP_LABEL,
	signedPercent,
	totalCoverage,
} from "./gateOutcome.viewmodel";

import type {
	AnswerDiffProps,
	DiffOption,
} from "~/ui/kanto-theme/AnswerDiff.ui";
import type {
	ReviewRow,
	ReviewScreenProps,
} from "~/ui/kanto-theme/ReviewScreen.ui";

const noop = () => {};

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const REVIEW_EXPAND_LABEL = "open everything";
export const REVIEW_HINT = "fumbles open, passes folded";
export const REVIEW_DEX_NOTE = "every poll you saw is recorded in the Dex";

const REVIEW_LEAD = "Review";
const REVIEW_SEPARATOR = "·";
const CAUGHT = "caught";

const optionAt = (answer: GateAnswer, label: string): DiffOption => ({
	letter: OPTION_LETTERS[answer.options.indexOf(label)] ?? "?",
	label,
});

const diffFor = (answer: GateAnswer): AnswerDiffProps => {
	const picked = new Set(answer.picked);
	const named = new Set([...answer.correct, ...answer.picked]);
	const others = answer.options.filter((label) => !named.has(label));
	const hits = answer.correct.filter((label) => picked.has(label)).length;

	return {
		outcome: answer.outcome,
		answerType: answer.answerType,
		expected: answer.correct.map((label) => optionAt(answer, label)),
		received: answer.picked.map((label) => optionAt(answer, label)),
		others: others.map((label) => optionAt(answer, label)),
		tally:
			answer.answerType === "multiple"
				? `${hits} of ${answer.correct.length} ${CAUGHT}`
				: undefined,
		othersLabel:
			others.length === 0 ? undefined : plural(others.length, "other option"),
	};
};

const reviewRowFor = (answer: GateAnswer, open?: boolean): ReviewRow => ({
	verdict: answer.outcome,
	share: answer.share,
	question: answer.question,
	category: categoryName(answer.category),
	coverage: signedPercent(answer.coverage),
	coverageColor: coverageColor(answer.coverage),
	open,
	codeBlock: answer.codeBlock,
	diff: diffFor(answer),
	explanation: answer.explanation,
	note: answer.note,
});

export type ReviewFrame = {
	gate: number;
	answers: readonly GateAnswer[];
	open?: boolean;
};

export const reviewPropsFor = ({
	gate,
	answers,
	open,
}: ReviewFrame): ReviewScreenProps => {
	const swatch = gateSwatchAt(gate);

	return {
		header: {
			swatch,
			title: `${REVIEW_LEAD} ${REVIEW_SEPARATOR} ${swatch.gateName}`,
			subtitle: `gate ${gate} ${REVIEW_SEPARATOR} ${plural(answers.length, "poll")}`,
			badges: [
				...answerTallyOf(answers),
				{
					label: signedPercent(totalCoverage(answers)),
					color: coverageColor(totalCoverage(answers)),
				},
			],
		},
		hint: REVIEW_HINT,
		expand: { label: REVIEW_EXPAND_LABEL, onPress: noop },
		rows: answers.map((answer) => reviewRowFor(answer, open)),
		footer: {
			note: REVIEW_DEX_NOTE,
			action: { label: GATE_SHOP_LABEL, icon: "shop", onPress: noop },
		},
	};
};
