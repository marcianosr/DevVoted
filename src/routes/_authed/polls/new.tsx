import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { createPollServerFn } from "~/domains/polls/api/polls";
import { PollForm } from "~/domains/polls/components/PollForm";

export const Route = createFileRoute("/_authed/polls/new")({
	component: CreatePoll,
});

function CreatePoll() {
	const navigate = useNavigate();

	const createMutation = useMutation({
		mutationFn: async (
			data: Parameters<typeof createPollServerFn>[0]["data"]
		) => {
			const response = await createPollServerFn({ data });
			if (!response.success) {
				throw new Error(response.error);
			}
			return response.data;
		},
		onSuccess: (poll) => {
			navigate({ to: "/polls/$pollId", params: { pollId: String(poll.id) } });
		},
	});

	const handleSubmit = async (
		formData: Parameters<typeof createPollServerFn>[0]["data"]
	) => {
		await createMutation.mutateAsync(formData);
	};

	return (
		<div className="max-w-3xl mx-auto p-4">
			<h1 className="text-3xl font-bold text-theme mb-6">Create New Poll</h1>

			{createMutation.error && (
				<div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
					<p className="text-red-400">{createMutation.error.message}</p>
				</div>
			)}

			<PollForm
				onSubmit={handleSubmit}
				isSubmitting={createMutation.isPending}
			/>
		</div>
	);
}
