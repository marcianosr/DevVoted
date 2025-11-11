import { UseMutationResult } from "@tanstack/react-query";
import { PrimaryButton } from "~/ui/PrimaryButton";

type PollSubmissionFormProps = {
	hasAnswered: boolean;
	submitMutation: UseMutationResult<any, Error, any, unknown>;
	isSubmitting: boolean;
	children: React.ReactNode;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export const PollSubmissionForm = ({
	hasAnswered,
	submitMutation,
	isSubmitting,
	children,
	onSubmit,
}: PollSubmissionFormProps) => {
	return (
		<form onSubmit={onSubmit} method="POST">
			{children}
			<div className="mt-6 space-y-4">
				{(submitMutation.isError ||
					(submitMutation.isSuccess &&
						!submitMutation.data?.success)) && (
					<div className="p-3 bg-red-100 text-red-800">
						Failed to submit your options. Please try again.
					</div>
				)}

				{!hasAnswered && (
					<PrimaryButton type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Submitting..." : "Submit Options"}
					</PrimaryButton>
				)}
			</div>
		</form>
	);
};
