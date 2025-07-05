import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPollByIdWithOptions } from "~/domains/polls/api/polls";
import { getActiveRun, getOrCreateRun } from "~/domains/runs/api/runs";
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

	// Check for active run
	const {
		data: activeRunResponse,
		isLoading: isLoadingRun,
		error: runError,
	} = useQuery({
		queryKey: ["activeRun", user?.id],
		queryFn: () => getActiveRun({ data: { userId: user?.id || "" } }),
		enabled: !!user?.id,
	});


	const startRunMutation = useMutation({
		mutationFn: (userId: string) => getOrCreateRun({ data: { userId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activeRun", user?.id] });
		},
	});

	const submitOptionsMutation = useMutation({
		mutationFn: submitPollOptions,
		onSuccess: (data) => {
			if (data.success) {
				console.log("Options submitted successfully");
				// You could show a success message or redirect here
			} else {
				console.error("Error submitting Options:", data.error);
				// You could show an error message here
			}
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
		queryKey: ["poll", pollIdNumber, user?.id],
		queryFn: () =>
			getPollByIdWithOptions({
				data: { id: pollIdNumber, userId: user?.id },
			}),
		enabled: !!user?.id && !!activeRunResponse?.success, // Only run when we have user ID and active run
	});

	const handleStartRun = () => {
		if (user?.id) {
			startRunMutation.mutate(user.id);
		}
	};

	// Show loading state for run check
	if (isLoadingRun) {
		return <LoadingSkeleton />;
	}

	if (runError) {
		return <ErrorComponent text={`Error loading run: ${String(runError)}`} />;
	}

	// No active run - show start button
	if (!activeRunResponse?.success) {
		return (
			<div className="p-4">
				<h1 className="text-2xl font-bold mb-4">Start Your Quiz Run</h1>
				<div className="text-center py-8">
					<h2 className="text-xl mb-4">You need an active run to answer polls</h2>
					<p className="text-gray-600 mb-6">
						Each run starts with 0 XP in all categories. Answer polls correctly to earn XP and build your streak!
					</p>
					<button
						onClick={handleStartRun}
						disabled={startRunMutation.isPending}
						className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{startRunMutation.isPending ? "Starting Run..." : "Start Run"}
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

	return (
		<div className="p-4">
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
