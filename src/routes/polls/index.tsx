import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/polls/")({
	component: PollsList,
});

function PollsList() {
	// Dummy poll IDs for demonstration
	const dummyPollIds = ["1", "2", "3"];

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Available Polls</h1>
			<div className="space-y-4">
				{dummyPollIds.map((id) => (
					<div
						key={id}
						className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
					>
						<Link
							to="/polls/$pollId"
							params={{ pollId: id }}
							className="text-blue-600 hover:underline"
						>
							Poll #{id}
						</Link>
					</div>
				))}
			</div>
		</div>
	);
}
