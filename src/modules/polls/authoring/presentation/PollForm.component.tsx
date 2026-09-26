import { useState } from "react";

import {
	PollForm as PollFormUI,
	type PollFormOption,
} from "~/modules/polls/authoring/presentation/PollForm.ui";
import {
	POLL_STATUSES,
	type AnswerType,
	type Poll,
	type PollStatus,
} from "~/modules/polls/poll/domain/poll.model";
import type { PollOption } from "~/modules/polls/poll/domain/pollOption.model";
import type { CategoryCode } from "~/shared/lib/categories";

const MIN_OPTIONS = 3;
const MAX_OPTIONS = 20;

export type PollFormData = {
	poll: {
		question: string;
		status: PollStatus;
		answerType: AnswerType;
		categoryCode: CategoryCode;
		codeBlock: string | null;
		codeSandboxExample: string | null;
		explanation: string | null;
	};
	options: PollFormOption[];
};

type PollFormProps = {
	initialData?: Poll & { options: PollOption[] };
	onSubmit: (data: PollFormData) => Promise<void>;
	isSubmitting: boolean;
	isAdmin?: boolean;
};

const emptyOption = (): PollFormOption => ({ option: "", correct: false });

const startingOptions = (options?: PollOption[]): PollFormOption[] =>
	options?.map(({ id, option, correct }) => ({ id, option, correct })) ??
	Array.from({ length: MIN_OPTIONS }, emptyOption);

export const PollForm = ({
	initialData,
	onSubmit,
	isSubmitting,
	isAdmin = false,
}: PollFormProps) => {
	const [question, setQuestion] = useState(initialData?.question ?? "");
	const [status, setStatus] = useState<PollStatus>(
		initialData?.status ?? "draft"
	);
	const [answerType, setAnswerType] = useState<AnswerType>(
		initialData?.answerType ?? "single"
	);
	const [categoryCode, setCategoryCode] = useState<CategoryCode>(
		initialData?.categoryCode ?? "js"
	);
	const [codeBlock, setCodeBlock] = useState(initialData?.codeBlock ?? "");
	const [codeSandboxExample, setCodeSandboxExample] = useState(
		initialData?.codeSandboxExample ?? ""
	);
	const [explanation, setExplanation] = useState(
		initialData?.explanation ?? ""
	);
	const [options, setOptions] = useState<PollFormOption[]>(
		startingOptions(initialData?.options)
	);
	const [showPreview, setShowPreview] = useState(false);

	const addOption = () =>
		setOptions((current) =>
			current.length >= MAX_OPTIONS ? current : [...current, emptyOption()]
		);

	const removeOption = (index: number) =>
		setOptions((current) =>
			current.length <= MIN_OPTIONS
				? current
				: current.filter((_, position) => position !== index)
		);

	const changeOption = (index: number, value: string) =>
		setOptions((current) =>
			current.map((option, position) =>
				position === index ? { ...option, option: value } : option
			)
		);

	const toggleCorrect = (index: number) =>
		setOptions((current) =>
			current.map((option, position) => {
				if (answerType === "single") {
					return { ...option, correct: position === index };
				}
				return position === index
					? { ...option, correct: !option.correct }
					: option;
			})
		);

	const submit = async () => {
		await onSubmit({
			poll: {
				question,
				status,
				answerType,
				categoryCode,
				codeBlock: codeBlock || null,
				codeSandboxExample: codeSandboxExample || null,
				explanation: explanation || null,
			},
			options,
		});
	};

	const isValid =
		question.length >= 10 &&
		options.some((option) => option.correct) &&
		options.length >= MIN_OPTIONS &&
		options.every((option) => option.option.trim().length > 0);

	return (
		<PollFormUI
			question={question}
			status={status}
			statusOptions={POLL_STATUSES}
			answerType={answerType}
			categoryCode={categoryCode}
			codeBlock={codeBlock}
			codeSandboxExample={codeSandboxExample}
			explanation={explanation}
			options={options}
			minOptions={MIN_OPTIONS}
			maxOptions={MAX_OPTIONS}
			showPreview={showPreview}
			isAdmin={isAdmin}
			isSubmitting={isSubmitting}
			isValid={isValid}
			isEditing={Boolean(initialData)}
			onQuestionChange={setQuestion}
			onStatusChange={setStatus}
			onAnswerTypeChange={setAnswerType}
			onCategoryChange={setCategoryCode}
			onCodeBlockChange={setCodeBlock}
			onCodeSandboxChange={setCodeSandboxExample}
			onExplanationChange={setExplanation}
			onOptionChange={changeOption}
			onCorrectChange={toggleCorrect}
			onAddOption={addOption}
			onRemoveOption={removeOption}
			onTogglePreview={setShowPreview}
			onSubmit={submit}
		/>
	);
};
