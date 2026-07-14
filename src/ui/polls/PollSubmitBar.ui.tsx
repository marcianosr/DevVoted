import { Button } from "~/ui/Button.component";

type PollSubmitBarProps = {
	canSubmit: boolean;
	isSubmitting: boolean;
	submitted: boolean;
	hint?: string;
	error?: string;
	onSubmit: () => void;
};

const submitLabel = (isSubmitting: boolean, submitted: boolean) => {
	if (submitted) return "Submitted!";
	if (isSubmitting) return "Submitting…";
	return "Submit answer →";
};

export const PollSubmitBar = ({
	canSubmit,
	isSubmitting,
	submitted,
	hint,
	error,
	onSubmit,
}: PollSubmitBarProps) => {
	const disabled = !canSubmit || isSubmitting || submitted;
	return (
		<div className="mt-6 flex flex-col items-end gap-2">
			<Button disabled={disabled} onClick={onSubmit}>
				{submitLabel(isSubmitting, submitted)}
			</Button>
			{!canSubmit && hint && (
				<span className="text-xs text-gray-500">{hint}</span>
			)}
			{error && <span className="text-red-500 text-xl">{error}</span>}
		</div>
	);
};
