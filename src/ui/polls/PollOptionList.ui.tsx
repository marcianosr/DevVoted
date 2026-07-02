import type { AnswerType } from "~/domains/polls/models/poll.model";

import { PollOptionRow } from "./PollOptionRow.ui";
import type { RemovedByConfig } from "./PollOptionRow.ui";

export type PollAnsweringOption = {
	id: string;
	text: string;
	disabled?: boolean;
	removedByConfig?: RemovedByConfig;
	markerEmoji?: string;
	markerTitle?: string;
};

type PollOptionListProps = {
	options: PollAnsweringOption[];
	selectedIds: string[];
	answerType: AnswerType;
	onToggle: (optionId: string) => void;
};

/**
 * The answer options as a vertical list of text lines. Radio inputs for
 * single-answer polls, checkboxes for multiple. Selection is reflected from
 * `selectedIds`; the caller decides toggle semantics via `onToggle`.
 */
export const PollOptionList = ({
	options,
	selectedIds,
	answerType,
	onToggle,
}: PollOptionListProps) => {
	const inputType = answerType === "single" ? "radio" : "checkbox";
	return (
		<div>
			<h2 className="text-2xl text-theme mb-4">Select your answer(s)!</h2>
			<ul className="space-y-2">
				{options.map((option) => (
					<PollOptionRow
						key={option.id}
						id={option.id}
						inputType={inputType}
						text={option.text}
						checked={selectedIds.includes(option.id)}
						disabled={option.disabled}
						removedByConfig={option.removedByConfig}
						markerEmoji={option.markerEmoji}
						markerTitle={option.markerTitle}
						onToggle={() => onToggle(option.id)}
					/>
				))}
			</ul>
		</div>
	);
};
