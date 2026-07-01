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

/**
 * Submit row: solid theme action button (disabled until a pick is made) with a
 * hint / error line.
 */
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
			<button
				type="button"
				disabled={disabled}
				onClick={onSubmit}
				className={`px-6 py-3.5 text-base font-semibold transition-colors ${
					disabled
						? "bg-zinc-800 text-gray-500 cursor-not-allowed"
						: "bg-theme text-black cursor-pointer hover:opacity-90"
				}`}
			>
				{submitLabel(isSubmitting, submitted)}
			</button>
			{!canSubmit && hint && (
				<span className="text-xs text-gray-500">{hint}</span>
			)}
			{error && <span className="text-red-500 text-xl">{error}</span>}
		</div>
	);
};
