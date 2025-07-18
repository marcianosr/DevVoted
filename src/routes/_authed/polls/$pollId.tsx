import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useState } from "react";
import { getPollByIdWithOptions } from "~/domains/polls/api/polls";
import { postPollOptionsHandler } from "~/domains/polls/api/handlers";
import { addConfigsToRun as addConfigsToRunQuery } from "~/domains/runs/api/queries";
import { PollHeader } from "~/domains/polls/components/PollHeader";
import { PollStatus } from "~/domains/polls/components/PollStatus";
import { PollOptions } from "~/domains/polls/components/PollOptions";
import { PollSubmissionForm } from "~/domains/polls/components/PollSubmissionForm";
import { pollQueryKeys } from "~/domains/shared/queryKeys";
import { useActiveRun } from "~/domains/runs/hooks";
import { RunStatusDisplay } from "~/domains/runs/components/RunStatusDisplay";
import { StartRunScreen } from "~/domains/runs/components/StartRunScreen";
import { ErrorComponent } from "~/ui/ErrorComponent";
import { LoadingSkeleton } from "~/ui/LoadingSkeleton";
import { StorageDeck } from "~/domains/configs/components/StorageDeck";
import { Shop } from "~/domains/configs/components/Shop";
import { configs } from "~/domains/configs/data/configs";

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

export const addConfigsToRunServerFn = createServerFn()
	.validator(
		z.object({
			runId: z.number(),
			configIds: z.array(z.string()),
		})
	)
	.handler(async ({ data }) => {
		try {
			const result = await addConfigsToRunQuery(
				data.runId,
				data.configIds
			);
			return { success: true, data: result };
		} catch (error) {
			console.error("Server function: Error", error);
			const message =
				error instanceof Error
					? error.message
					: "Failed to add configs";
			return { success: false, error: message };
		}
	});

const PollDetail: React.FC = () => {
	const { pollId } = Route.useParams();
	const { user } = Route.useRouteContext();
	const queryClient = useQueryClient();
	const pollIdNumber = parseInt(pollId, 10);
	const [showShop, setShowShop] = useState(false);

	const {
		activeRun,
		hasActiveRun,
		isLoading: isLoadingRun,
		error: runError,
		startRun,
		isStarting,
	} = useActiveRun(user?.id);

	const addConfigsMutation = useMutation({
		mutationFn: addConfigsToRunServerFn,
		onSuccess: (data) => {
			console.log("Add configs response:", data);
			if (data.success) {
				console.log("Configs added successfully, closing shop");
				// Refresh the active run data to show updated storage
				queryClient.invalidateQueries({
					queryKey: ["activeRun", user?.id],
				});
				setShowShop(false);
			} else {
				console.error("Failed to add configs:", data.error);
			}
		},
		onError: (error) => {
			console.error("Error adding configs:", error);
		},
	});

	const submitOptionsMutation = useMutation({
		mutationFn: submitPollOptions,
		onSuccess: (data) => {
			if (data.success) {
				const isCorrect = data.data?.isCorrect;
				const runEnded = data.data?.runEnded;

				if (isCorrect) {
					console.log("Correct answer! XP awarded.");
				}
				if (!isCorrect && runEnded) {
					console.log("Wrong answer! Run ended. All XP reset to 0.");
				}
				if (!isCorrect && !runEnded) {
					console.log("Answer submitted, but incorrect.");
				}
				if (runEnded) {
					console.log("Run ended. All XP reset to 0.");
				}

				setShowShop(true);

				// Refresh the active run data to show updated XP (or lack thereof if run ended)
				queryClient.invalidateQueries({
					queryKey: ["activeRun", user?.id],
				});
				return;
			}

			console.error("Error submitting Options:", data.error);
		},
		onError: (error) => {
			console.error("Mutation error:", error);
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

			// Submit the Options using our mutation with the pollId from component scope
			submitOptionsMutation.mutate({
				data: {
					pollId: pollIdNumber,
					selectedOptions,
					userId: user.id,
				},
			});
		},
	});

	const { data, isLoading, error } = useQuery({
		queryKey: pollQueryKeys.withOptions(pollIdNumber, user?.id),
		queryFn: () =>
			getPollByIdWithOptions({
				data: { id: pollIdNumber, userId: user?.id },
			}),
		enabled: !!user?.id && hasActiveRun, // Only run when we have user ID and active run
	});

	const handleStartRun = () => {
		startRun();
	};

	const handleShopSubmit = (selectedConfigIds: string[]) => {
		if (activeRun?.run.id) {
			console.log("Data", activeRun, selectedConfigIds);
			addConfigsMutation.mutate({
				data: {
					runId: activeRun.run.id,
					configIds: selectedConfigIds,
				},
			});
		} else {
			console.error("No active run ID found");
		}
	};

	const handleShopCancel = () => {
		setShowShop(false);
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
			/>
		);
	}

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	if (error || !data?.data) {
		return <ErrorComponent text="Error Loading Poll" />;
	}

	if (!data.success) {
		return <ErrorComponent text={data.error || "Error Loading Poll"} />;
	}

	const { poll, options, hasAnswered } = data.data;

	if (!poll) {
		return <ErrorComponent text="Sorry, the poll could not be found" />;
	}

	return (
		<div className="p-4">
			{activeRun && (
				<>
					<RunStatusDisplay activeRun={activeRun} />
					<StorageDeck run={activeRun.run} />
				</>
			)}

			<PollHeader poll={poll} />
			<PollStatus hasAnswered={hasAnswered} />

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
						/>
					)}
				/>
			</PollSubmissionForm>

			{activeRun && true && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="max-w-4xl w-full mx-4">
						<Shop
							onSubmit={handleShopSubmit}
							onCancel={handleShopCancel}
							activeRun={activeRun.run}
							availableConfigs={configs}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export const Route = createFileRoute("/_authed/polls/$pollId")({
	component: PollDetail,
});
