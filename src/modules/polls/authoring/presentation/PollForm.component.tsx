import { useState } from "react";

import {
	CATEGORY_CHOICES,
	EMPTY_POLL_FORM,
	UNPLAYED,
	addAnswer,
	answerRowsOf,
	canAddAnswer,
	canLockIn,
	canRemoveAnswer,
	changeAnswer,
	changeAnswerExplanation,
	lockInPreview,
	markRight,
	pickInPreview,
	previewCategoryOf,
	previewOf,
	questionCountOf,
	refusalOf,
	removeAnswer,
	rewardOf,
	stepsDoneOf,
	submissionOf,
	withAnswerType,
	withCategory,
	withCodeBlock,
	withInlineCode,
	withStatus,
	type PollFormData,
	type PollFormMode,
	type PollFormState,
	type PollFormView,
	type PreviewPlay,
} from "~/modules/polls/authoring/application/pollForm.viewmodel";
import type { PollStep } from "~/modules/polls/authoring/application/pollList.viewmodel";
import { PollForm as PollFormUI } from "~/modules/polls/authoring/presentation/PollForm.ui";
import type { CategoryBounty } from "~/modules/polls/poll/domain/pollBounty.model";
import type { SelectOption } from "~/ui/kanto-theme/Select.ui";

export type PollFormProps = {
	mode: PollFormMode;
	pollNumber?: number;
	initial?: PollFormState;
	bounties?: readonly CategoryBounty[];
	statuses?: readonly SelectOption[];
	error?: string;
	submitting: boolean;
	listHref?: string;
	step?: PollStep;
	onSubmit: (data: PollFormData) => void;
	onSubmitAndNext?: (data: PollFormData) => void;
};

export const PollForm = ({
	mode,
	pollNumber,
	initial,
	bounties = [],
	statuses,
	error,
	submitting,
	listHref,
	step,
	onSubmit,
	onSubmitAndNext,
}: PollFormProps) => {
	const [state, setState] = useState<PollFormState>(initial ?? EMPTY_POLL_FORM);
	const [view, setView] = useState<PollFormView>("write");
	const [play, setPlay] = useState<PreviewPlay>(UNPLAYED);
	const submission = submitting ? undefined : submissionOf(state);

	return (
		<PollFormUI
			mode={mode}
			pollNumber={pollNumber}
			state={state}
			view={view}
			rows={answerRowsOf(state)}
			questionCount={questionCountOf(state.question)}
			steps={stepsDoneOf(state)}
			preview={previewOf(state, play)}
			previewCategory={previewCategoryOf(state)}
			revealed={play.revealed}
			onPreviewPick={(id) =>
				setPlay((current) => pickInPreview(current, state, id))
			}
			onLockIn={
				canLockIn(state, play) ? () => setPlay(lockInPreview) : undefined
			}
			categories={CATEGORY_CHOICES}
			statuses={statuses}
			reward={mode === "suggest" ? rewardOf(state, bounties) : undefined}
			refusal={refusalOf(state)}
			error={error}
			saving={submitting}
			onQuestion={(question) =>
				setState((current) => ({ ...current, question }))
			}
			onInlineCode={() => setState(withInlineCode)}
			onCodeBlock={() => setState(withCodeBlock)}
			onView={(next) => {
				setPlay(UNPLAYED);
				setView(next);
			}}
			onAnswerType={(answerType) =>
				setState((current) => withAnswerType(current, answerType))
			}
			onAnswerChange={(key, text) =>
				setState((current) => changeAnswer(current, key, text))
			}
			onAnswerExplanationChange={(key, text) =>
				setState((current) => changeAnswerExplanation(current, key, text))
			}
			onMarkRight={(key) => setState((current) => markRight(current, key))}
			onAddAnswer={canAddAnswer(state) ? () => setState(addAnswer) : undefined}
			onRemoveAnswer={
				canRemoveAnswer(state)
					? (key) => setState((current) => removeAnswer(current, key))
					: undefined
			}
			onCategory={(value) =>
				setState((current) => withCategory(current, value))
			}
			onStatus={(value) => setState((current) => withStatus(current, value))}
			onSandbox={(codeSandboxExample) =>
				setState((current) => ({ ...current, codeSandboxExample }))
			}
			onExplanation={(explanation) =>
				setState((current) => ({ ...current, explanation }))
			}
			listHref={listHref}
			step={step}
			nextAhead={step?.nextHref !== undefined}
			onSubmit={
				submission === undefined ? undefined : () => onSubmit(submission)
			}
			onSubmitAndNext={
				onSubmitAndNext === undefined || submission === undefined
					? undefined
					: () => onSubmitAndNext(submission)
			}
		/>
	);
};
