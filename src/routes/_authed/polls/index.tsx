import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllPolls } from "~/domains/polls/api/polls";
import { ErrorComponent } from "~/ui/ErrorComponent";

export const Route = createFileRoute("/_authed/polls/")({
	component: PollsList,
});

function PollsList() {
	const {
		data: pollsResponse,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["polls"],
		queryFn: () => getAllPolls(),
	});

	if (isLoading) {
		return (
			<div className="p-4">
				<h1 className="text-2xl font-bold mb-4">Available Polls</h1>
				<p>Loading polls...</p>
			</div>
		);
	}

	if (error || !pollsResponse?.success) {
		return (
			<ErrorComponent
				text={`Error loading polls: ${pollsResponse?.error || String(error)}`}
			/>
		);
	}

	const polls = pollsResponse.data || [];

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Available Polls</h1>
			{polls?.length === 0 ? (
				<p>No polls available.</p>
			) : (
				<div className="space-y-4">
					{polls.map((poll) => (
						<div
							key={poll.id}
							className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
						>
							<Link
								to="/polls/$pollId"
								params={{ pollId: String(poll.id) }}
								className="text-blue-600 hover:text-blue-800 hover:underline"
							>
								<div className="font-medium">
									{poll.question}
								</div>
								<div className="text-sm text-gray-500 mt-1 flex justify-between">
									<span>Category: {poll.categoryCode}</span>
									<span className="capitalize">
										{poll.status}
									</span>
								</div>
							</Link>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
