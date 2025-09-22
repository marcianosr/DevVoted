import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { postPollOptionsHandler } from "~/domains/polls/api/handlers";
import { PollHeader } from "./PollHeader";
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
import { ScoreDisplay } from "./ScoreDisplay";

type DefaultSelectedOptions = string[];
const defaultSelectedOptions: DefaultSelectedOptions = [];

export const submitPollOptions = createServerFn()
	.validator(
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
	headerContent?: React.ReactNode;
};

const PollContent: React.FC<PollContentProps> = ({
	pollData,
	effectProps,
	user,
	activeRun,
	headerContent,
}) => {
	const { openShop, isShopOpen } = useShopContext();
	const queryClient = useQueryClient();
	const { poll, options, hasAnswered } = pollData;

	const [rerollKey, setRerollKey] = useState(0);

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

	return (
		<>
			{headerContent}
			<PollHeader poll={poll} />
			<PollStatus hasAnswered={hasAnswered} />
			<RunStatusDisplay activeRun={activeRun} />

			{activeRun && (
				<>
					<ScoreDisplay
						run={activeRun}
						category={poll.categoryCode}
					/>
					<StorageDeck run={activeRun} />
				</>
			)}
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
				/>
			)}
		</>
	);
};

type PollPageContainerProps = {
	user: any; // TODO: remove thise any
	queryKey: readonly any[]; // TODO: remove this any
	queryFn: () => Promise<any>; // TODO: remove this any
	errorMessage?: string;
	headerContent?: React.ReactNode;
};

export const PollPageContainer: React.FC<PollPageContainerProps> = ({
	user,
	queryKey,
	queryFn,
	errorMessage = "Error Loading Poll",
	headerContent,
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
					headerContent={headerContent}
				/>
			</ShopProvider>
		</div>
	);
};
