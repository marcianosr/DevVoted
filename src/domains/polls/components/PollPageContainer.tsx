import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { postPollOptionsHandler } from "~/domains/polls/api/handlers";
import { PollQuestionDisplay } from "./PollQuestionDisplay";
import { PollOptions } from "./PollOptions";
import { PollSubmissionForm } from "./PollSubmissionForm";
import { useActiveRun } from "~/domains/runs/hooks";
import { RunStatusDisplay } from "~/domains/runs/components/RunStatusDisplay";
import { StartRunScreen } from "~/domains/runs/components/StartRunScreen";
import { ErrorComponent } from "~/ui/ErrorComponent";
import { LoadingSkeleton } from "~/ui/LoadingSkeleton";
import { StorageDeck } from "~/domains/economy/components/StorageDeck";
import { Shop } from "~/domains/economy/components/Shop";
import {
	ShopProvider,
	useShopContext,
} from "~/domains/economy/contexts/ShopContext";
import {
	applyEffects,
	configs,
	type EffectRenderProps,
} from "~/domains/configs/data/configs";
import {
	addConfigToRunServerFn,
	removeConfigFromRunServerFn,
} from "~/domains/configs/api/configs";
import { Run } from "~/domains/runs/models/run";
import { pollQueryKeys, runQueryKeys } from "~/domains/shared/queryKeys";
import { Poll, PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { getRandomConfigs } from "~/domains/economy/services/configManager.service";
import { useMemo, useState } from "react";
import { rerollShopServerFn } from "~/domains/runs/api/reroll";
import { PollScoreBreakdown } from "~/domains/score/services/score.service";
import {
	calculateThresholdInfo,
	type GateDefinition,
} from "~/domains/runs/services/thresholdCalculator.service";
import { getCategories } from "~/domains/shared/categories";
import { formatCoverage } from "~/domains/score/services/score.service";
import { PollAnswerReview } from "./PollAnswerReview";
import { getAuthenticatedUserId } from "~/utils/authorization";
import { getTotalPollsSeen } from "~/domains/polls/api/polls";

/**
 * Format gate requirements for display
 * Examples:
 * - "10% in 1 category"
 * - "15% in 1 OR 10% in 2 categories"
 * - "30% in 1 AND 15% in another"
 */
const formatGateRequirements = (
	gateDefinition: GateDefinition | null
): string => {
	if (!gateDefinition) return "";

	const { requirements, evaluationMode } = gateDefinition;

	if (requirements.length === 1) {
		const req = requirements[0];
		return `${req.threshold}% in ${req.requiredCategories} ${req.requiredCategories === 1 ? "category" : "categories"}`;
	}

	const formattedReqs = requirements.map(
		(req) =>
			`${req.threshold}% in ${req.requiredCategories} ${req.requiredCategories === 1 ? "category" : "categories"}`
	);

	if (evaluationMode === "AND" && requirements.length === 2) {
		// Special formatting for AND with 2 requirements
		return `${requirements[0].threshold}% in 1 AND ${requirements[1].threshold}% in another`;
	}

	return formattedReqs.join(` ${evaluationMode} `);
};

type DefaultSelectedOptions = string[];
const defaultSelectedOptions: DefaultSelectedOptions = [];

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

type SubmissionResult = {
	selectedOptionIds: number[];
	correctOptionIds: number[];
	isCorrect: boolean;
};

type PollContentProps = {
	pollData: PollWithOptionsResponse;
	effectProps: EffectRenderProps;
	user: any;
	activeRun: Run | null;
	lastScoreBreakdown: PollScoreBreakdown | null;
	setLastScoreBreakdown: (breakdown: PollScoreBreakdown | null) => void;
	costReduction: number;
};

const PollContent: React.FC<PollContentProps> = ({
	pollData,
	effectProps,
	user,
	activeRun,
	lastScoreBreakdown,
	setLastScoreBreakdown,
	costReduction,
}) => {
	const { openShop, isShopOpen } = useShopContext();
	const queryClient = useQueryClient();
	const { poll, options, hasAnswered } = pollData;

	const [rerollKey, setRerollKey] = useState(0);
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

	// TODO: Put in a hook
	const randomConfigs = useMemo(() => {
		if (!activeRun) return [];
		return getRandomConfigs({
			run: activeRun,
			configs,
			count: 3,
		});
	}, [activeRun?.id, rerollKey]);

	const submitOptionsMutation = useMutation({
		// 1️⃣ OPTIMISTIC UPDATE (happens BEFORE server call)
		onMutate: async () => {
			const pollQueryKey = pollQueryKeys.withOptions(poll.id, user?.id);

			await queryClient.cancelQueries({ queryKey: pollQueryKey }); // Stop background refetches!
			const previousData = queryClient.getQueryData(pollQueryKey);

			// Update UI instantly
			queryClient.setQueryData(pollQueryKey, (old) => {
				if (!old) {
					console.log("No cached data to update");
					return old;
				}

				return {
					...old,
					hasAnswered: true,
				};
			});

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

				openShop();
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

	const rerollMutation = useMutation({
		mutationFn: rerollShopServerFn,
		onSuccess: (data) => {
			if (data.success) {
				// Force regeneration of random configs
				setRerollKey((prev) => prev + 1);
				// Invalidate run query to get updated reroll count and KB spent
				queryClient.invalidateQueries({
					queryKey: runQueryKeys.active(user?.id),
				});
			}
		},
	});

	const handleReroll = () => {
		if (activeRun?.id) {
			rerollMutation.mutate({ data: { runId: activeRun.id } });
		}
	};

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

	const thresholdInfo =
		activeRun && activeRun.categoryCoverage
			? calculateThresholdInfo(activeRun.categoryCoverage, totalPollsSeen)
			: null;

	// Get coverage for the current category being answered
	const currentCategoryCoverage =
		activeRun?.categoryCoverage.find(
			(coverage) => coverage.categoryCode === poll.categoryCode
		)?.currentCoverage ?? 0;

	return (
		<section className={`p-2 max-w-7xl mx-auto`}>
			<section className="md:grid grid-cols-12 gap-4">
				<div className="col-span-4 flex flex-col gap-8">
					<div className="text-4xl text-theme">
						{currentCategory?.name}
					</div>

					<div className="text-theme flex flex-col">
						<div className="flex flex-col">
							<span className="text-3xl">
								Round {thresholdInfo?.currentRound}
							</span>
							<small className="text-white text-lg">
								Poll {thresholdInfo?.pollInRound} of 5
							</small>
						</div>

						<span className="text-xs text-gray-400">
							{/* TODO make more CI like github actions */}
							{thresholdInfo?.isThresholdCheckPoll && (
								<span className="ml-2 text-red-400">
									CI ⚠️ Checking...
								</span>
							)}
						</span>

						<div className="mt-2">
							{thresholdInfo && (
								<>
									<div className="border border-theme p-2">
										<p className="text-white underline underline-offset-4">
											Win conditions:{" "}
										</p>
										<p className="text-theme">
											{formatGateRequirements(
												thresholdInfo.gateDefinition
											)}
										</p>
										{thresholdInfo.qualifyingCategories
											.length > 0 && (
											<div className="mt-1 text-green-400">
												CI: ✓ Passing:{" "}
												{thresholdInfo.qualifyingCategories.join(
													", "
												)}
											</div>
										)}
										{!thresholdInfo.meetsThreshold &&
											thresholdInfo.isThresholdCheckPoll && (
												<div className="mt-1 text-red-400">
													⚠️ Not meeting gate
													requirements
												</div>
											)}
									</div>
								</>
							)}
						</div>
					</div>
					{activeRun && (
						<RunStatusDisplay
							activeRun={activeRun}
							currentCategoryCode={poll.categoryCode}
							lastScoreBreakdown={lastScoreBreakdown}
						/>
					)}

					{/* <ul className="text-gray-400 text-xs">
							<li>Poll #{poll.id}</li>
							<li>Run #{activeRun?.id}</li>
							<li>Amp x1.4</li>
						</ul> */}
				</div>

				{/* Main content area - terminal style */}
				<div className="col-span-8">
					<div className="p-4 bg-zinc-900">
						{activeRun && (
							<div className="text-theme">
								<StorageDeck run={activeRun} />
							</div>
						)}
					</div>
					<div className="p-4 mt-8">
						{/* Question display with category color accent */}
						<PollQuestionDisplay poll={poll} />

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

									{isShopOpen && activeRun && (
										<div className="mt-4">
											<Shop
												activeRun={activeRun}
												offeredConfigs={randomConfigs}
												onReroll={handleReroll}
												costReduction={costReduction}
											/>
										</div>
									)}
								</>
							)}
					</div>
				</div>
			</section>
		</section>
	);
};

type PollPageContainerProps = {
	user: any; // TODO: remove thise any
	poll: PollWithOptionsResponse;
};

export const PollPageContainer: React.FC<PollPageContainerProps> = ({
	user,
	poll,
}) => {
	const queryClient = useQueryClient();
	const [lastScoreBreakdown, setLastScoreBreakdown] =
		useState<PollScoreBreakdown | null>(null);

	const {
		activeRun,
		hasActiveRun,
		isLoading: isLoadingRun,
		error: runError,
		startRun,
		isStarting,
	} = useActiveRun(user?.id);

	console.log("PollPageContainer render:", poll);

	const addConfigsMutation = useMutation({
		mutationFn: addConfigToRunServerFn,
		onMutate: async (variables) => {
			const activeRunQueryKey = runQueryKeys.active(user?.id);
			await queryClient.cancelQueries({ queryKey: activeRunQueryKey });
			const previousData = queryClient.getQueryData(activeRunQueryKey);

			// Optimistically update the active run to include the new config
			queryClient.setQueryData(activeRunQueryKey, (old: any) => {
				if (!old?.data?.activeRun) return old;

				const newConfigIds = [
					...(old.data.activeRun.configIds || []),
					...variables.data.configIds,
				];
				return {
					...old,
					data: {
						...old.data,
						activeRun: {
							...old.data.activeRun,
							configIds: newConfigIds,
						},
					},
				};
			});

			return { previousData, activeRunQueryKey };
		},
		onSuccess: (data) => {
			console.log("Add configs response:", data);
			if (!data.success) {
				console.error("Failed to add configs:", data.error);
			}
		},
		onError: (error, _variables, context) => {
			console.error("Error adding configs:", error);
			if (context?.previousData && context?.activeRunQueryKey) {
				queryClient.setQueryData(
					context.activeRunQueryKey,
					context.previousData
				);
			}
		},
		onSettled: () => {
			// Always refetch to ensure consistency
			queryClient.invalidateQueries({
				queryKey: runQueryKeys.active(user?.id),
			});
		},
	});

	const removeConfigMutation = useMutation({
		mutationFn: removeConfigFromRunServerFn,
		onMutate: async (variables) => {
			const activeRunQueryKey = runQueryKeys.active(user?.id);
			await queryClient.cancelQueries({ queryKey: activeRunQueryKey });
			const previousData = queryClient.getQueryData(activeRunQueryKey);

			// Optimistically update the active run to remove the config
			queryClient.setQueryData(activeRunQueryKey, (old: any) => {
				if (!old?.data?.activeRun) return old;

				const newConfigIds = (
					old.data.activeRun.configIds || []
				).filter(
					(id: string) => !variables.data.configIds.includes(id)
				);
				return {
					...old,
					data: {
						...old.data,
						activeRun: {
							...old.data.activeRun,
							configIds: newConfigIds,
						},
					},
				};
			});

			return { previousData, activeRunQueryKey };
		},
		onSuccess: (data) => {
			console.log("Remove config response:", data);
			if (!data.success) {
				console.error("Failed to remove config:", data.error);
			}
		},
		onError: (error, _variables, context) => {
			console.error("Error removing configs:", error);
			if (context?.previousData && context?.activeRunQueryKey) {
				queryClient.setQueryData(
					context.activeRunQueryKey,
					context.previousData
				);
			}
		},
		onSettled: () => {
			// Always refetch to ensure consistency
			queryClient.invalidateQueries({
				queryKey: runQueryKeys.active(user?.id),
			});
		},
	});

	const handleStartRun = () => {
		startRun();
	};

	const handleAddConfig = (configId: string) => {
		if (activeRun?.id) {
			addConfigsMutation.mutate({
				data: {
					runId: activeRun.id,
					configIds: [configId],
				},
			});
		} else {
			console.error("No active run ID found");
		}
	};

	const handleRemoveConfig = (configId: string) => {
		if (activeRun?.id) {
			removeConfigMutation.mutate({
				data: {
					runId: activeRun.id,
					configIds: [configId],
				},
			});
		} else {
			console.error("No active run ID found");
		}
	};

	// Show loading state for run check
	if (isLoadingRun) {
		return <LoadingSkeleton />;
	}

	if (runError) {
		return (
			<ErrorComponent text={`Error loading run: ${String(runError)}`} />
		);
	}

	// No active run - show start button
	if (!hasActiveRun) {
		return (
			<StartRunScreen
				isStarting={isStarting}
				onStartRun={handleStartRun}
				userId={user?.id}
			/>
		);
	}

	const effectsResult = applyEffects(
		{ ...poll, run: activeRun! },
		activeRun?.activeConfigIds
	);

	console.log("Effects result:", activeRun?.activeConfigIds);

	return (
		<div className="p-4">
			<ShopProvider
				onAddConfig={handleAddConfig}
				onRemoveConfig={handleRemoveConfig}
			>
				<PollContent
					pollData={effectsResult.view}
					effectProps={effectsResult.renderProps}
					user={user}
					activeRun={activeRun}
					lastScoreBreakdown={lastScoreBreakdown}
					setLastScoreBreakdown={setLastScoreBreakdown}
					costReduction={effectsResult.reductionCost ?? 0}
				/>
			</ShopProvider>
		</div>
	);
};
