import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPollByIdWithOptions } from "~/domains/polls/api/polls";
import { ErrorComponent } from "~/ui/ErrorComponent";
import Option from "~/domains/polls/components/Option";
import { useForm } from "@tanstack/react-form";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LoadingSkeleton } from "~/ui/LoadingSkeleton";
import { postPollOptionsHandler } from "~/domains/polls/api/handlers";

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
	const pollIdNumber = parseInt(pollId, 10);

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
		enabled: !!user?.id, // Only run query when we have a user ID
	});

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
			<h1 className="text-2xl font-bold mb-4">{poll.question}</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div className=" p-4 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-2">Poll Details</h2>
					<div className="space-y-2">
						<p>
							<span className="font-medium">Status:</span>{" "}
							{poll.status}
						</p>
						<p>
							<span className="font-medium">Type:</span>{" "}
							{poll.answerType}
						</p>
						<p>
							<span className="font-medium">Category:</span>{" "}
							{poll.categoryCode}
						</p>
					</div>
				</div>
			</div>

			{hasAnswered && (
				<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-blue-800 font-medium">
						✅ You have already answered this poll
					</p>
				</div>
			)}

			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				method="POST"
			>
				<h2 className="text-xl font-semibold mb-4">Options</h2>
				<ul className="space-y-2">
					<form.Field
						name="selectedOptions"
						children={(field) => (
							<>
								{options.map((option) => (
									<li key={option.id}>
										{poll.answerType === "single" && (
											<Option
												option={option}
												type="radio"
												field={field}
												checked={field.state.value.includes(
													option.id.toString()
												)}
												disabled={hasAnswered}
											/>
										)}
										{poll.answerType === "multiple" && (
											<Option
												option={option}
												type="checkbox"
												field={field}
												checked={field.state.value.includes(
													option.id.toString()
												)}
												disabled={hasAnswered}
											/>
										)}
									</li>
								))}
							</>
						)}
					/>
				</ul>
				<div className="mt-6 space-y-4">
					{submitOptionsMutation.isSuccess &&
						submitOptionsMutation.data?.success && (
							<div className="p-3 bg-green-100 text-green-800 rounded">
								Your options has been submitted successfully!
							</div>
						)}

					{submitOptionsMutation.isError ||
					(submitOptionsMutation.isSuccess &&
						!submitOptionsMutation.data?.success) ? (
						<div className="p-3 bg-red-100 text-red-800 rounded">
							Failed to submit your options. Please try again.
						</div>
					) : null}

					<button
						type="submit"
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
						disabled={
							hasAnswered ||
							submitOptionsMutation.isPending ||
							form.state.isSubmitting
						}
					>
						{hasAnswered
							? "Already Answered"
							: submitOptionsMutation.isPending
								? "Submitting..."
								: "Submit Options"}
					</button>
				</div>
			</form>
		</div>
	);
};

export const Route = createFileRoute("/_authed/polls/$pollId")({
	component: PollDetail,
});
