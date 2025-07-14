import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getPollByIdWithOptions } from "~/domains/polls/api/polls";
import { postPollOptionsHandler } from "~/domains/polls/api/handlers";
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
			{activeRun && <RunStatusDisplay activeRun={activeRun} />}

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
