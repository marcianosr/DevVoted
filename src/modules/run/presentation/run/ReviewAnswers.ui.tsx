import { useState } from "react";

import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import { Button } from "~/ui/Button.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { AnswerResults, OutcomeCounts } from "./AnswerResults.ui";

type ReviewAnswersProps = {
	answered: readonly AnsweredPoll[];
};

export const ReviewAnswers = ({ answered }: ReviewAnswersProps) => {
	const [open, setOpen] = useState(false);

	if (answered.length === 0) return null;
	if (open) return <AnswerResults answered={answered} />;

	return (
		<div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-700 px-5 py-4">
			<div className="flex flex-wrap items-baseline gap-3">
				<Paragraph as="span" size="sm" className="font-bold">
					Review your {answered.length} answer
					{answered.length === 1 ? "" : "s"}
				</Paragraph>
				<OutcomeCounts answered={answered} />
			</div>
			<Button variant="secondary" size="small" onClick={() => setOpen(true)}>
				Review answers →
			</Button>
		</div>
	);
};
