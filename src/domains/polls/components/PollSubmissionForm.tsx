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
				{submitMutation.isSuccess && submitMutation.data?.success && (
					<div className="p-3 bg-green-100 text-green-800 rounded">
						<div className="font-semibold">
							Your options have been submitted successfully!
						</div>
						{submitMutation.data?.data?.xpEarned !== undefined && (
							<div className="text-sm mt-1 space-y-1">
								{submitMutation.data.data.xpEarned > 0 ? (
									<span className="text-green-700">
										🎉 You earned {submitMutation.data.data.xpEarned} XP!
									</span>
								) : (
									<span className="text-orange-700">
										❌ No XP earned this time.
									</span>
								)}

								{submitMutation.data.data.thresholdInfo && (
									<div
										className={`mt-2 p-2 border rounded ${
											submitMutation.data.data.runEnded
												? "bg-red-50 border-red-200"
												: "bg-blue-50 border-blue-200"
										}`}
									>
										<div
											className={`font-medium ${
												submitMutation.data.data.runEnded
													? "text-red-800"
													: "text-blue-800"
											}`}
										>
											{submitMutation.data.data.runEnded
												? "❌ Run Ended!"
												: `Poll #${submitMutation.data.data.thresholdInfo.pollNumber} Progress:`}
										</div>
										<div
											className={`text-xs ${
												submitMutation.data.data.runEnded
													? "text-red-700"
													: "text-blue-700"
											}`}
										>
											{submitMutation.data.data.thresholdInfo.currentXp} /{" "}
											{submitMutation.data.data.thresholdInfo.requiredXp} XP
											{submitMutation.data.data.runEnded ? (
												<span className="text-red-700 ml-2">
													💀 Threshold not met - Run reset
												</span>
											) : submitMutation.data.data.thresholdInfo
													.meetsThreshold ? (
												<span className="text-green-700 ml-2">
													✅ Threshold met!
												</span>
											) : (
												<span className="text-orange-700 ml-2">
													⚠️ Need{" "}
													{submitMutation.data.data.thresholdInfo.requiredXp -
														submitMutation.data.data.thresholdInfo
															.currentXp}{" "}
													more XP
												</span>
											)}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{(submitMutation.isError ||
					(submitMutation.isSuccess && !submitMutation.data?.success)) && (
					<div className="p-3 bg-red-100 text-red-800">
						Failed to submit your options. Please try again.
						{submitMutation.data?.error && (
							<div className="text-sm mt-1">{submitMutation.data.error}</div>
						)}
					</div>
				)}

				<PrimaryButton
					type="submit"
					disabled={hasAnswered || submitMutation.isPending || isSubmitting}
				>
					{hasAnswered
						? "Already Answered"
						: submitMutation.isPending
							? "Submitting..."
							: "Submit Options"}
				</PrimaryButton>
			</div>
		</form>
	);
};
