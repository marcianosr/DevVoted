import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { PollQuestionDisplay } from "./PollQuestionDisplay";
import { PollOptions } from "./PollOptions";
import { PollSubmissionForm } from "./PollSubmissionForm";
import { RunStatusDisplay } from "~/domains/runs/components/RunStatusDisplay";
import { ErrorComponent } from "~/ui/ErrorComponent";
import { StorageDeck } from "~/domains/economy/components/StorageDeck";
import { type EffectRenderProps } from "~/domains/configs/data/configs";

import { Run } from "~/domains/runs/models/run";
import { pollQueryKeys, runQueryKeys } from "~/domains/shared/queryKeys";
import { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { useState } from "react";
import { PollScoreBreakdown } from "~/domains/score/services/score.service";
import {
	calculateThresholdInfo,
	type GateDefinition,
} from "~/domains/runs/services/thresholdCalculator.service";
import { getCategories } from "~/domains/shared/categories";
import { PollAnswerReview } from "./PollAnswerReview";
import { getTotalPollsSeen } from "~/domains/polls/api/polls";
import { getAuthenticatedUserId } from "~/utils/authorization";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { postPollOptionsHandler } from "~/domains/polls/api/handlers";
import { User } from "~/domains/users/services/userSync.service";
import { ApiResponse } from "~/utils/errorHandling";
import { PrimaryButton } from "~/ui/PrimaryButton";
import { Link } from "@tanstack/react-router";

type DefaultSelectedOptions = string[];
const defaultSelectedOptions: DefaultSelectedOptions = [];

type SubmissionResult = {
	selectedOptionIds: number[];
	correctOptionIds: number[];
	isCorrect: boolean;
};

type PollContentProps = {
	pollData: PollWithOptionsResponse;
	effectProps: EffectRenderProps;
	user: User;
	activeRun: Run | null;
	lastScoreBreakdown: PollScoreBreakdown | null;
	setLastScoreBreakdown: (breakdown: PollScoreBreakdown | null) => void;
};

export const submitPollOptions = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			pollId: z.number().int().positive(),
			selectedOptions: z.array(z.string()).min(1),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return postPollOptionsHandler({ data: { ...data, userId } });
	});

const PollContent: React.FC<PollContentProps> = ({
	pollData,
	effectProps,
	user,
	activeRun,
	lastScoreBreakdown,
	setLastScoreBreakdown,
}) => {
	const queryClient = useQueryClient();
	const { poll, options, hasAnswered } = pollData;

	const [submissionResult, setSubmissionResult] =
		useState<SubmissionResult | null>(null);

	// Fetch total polls seen for round calculation
	const { data: totalPollsSeenData } = useQuery({
		queryKey: pollQueryKeys.totalSeen(user?.id),
		queryFn: () => getTotalPollsSeen(),
		enabled: !!user?.id,
	});
	const totalPollsSeen = totalPollsSeenData?.success
		? totalPollsSeenData.data
		: 0;

	const submitOptionsMutation = useMutation({
		// 1️⃣ OPTIMISTIC UPDATE (happens BEFORE server call)
		onMutate: async () => {
			// Use the same query key that was used to fetch the daily poll in daily-poll.tsx
			// This ensures we're updating the correct cache entry
			const pollQueryKey = pollQueryKeys.daily(user?.id);

			console.log("Optimistically updating poll as answered:", poll.id);

			// Cancel any outgoing refetches to prevent race conditions
			await queryClient.cancelQueries({ queryKey: pollQueryKey });

			// Snapshot the previous cache data for potential rollback
			const previousData = queryClient.getQueryData(pollQueryKey);

			// Optimistically update the cache to show the poll as answered immediately
			// This provides instant UI feedback before the server responds
			queryClient.setQueryData<ApiResponse<PollWithOptionsResponse>>(
				pollQueryKey,
				(old) => {
					// Guard: If cache is empty or invalid, skip update
					if (!old?.success || !old?.data) {
						console.log("No cached data to update");
						return old;
					}

					// Return updated cache with hasAnswered set to true
					// Preserve API response structure: { success: true, data: { poll, options, hasAnswered } }
					return {
						...old,
						data: {
							...old.data,
							hasAnswered: true,
						},
					};
				}
			);

			// Return context for error rollback
			return { previousData, pollQueryKey };
		},
		// 2️⃣ SERVER CALL (happens automatically after onMutate)
		mutationFn: submitPollOptions,
		// 3️⃣ SUCCESS HANDLING
		onSuccess: async (data) => {
			if (data.success) {
				const isCorrect = data.data?.isCorrect;
				const runEnded = data.data?.runEnded;
				const breakdown = data.data?.breakdown;

				// Store the submission result for answer review
				if (data.data?.selectOptions && data.data?.correctOptions) {
					setSubmissionResult({
						selectedOptionIds: data.data.selectOptions,
						correctOptionIds: data.data.correctOptions,
						isCorrect: isCorrect ?? false,
					});
				}

				// Store the score breakdown for display in shop
				if (breakdown) {
					setLastScoreBreakdown(breakdown);
				}

				if (runEnded) {
					console.log("Run ended. Coverage tracking reset.");
				}

				if (isCorrect) {
					console.log("Correct answer! Coverage awarded.");
				}
				if (!isCorrect && runEnded) {
					console.log("Wrong answer! Run ended!");
				}
				if (!isCorrect && !runEnded) {
					console.log("Answer submitted, but incorrect.");
				}

				// Refetch the active run data to get updated coverage BEFORE opening shop
				await queryClient.refetchQueries({
					queryKey: runQueryKeys.active(user?.id),
				});

				// openShop();
				return;
			}

			console.error("Error submitting Options:", data.error);
		},
		onError: (error, _variables, context) => {
			console.error("Mutation error:", error);
			if (context?.previousData && context?.pollQueryKey) {
				queryClient.setQueryData(
					context.pollQueryKey,
					context.previousData
				);
			}
		},
	});

	const form = useForm({
		defaultValues: {
			selectedOptions: defaultSelectedOptions,
		},
		onSubmit: async ({ value }) => {
			const { selectedOptions } = value;

			if (!user?.id) {
				console.error("User ID is missing");
				return;
			}

			// Submit the Options using our mutation with the pollId from poll data
			submitOptionsMutation.mutate({
				data: {
					pollId: poll.id,
					selectedOptions,
				},
			});
		},
	});

	if (!poll) {
		return <ErrorComponent text="Sorry, the poll could not be found" />;
	}

	if (poll.status !== "open") {
		return <ErrorComponent text="Sorry, this poll is closed today!" />;
	}

	const categoryMeta = getCategories();
	const currentCategory = categoryMeta.find(
		(cat) => cat.code === poll.categoryCode
	);

	return (
		<section className={`max-w-4xl mx-auto mt-16`}>
			<section className="md:grid grid-cols-12 gap-4">
				<div className="col-span-12">
					{/* STORAGE AND CONFIG OVERVIEW */}
					{/* {activeRun && (
						<div className="p-4 bg-zinc-900">
							<div className="text-theme">
								<StorageDeck run={activeRun} />
							</div>
						</div>
					)} */}

					{/* POLL CONTENT */}
					<div>
						<div className="text-5xl border-b border-theme text-theme pb-4">
							{currentCategory?.name}
						</div>
						<PollQuestionDisplay poll={poll} />
						{poll.codeSandboxExample && (
							<div className="my-4">
								<iframe
									src={poll.codeSandboxExample}
									className="w-full h-96 border border-gray-600"
									title="CodeSandbox Example"
									allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
									sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
								></iframe>
							</div>
						)}
						{poll.codeBlock && (
							<pre className="bg-gray-800 text-gray-100 p-4 rounded my-4 overflow-x-auto">
								<code>{poll.codeBlock}</code>
							</pre>
						)}
						{!submitOptionsMutation.isSuccess && (
							<PollSubmissionForm
								hasAnswered={hasAnswered}
								submitMutation={submitOptionsMutation}
								isSubmitting={form.state.isSubmitting}
								onSubmit={(e) => {
									e.preventDefault();
									form.handleSubmit();
								}}
							>
								<form.Field
									name="selectedOptions"
									children={(field) => (
										<PollOptions
											poll={poll}
											options={options}
											field={field}
											disabled={hasAnswered}
											disabledOptionIds={
												effectProps?.disabledOptionIds
											}
										/>
									)}
								/>
							</PollSubmissionForm>
						)}

						{submitOptionsMutation.isSuccess &&
							submissionResult && (
								<>
									<PollAnswerReview
										poll={poll}
										options={options}
										selectedOptionIds={
											submissionResult.selectedOptionIds
										}
										correctOptionIds={
											submissionResult.correctOptionIds
										}
										isCorrect={submissionResult.isCorrect}
									/>
								</>
							)}
					</div>
					{hasAnswered && (
						<div className="mt-8 flex flex-col">
							<Link to="/progress">
								<PrimaryButton className="mt-4">
									Proceed to progress
								</PrimaryButton>
							</Link>
						</div>
					)}
				</div>
			</section>
		</section>
	);
};

export default PollContent;
