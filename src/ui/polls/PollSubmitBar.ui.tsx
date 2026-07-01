type PollSubmitBarProps = {
	canSubmit: boolean;
	isSubmitting: boolean;
	submitted: boolean;
	eslintActive: boolean;
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
 * Submit row: solid theme action button (disabled until a pick is made),
 * optional ESLint-active chip, and a hint / error line.
 */
export const PollSubmitBar = ({
	canSubmit,
	isSubmitting,
	submitted,
	eslintActive,
	hint,
	error,
	onSubmit,
}: PollSubmitBarProps) => {
	const disabled = !canSubmit || isSubmitting || submitted;
	return (
		<div className="mt-6 flex flex-col items-end gap-2">
			<div className="flex items-center gap-4 flex-wrap justify-end">
				{eslintActive && (
					<span className="inline-flex items-center gap-2 border border-theme bg-theme/10 text-theme px-2.5 py-1.5 text-xs">
						<span>⌨</span>
						<span className="pixel">ESLint</span>
						<span className="font-bold">−1 wrong option</span>
						<span className="text-[8px] tracking-widest border border-theme/60 px-1 py-0.5">
							ACTIVE
						</span>
					</span>
				)}
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
			</div>
			{!canSubmit && hint && (
				<span className="text-xs text-gray-500">{hint}</span>
			)}
			{error && <span className="text-red-500 text-xl">{error}</span>}
		</div>
	);
};
