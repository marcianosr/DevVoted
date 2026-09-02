import { CATEGORY_METADATA } from "~/shared/lib/categories";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	ReviewScreen,
	type ReviewRow,
} from "~/ui/terminal-theme/screens/ReviewScreen.ui";
import { plural } from "~/ui/terminal-theme/format";

const percent = (value: number) => `${value.toFixed(1)}%`;

const signed = (value: number) =>
	value > 0 ? `+${percent(value)}` : percent(value);

const joined = (labels: readonly string[] | undefined) =>
	labels === undefined || labels.length === 0 ? undefined : labels.join(", ");

const passed = (poll: AnsweredPoll) => poll.outcome === "correct";

const rowFor = (
	poll: AnsweredPoll,
	index: number,
	coveragePerWrong: number
): ReviewRow => {
	const shared = {
		id: `${poll.id}-${index}`,
		category: CATEGORY_METADATA[poll.category].name,
		question: poll.question,
		pollLabel: `poll ${index + 1}`,
		explainer: poll.explanation,
	};

	if (passed(poll)) {
		return { ...shared, gain: signed(poll.coverageEarned ?? 0) };
	}

	if (poll.outcome === "wrong") {
		return {
			...shared,
			expected: joined(poll.correct),
			picked: joined(poll.picked),
			cost: signed(coveragePerWrong),
		};
	}

	return {
		...shared,
		expected: joined(poll.correct),
		picked: joined(poll.picked),
		gain: signed(poll.coverageEarned ?? 0),
	};
};

export type ReviewViewProps = {
	view: RunView;
	back: { label: string; onUse: () => void };
};

export const ReviewView = ({ view, back }: ReviewViewProps) => {
	const answered = view.answeredThisGate;
	const reviewed = answered.map((poll, index) => ({
		poll,
		row: rowFor(poll, index, view.perAnswer.coveragePerWrong),
	}));
	const passedRows = reviewed
		.filter(({ poll }) => passed(poll))
		.map(({ row }) => row);
	const failedRows = reviewed
		.filter(({ poll }) => !passed(poll))
		.map(({ row }) => row);
	const gateName = swatchForGate(view.gateStake.gateNumber)?.gateName ?? "";

	return (
		<ReviewScreen
			theme={view.gateTheme}
			title={gateName === "" ? "Review" : `Review · ${gateName}`}
			meta={`${passedRows.length} passed · ${failedRows.length} failed · ${plural(answered.length, "poll")}`}
			failed={{ meta: `${failedRows.length}`, rows: failedRows }}
			passed={{ meta: `${passedRows.length}`, rows: passedRows }}
			backLabel={back.label}
			onBack={back.onUse}
		/>
	);
};
