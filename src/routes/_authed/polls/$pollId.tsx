import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPollByIdWithOptions } from "~/domains/polls/api/polls";
import { useActiveRun } from "~/domains/runs/hooks";
import { calculateNextPollThresholdFromCategoryData } from "~/domains/userPerformance/services/thresholdCalculator.service";
import { ErrorComponent } from "~/ui/ErrorComponent";
import { useForm } from "@tanstack/react-form";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LoadingSkeleton } from "~/ui/LoadingSkeleton";
import { postPollOptionsHandler } from "~/domains/polls/api/handlers";
import { PollHeader } from "~/domains/polls/components/PollHeader";
import { PollStatus } from "~/domains/polls/components/PollStatus";
import { PollOptions } from "~/domains/polls/components/PollOptions";
import { PollSubmissionForm } from "~/domains/polls/components/PollSubmissionForm";
import { pollQueryKeys } from "~/domains/shared/queryKeys";

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

const PollDetail: React.FC = () => {
	const { pollId } = Route.useParams();
	const { user } = Route.useRouteContext();
	const queryClient = useQueryClient();
	const pollIdNumber = parseInt(pollId, 10);

	// Active run management
	const {
		activeRun,
		hasActiveRun,
		isLoading: isLoadingRun,
		error: runError,
		startRun,
		isStarting,
	} = useActiveRun(user?.id);

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
			<div className="p-4">
				<h1 className="text-2xl font-bold mb-4">Start Your Quiz Run</h1>
				<div className="text-center py-8">
					<h2 className="text-xl mb-4">
						You need an active run to answer polls
					</h2>
					<p className="text-gray-600 mb-6">
						Each run starts with 0 XP in all categories. Answer
						polls correctly to earn XP and build your streak!
					</p>
					<button
						onClick={handleStartRun}
						disabled={isStarting}
						className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isStarting ? "Starting Run..." : "Start Run"}
					</button>
				</div>
			</div>
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

	// Get threshold info for display (client-side calculation)
	const thresholdInfo = activeRun?.categoryXp
		? calculateNextPollThresholdFromCategoryData(
				activeRun.categoryXp.map((xp) => ({
					currentXp: xp.currentXp,
					pollsAnswered: xp.pollsAnswered,
				}))
			)
		: null;

	return (
		<div className="p-4">
			{/* Run Status Display */}
			{activeRun && (
				<div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
					<h3 className="text-lg font-semibold text-blue-900 mb-3">
						Current Run Status
					</h3>
					<div className="text-sm text-blue-700 mb-3">
						Started:{" "}
						{new Date(
							activeRun.run?.startedAt || ""
						).toLocaleString()}
					</div>

					{thresholdInfo && (
						<div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
							<div className="flex items-center justify-between">
								<div>
									<div className="font-medium text-blue-900">
										Poll #{thresholdInfo.pollNumber}{" "}
										Threshold
									</div>
									<div className="text-sm text-blue-700">
										{thresholdInfo.currentXp} /{" "}
										{thresholdInfo.requiredXp} XP
									</div>
								</div>
								<div className="text-right">
									{thresholdInfo.meetsThreshold ? (
										<span className="text-green-600 font-medium">
											✅ Ready to continue
										</span>
									) : (
										<span className="text-orange-600 font-medium">
											⚠️ Need{" "}
											{thresholdInfo.requiredXp -
												thresholdInfo.currentXp}{" "}
											more XP
										</span>
									)}
								</div>
							</div>
						</div>
					)}

					{activeRun.categoryXp && (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
							{activeRun.categoryXp.map((xp) => (
								<div
									key={xp.categoryCode}
									className="bg-white p-3 rounded border border-blue-100"
								>
									<div className="font-medium text-sm text-blue-900">
										{xp.categoryCode}
									</div>
									<div className="text-lg font-bold text-blue-800">
										{xp.currentXp} XP
									</div>
									<div className="text-xs text-blue-600">
										Streak: {xp.currentStreak}
									</div>
									{xp.bestStreak > 0 && (
										<div className="text-xs text-blue-500">
											Best: {xp.bestStreak}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
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
		</div>
	);
};

export const Route = createFileRoute("/_authed/polls/$pollId")({
	component: PollDetail,
});
