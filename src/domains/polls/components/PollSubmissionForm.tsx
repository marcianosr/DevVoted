import { UseMutationResult } from "@tanstack/react-query";

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
	onSubmit 
}: PollSubmissionFormProps) => {
	return (
		<form onSubmit={onSubmit} method="POST">
			{children}
			
			<div className="mt-6 space-y-4">
				{submitMutation.isSuccess && submitMutation.data?.success && (
					<div className="p-3 bg-green-100 text-green-800 rounded">
						<div className="font-semibold">Your options have been submitted successfully!</div>
						{submitMutation.data?.data?.xpEarned !== undefined && (
							<div className="text-sm mt-1">
								{submitMutation.data.data.xpEarned > 0 ? (
									<span className="text-green-700">
										🎉 You earned {submitMutation.data.data.xpEarned} XP!
									</span>
								) : (
									<span className="text-orange-700">
										{submitMutation.data.data.runEnded ? 
											"❌ Incorrect answer! Run ended, all XP reset to 0." : 
											"❌ No XP earned this time."}
									</span>
								)}
							</div>
						)}
					</div>
				)}

				{(submitMutation.isError || 
				  (submitMutation.isSuccess && !submitMutation.data?.success)) && (
					<div className="p-3 bg-red-100 text-red-800 rounded">
						Failed to submit your options. Please try again.
						{submitMutation.data?.error && (
							<div className="text-sm mt-1">{submitMutation.data.error}</div>
						)}
					</div>
				)}

				<button
					type="submit"
					className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
					disabled={hasAnswered || submitMutation.isPending || isSubmitting}
				>
					{hasAnswered
						? "Already Answered"
						: submitMutation.isPending
						? "Submitting..."
						: "Submit Options"}
				</button>
			</div>
		</form>
	);
};