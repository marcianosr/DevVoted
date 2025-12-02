import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { getUserPollsOrAll } from "~/domains/polls/api/polls";
import type { Poll } from "~/domains/polls/models/poll";
import { ErrorComponent } from "~/ui/ErrorComponent";

export const Route = createFileRoute("/_authed/polls/")({
	component: PollsList,
});

type StatusFilter = Poll["status"] | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "draft", label: "Draft" },
	{ value: "open", label: "Open" },
	{ value: "closed", label: "Closed" },
	{ value: "archived", label: "Archived" },
];

function PollsList() {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

	const {
		data: pollsResponse,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["user-polls"],
		queryFn: () => getUserPollsOrAll(),
	});

	if (isLoading) {
		return (
			<div className="p-4">
				<h1 className="text-2xl mb-4">Available Polls</h1>
				<p>Loading polls...</p>
			</div>
		);
	}

	if (error || !pollsResponse?.success) {
		return (
			<ErrorComponent
				text={`Error loading polls: ${!pollsResponse?.success ? pollsResponse?.error : String(error)}`}
			/>
		);
	}

	const polls = pollsResponse.data || [];
	const isAdmin = pollsResponse.isAdmin;
	const filteredPolls =
		statusFilter === "all"
			? polls
			: polls.filter((poll) => poll.status === statusFilter);

	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl">
					{isAdmin ? "All Polls" : "My Poll Submissions"}
				</h1>
				<Link
					to="/polls/new"
					className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
				>
					Create Poll
				</Link>
			</div>

			{/* Status Filter */}
			<div className="flex flex-wrap gap-2 mb-4">
				{STATUS_OPTIONS.map((option) => (
					<button
						key={option.value}
						onClick={() => setStatusFilter(option.value)}
						className={`px-3 py-1 rounded-full text-sm transition-colors ${
							statusFilter === option.value
								? "bg-primary text-white"
								: "bg-gray-700 text-gray-300 hover:bg-gray-600"
						}`}
					>
						{option.label}
					</button>
				))}
			</div>

			{filteredPolls.length === 0 ? (
				<p>
					No polls{" "}
					{statusFilter !== "all"
						? `with status "${statusFilter}"`
						: "available"}
					.
				</p>
			) : (
				<div className="space-y-4">
					{filteredPolls.map((poll) => (
						<div
							key={poll.id}
							className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
						>
							<Link
								to="/polls/$pollId"
								params={{ pollId: String(poll.id) }}
								className="text-blue-600 hover:text-blue-800 hover:underline"
							>
								<div>{poll.id}</div>
								<div>{poll.question}</div>
								<div className="text-sm text-gray-500 mt-1 flex justify-between">
									<span>Category: {poll.categoryCode}</span>
									<span className="capitalize">{poll.status}</span>
								</div>
							</Link>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
