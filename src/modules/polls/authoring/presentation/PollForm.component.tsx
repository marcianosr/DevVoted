import { useState } from "react";

import {
	CATEGORY_CHOICES,
	EMPTY_POLL_FORM,
	addAnswer,
	answerRowsOf,
	answersCountOf,
	canAddAnswer,
	canRemoveAnswer,
	changeAnswer,
	markRight,
	previewOf,
	questionCountOf,
	refusalOf,
	removeAnswer,
	toPollFormData,
	withAnswerType,
	withCategory,
	withStatus,
	type PollFormData,
	type PollFormMode,
	type PollFormState,
	type PollFormView,
} from "~/modules/polls/authoring/application/pollForm.viewmodel";
import { PollForm as PollFormUI } from "~/modules/polls/authoring/presentation/PollForm.ui";
import type { SelectOption } from "~/ui/kanto-theme/Select.ui";

export type PollFormProps = {
	mode: PollFormMode;
	pollNumber?: number;
	initial?: PollFormState;
	statuses?: readonly SelectOption[];
	error?: string;
	submitting: boolean;
	onSubmit: (data: PollFormData) => void;
};

export const PollForm = ({
	mode,
	pollNumber,
	initial,
	statuses,
	error,
	submitting,
	onSubmit,
}: PollFormProps) => {
	const [state, setState] = useState<PollFormState>(initial ?? EMPTY_POLL_FORM);
	const [view, setView] = useState<PollFormView>("write");
	const refusal = refusalOf(state);

	return (
		<PollFormUI
			mode={mode}
			pollNumber={pollNumber}
			state={state}
			view={view}
			rows={answerRowsOf(state)}
			questionCount={questionCountOf(state.question)}
			answersCount={answersCountOf(state.answers)}
			preview={previewOf(state)}
			categories={CATEGORY_CHOICES}
			statuses={statuses}
			refusal={refusal}
			error={error}
			saving={submitting}
			onQuestion={(question) =>
				setState((current) => ({ ...current, question }))
			}
			onView={setView}
			onAnswerType={(answerType) =>
				setState((current) => withAnswerType(current, answerType))
			}
			onAnswerChange={(key, text) =>
				setState((current) => changeAnswer(current, key, text))
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
			onSubmit={
				refusal === undefined && !submitting
					? () => onSubmit(toPollFormData(state))
					: undefined
			}
		/>
	);
};
