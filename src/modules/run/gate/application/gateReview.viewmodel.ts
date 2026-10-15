import { letterAt } from "~/shared/lib/letters";
import { STORAGE_BALANCE } from "~/shared/lib/copy";
import { plural } from "~/shared/lib/displayValue";
import { fundsOf } from "~/modules/run/run/application/prepScreen.viewmodel";
import { gateSwatchAt, swatchTrackFor } from "./swatchTrack.viewmodel";
import {
	answerTallyOf,
	categoryName,
	coverageColor,
	type GateAnswer,
	GATE_SHOP_LABEL,
	signedPercent,
	totalCoverage,
} from "./gateOutcome.viewmodel";

import { answeredPairsFor } from "~/modules/run/run/application/pollScreen.viewmodel";
import type { AnsweredPair } from "~/modules/run/run/domain/pairPoll.model";
import type { OptionVotes } from "~/modules/run/community/application/communityScreen.viewmodel";
import type { AuthorProps } from "~/ui/kanto-theme/Author.ui";
import type {
	QuestionOption,
	QuestionProps,
} from "~/ui/kanto-theme/Question.ui";
import type {
	ReviewRow,
	ReviewScreenProps,
} from "~/ui/kanto-theme/ReviewScreen.ui";

const noop = () => {};

export const REVIEW_DEX_NOTE = "every poll you saw is recorded in the Dex";

const REVIEW_LEAD = "Review";
const REVIEW_SEPARATOR = "·";
const CAUGHT = "caught";
const MATCHED = "matched";

export type PollVotes = ReadonlyMap<string, readonly OptionVotes[]>;
const NO_VOTES: PollVotes = new Map();

const stateOf = (
	answer: GateAnswer,
	label: string
): QuestionOption["state"] => {
	if (answer.correct.includes(label)) return "right";
	return answer.picked.includes(label) ? "wrong" : "idle";
};

const explanationOf = (
	answer: GateAnswer,
	label: string
): QuestionOption["explanation"] => {
	const text = answer.optionExplanations?.[label];
	if (text === undefined) return undefined;
	return { text, right: answer.correct.includes(label) };
};

const votersOf = (
	votes: readonly OptionVotes[] | undefined,
	label: string
): QuestionOption["voters"] => {
	const vote = votes?.find((entry) => entry.label === label);
	return vote === undefined
		? undefined
		: { climbers: vote.climbers, count: vote.count };
};

const pairsCardFor = (
	answer: GateAnswer,
	pairs: readonly AnsweredPair[]
): QuestionProps => ({
	answerType: answer.answerType,
	question: answer.question,
	...(answer.codeBlock === undefined ? {} : { codeBlock: answer.codeBlock }),
	options: [],
	pairs: answeredPairsFor(pairs, answer.pollId),
});

const cardFor = (answer: GateAnswer, votes: PollVotes): QuestionProps => {
	if (answer.pairs !== undefined) return pairsCardFor(answer, answer.pairs);
	const pollVotes =
		answer.pollId === undefined ? undefined : votes.get(answer.pollId);
	return {
		answerType: answer.answerType,
		question: answer.question,
		...(answer.codeBlock === undefined ? {} : { codeBlock: answer.codeBlock }),
		pickedIds: answer.picked,
		options: answer.options.map((label, index) => {
			const voters = votersOf(pollVotes, label);
			const explanation = explanationOf(answer, label);
			return {
				id: label,
				letter: letterAt(index),
				label,
				state: stateOf(answer, label),
				...(voters === undefined ? {} : { voters }),
				...(explanation === undefined ? {} : { explanation }),
			};
		}),
	};
};

const pairsTallyOf = (pairs: readonly AnsweredPair[]): string =>
	`${pairs.filter((pair) => pair.matched).length} of ${pairs.length} ${MATCHED}`;

const tallyOf = (answer: GateAnswer): string | undefined => {
	if (answer.pairs !== undefined) return pairsTallyOf(answer.pairs);
	if (answer.answerType !== "multiple") return undefined;
	const hits = answer.correct.filter((label) =>
		answer.picked.includes(label)
	).length;
	return `${hits} of ${answer.correct.length} ${CAUGHT}`;
};

const authorOf = (answer: GateAnswer): AuthorProps | undefined => {
	if (answer.author === undefined) return undefined;
	const { name, handle, userId, avatarUrl, borderUrl, role, title } =
		answer.author;
	return {
		...(handle === undefined ? { name } : { handle }),
		...(userId === undefined ? {} : { userId }),
		...(avatarUrl === undefined ? {} : { photoUrl: avatarUrl }),
		...(borderUrl === undefined ? {} : { borderUrl }),
		...(role === undefined ? {} : { role }),
		...(title === undefined ? {} : { title }),
	};
};

const reviewRowFor = (answer: GateAnswer, votes: PollVotes): ReviewRow => ({
	verdict: answer.outcome,
	share: answer.share,
	category: categoryName(answer.category),
	coverage: signedPercent(answer.coverage),
	coverageColor: coverageColor(answer.coverage),
	card: cardFor(answer, votes),
	tally: tallyOf(answer),
	explanation: answer.explanation,
	note: answer.note,
	author: authorOf(answer),
});

export type ReviewFrame = {
	gate: number;
	answers: readonly GateAnswer[];
	swatchGates?: readonly number[];
	balanceKb?: number;
	votes?: PollVotes;
};

export const reviewPropsFor = ({
	gate,
	answers,
	swatchGates = [],
	balanceKb,
	votes = NO_VOTES,
}: ReviewFrame): ReviewScreenProps => {
	const swatch = gateSwatchAt(gate);

	return {
		header: {
			swatch,
			title: `${REVIEW_LEAD} ${REVIEW_SEPARATOR} ${swatch.gateName}`,
			swatches: swatchTrackFor(swatchGates, gate),
			note: plural(answers.length, "poll"),
			funds:
				balanceKb === undefined
					? undefined
					: fundsOf(balanceKb, STORAGE_BALANCE),
			badges: [
				...answerTallyOf(answers),
				{
					label: signedPercent(totalCoverage(answers)),
					color: coverageColor(totalCoverage(answers)),
				},
			],
		},
		rows: answers.map((answer) => reviewRowFor(answer, votes)),
		footer: {
			note: REVIEW_DEX_NOTE,
			action: { label: GATE_SHOP_LABEL, icon: "shop", onPress: noop },
		},
	};
};
