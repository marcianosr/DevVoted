import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { postPollOptionsHandler } from "~/domains/polls/api/handlers";
import { PollQuestionDisplay } from "./PollQuestionDisplay";
import { PollStatus } from "./PollStatus";
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
import { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { getRandomConfigs } from "~/domains/economy/services/configManager.service";
import { useMemo, useState } from "react";
import { rerollShopServerFn } from "~/domains/runs/api/reroll";
import { PollScoreBreakdown } from "~/domains/score/services/score.service";
import { calculateNextPollThresholdFromCategoryData } from "~/domains/runs/services/thresholdCalculator.service";
import { getCategories } from "~/domains/shared/categories";

type DefaultSelectedOptions = string[];
const defaultSelectedOptions: DefaultSelectedOptions = [];

export const submitPollOptions = createServerFn()
	.inputValidator(
		z.object({
			pollId: z.number().int().positive(),
			selectedOptions: z.array(z.string()).min(1),
			userId: z.string(),
		})
	)
	.handler(async ({ data }) => postPollOptionsHandler({ data }));

type PollContentProps = {
	pollData: PollWithOptionsResponse;
	effectProps?: EffectRenderProps;
	user: any;
	activeRun: Run | null;
};

const PollContent: React.FC<PollContentProps> = ({
	pollData,
	effectProps,
	user,
	activeRun,
}) => {
	const { openShop, isShopOpen } = useShopContext();
	const queryClient = useQueryClient();
	const { poll, options, hasAnswered } = pollData;

	const [rerollKey, setRerollKey] = useState(0);
	const [lastScoreBreakdown, setLastScoreBreakdown] =
		useState<PollScoreBreakdown | null>(null);

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
		onSuccess: (data) => {
			if (data.success) {
				const isCorrect = data.data?.isCorrect;
				const runEnded = data.data?.runEnded;
				const breakdown = data.data?.breakdown;

				// Store the score breakdown for display in shop
				if (breakdown) {
					setLastScoreBreakdown(breakdown);
				}

				if (runEnded) {
					console.log("Run ended. All XP reset to 0.");
				}

				if (isCorrect) {
					console.log("Correct answer! XP awarded.");
				}
				if (!isCorrect && runEnded) {
					console.log("Wrong answer! Run ended!");
				}
				if (!isCorrect && !runEnded) {
					console.log("Answer submitted, but incorrect.");
				}

				openShop();

				// This triggers a refetch:
				// Refresh the active run data to show updated XP (or lack thereof if run ended)
				queryClient.invalidateQueries({
					queryKey: runQueryKeys.active(user?.id),
				});
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
					userId: user.id,
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
		activeRun && activeRun.categoryXp
			? calculateNextPollThresholdFromCategoryData(activeRun.categoryXp)
			: null;

	return (
		<section
			data-category={poll.categoryCode}
			className={`min-h-screen p-2`}
		>
			<div className="max-w-7xl mx-auto">
				<section className="grid grid-cols-12 gap-4">
					<div className="col-span-4 flex flex-col gap-8">
						<div className="text-4xl text-saffron">
							{currentCategory?.name}
						</div>
						<PollStatus hasAnswered={hasAnswered} />

						<div className="text-saffron flex flex-col">
							<span className="font-bold text-xl">
								Round {thresholdInfo?.currentRound} - Poll{" "}
								{thresholdInfo?.pollInRound}/3
							</span>

							<div>
								<span className="font-bold text-sm flex gap-4 justify-between">
									<span>
										Current: {thresholdInfo?.currentXp} XP
									</span>
									<span>
										Goal: {thresholdInfo?.requiredXp} XP
									</span>
								</span>
								<meter
									min={0}
									value={thresholdInfo?.currentXp}
									max={thresholdInfo?.requiredXp}
								></meter>
							</div>

							<span>
								{thresholdInfo?.isThresholdCheckPoll && (
									<span
										className={`mt-2 inline-block px-2 py-1 text-xs font-medium ${
											thresholdInfo?.meetsThreshold
												? "bg-green-600 text-green-100"
												: "bg-red-600 text-red-100"
										}`}
									>
										{thresholdInfo?.meetsThreshold
											? "You succeeded this round by meeting the XP goal!"
											: "You failed this round by not meeting the XP goal."}
									</span>
								)}
							</span>
							{/* {thresholdInfo && (
				<div className="mb-4">
					<div className="text-sm text-white mb-2">
						<span className="font-medium">
							Set {thresholdInfo.currentSet}
						</span>
						{" - "}
						<span>Poll {thresholdInfo.pollInSet}/3</span>
						{thresholdInfo.isThresholdCheckPoll && (
							<span className="ml-2 px-2 py-1 bg-yellow-600 text-yellow-100  text-xs font-medium">
								THRESHOLD CHECK
							</span>
						)}
					</div>
					<ThresholdDisplay thresholdInfo={thresholdInfo} />
				</div>
			)} */}

							{/* Proceed to Round 2 → */}
							{/* { next goal : 550 XP} */}
						</div>
						{activeRun && (
							<RunStatusDisplay activeRun={activeRun} />
						)}

						{/* <ul className="text-gray-400 text-xs">
							<li>Poll #{poll.id}</li>
							<li>Run #{activeRun?.id}</li>
							<li>Amp x1.4</li>
						</ul> */}

						{/*
						<div className="border-t border-saffron pt-4">
							<PollStatus hasAnswered={hasAnswered} />
						</div>
						 */}
					</div>

					{/* Main content area - terminal style */}
					<div className="col-span-8">
						<div className={`mb-4 p-4`}>
							<div className="py-4">
								{activeRun && (
									<div className="text-saffron">
										<StorageDeck run={activeRun} />
									</div>
								)}
							</div>
						</div>
						<div className=" p-4">
							{/* Question display with category color accent */}
							<PollQuestionDisplay poll={poll} />

							{!isShopOpen && (
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

							{isShopOpen && activeRun && (
								<Shop
									activeRun={activeRun}
									offeredConfigs={randomConfigs}
									onReroll={handleReroll}
									lastScoreBreakdown={lastScoreBreakdown}
									categoryCode={poll.categoryCode}
								/>
							)}
						</div>
					</div>
				</section>
			</div>
		</section>
	);
};

type PollPageContainerProps = {
	user: any; // TODO: remove thise any
	queryKey: readonly any[]; // TODO: remove this any
	queryFn: () => Promise<any>; // TODO: remove this any
	errorMessage?: string;
};

export const PollPageContainer: React.FC<PollPageContainerProps> = ({
	user,
	queryKey,
	queryFn,
	errorMessage = "Error Loading Poll",
}) => {
	const queryClient = useQueryClient();

	const {
		activeRun,
		hasActiveRun,
		isLoading: isLoadingRun,
		error: runError,
		startRun,
		isStarting,
	} = useActiveRun(user?.id);

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

	const { data, isLoading, error } = useQuery({
		queryKey,
		queryFn,
		enabled: !!user?.id, // Only run when we have user ID
	});

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

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	if (error || !data) {
		return <ErrorComponent text={errorMessage} />;
	}

	if (!data.success) {
		return <ErrorComponent text={data.error || errorMessage} />;
	}

	const effectsResult = applyEffects(
		{ ...data.data, run: activeRun! },
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
				/>
			</ShopProvider>
		</div>
	);
};
