import type { ReactNode } from "react";

import type { AnswerType } from "~/domains/polls/models/poll.model";

import { PollActiveConfigStrip } from "./PollActiveConfigStrip.ui";
import type { ActivePollConfig } from "./PollActiveConfigStrip.ui";
import { PollOptionList } from "./PollOptionList.ui";
import type { PollAnsweringOption } from "./PollOptionList.ui";
import { PollQuestionHeading } from "./PollQuestionHeading.ui";
import { PollSubmitBar } from "./PollSubmitBar.ui";

export type PollAnsweringLiveHint = {
	text: string;
	tone: "correct" | "incorrect";
};

export type PollAnsweringSubmit = {
	canSubmit: boolean;
	isSubmitting: boolean;
	submitted: boolean;
	hint?: string;
	error?: string;
	onSubmit: () => void;
};

type PollAnsweringScreenProps = {
	question: string;
	answerType: AnswerType;
	activeConfigs: ActivePollConfig[];
	options: PollAnsweringOption[];
	selectedIds: string[];
	liveHint?: PollAnsweringLiveHint;
	onToggle: (optionId: string) => void;
	submit: PollAnsweringSubmit;
	codeSlot?: ReactNode;
};

/**
 * The poll answering body: question, any code sample, the active-config strip,
 * the answer options, and the submit bar. Pure composition over plain data so
 * the whole screen renders from mocks in Storybook. The run/category header is
 * rendered separately by the container.
 */
export const PollAnsweringScreen = ({
	question,
	answerType,
	activeConfigs,
	options,
	selectedIds,
	liveHint,
	onToggle,
	submit,
	codeSlot,
}: PollAnsweringScreenProps) => (
	<div>
		<PollQuestionHeading question={question} />
		{codeSlot}
		<div className="mb-6">
			<PollActiveConfigStrip configs={activeConfigs} />
		</div>
		{liveHint && (
			<p
				className={`text-xl mb-3 ${liveHint.tone === "correct" ? "text-green-400" : "text-red-400"}`}
			>
				{liveHint.text}
			</p>
		)}
		<PollOptionList
			options={options}
			selectedIds={selectedIds}
			answerType={answerType}
			onToggle={onToggle}
		/>
		<PollSubmitBar
			canSubmit={submit.canSubmit}
			isSubmitting={submit.isSubmitting}
			submitted={submit.submitted}
			hint={submit.hint}
			error={submit.error}
			onSubmit={submit.onSubmit}
		/>
	</div>
);
