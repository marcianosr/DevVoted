import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { getUserPollsOrAll, getPollCreators } from "~/domains/polls/api/polls";
import PollCategoryCount from "~/domains/polls/components/PollCategoryCount";
import type { Poll } from "~/domains/polls/models/poll";
import { getCategories, type CategoryCode } from "~/domains/shared/categories";
import { ErrorComponent } from "~/ui/ErrorComponent";

export const Route = createFileRoute("/_authed/polls/")({
	component: PollsList,
});

type StatusFilter = Poll["status"] | "all";
type CategoryFilter = CategoryCode | "all";
type UserFilter = string | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "draft", label: "Draft" },
	{ value: "open", label: "Open" },
	{ value: "closed", label: "Closed" },
	{ value: "archived", label: "Archived" },
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
	{ value: "all", label: "All" },
	...getCategories().map((cat) => ({ value: cat.code, label: cat.name })),
];

function PollsList() {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
	const [userFilter, setUserFilter] = useState<UserFilter>("all");

	const {
		data: pollsResponse,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["user-polls"],
		queryFn: () => getUserPollsOrAll(),
	});

	const isAdmin = pollsResponse?.isAdmin ?? false;

	const { data: creatorsResponse } = useQuery({
		queryKey: ["poll-creators"],
		queryFn: () => getPollCreators(),
		enabled: isAdmin,
	});

	const pollCreators = creatorsResponse?.success ? creatorsResponse.data : [];

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
	const filteredPolls = polls.filter((poll) => {
		const matchesStatus =
			statusFilter === "all" || poll.status === statusFilter;
		const matchesCategory =
			categoryFilter === "all" || poll.categoryCode === categoryFilter;
		const matchesUser = userFilter === "all" || poll.createdBy === userFilter;
		return matchesStatus && matchesCategory && matchesUser;
	});

	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl">
					{isAdmin ? "All Polls" : "My Poll Submissions"}{" "}
					<span className="text-gray-400">({polls.length})</span>
				</h1>
				<Link
					to="/polls/new"
					className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
				>
					Create Poll
				</Link>
			</div>

			<div className="mb-4 text-sm">
				<PollCategoryCount polls={polls} />
			</div>

			{/* Status Filter */}
			<div className="flex flex-wrap gap-2 mb-2">
				<span className="text-sm text-gray-400 self-center w-20">Status:</span>
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

			{/* Category Filter */}
			<div className="flex flex-wrap gap-2 mb-2">
				<span className="text-sm text-gray-400 self-center w-20">
					Category:
				</span>
				{CATEGORY_OPTIONS.map((option) => (
					<button
						key={option.value}
						onClick={() => setCategoryFilter(option.value)}
						className={`px-3 py-1 rounded-full text-sm transition-colors ${
							categoryFilter === option.value
								? "bg-primary text-white"
								: "bg-gray-700 text-gray-300 hover:bg-gray-600"
						}`}
					>
						{option.label}
					</button>
				))}
			</div>

			{/* User Filter (Admin only) */}
			{isAdmin && pollCreators.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-4">
					<span className="text-sm text-gray-400 self-center w-20">
						Creator:
					</span>
					<button
						onClick={() => setUserFilter("all")}
						className={`px-3 py-1 rounded-full text-sm transition-colors ${
							userFilter === "all"
								? "bg-primary text-white"
								: "bg-gray-700 text-gray-300 hover:bg-gray-600"
						}`}
					>
						All
					</button>
					{pollCreators.map((creator) => (
						<button
							key={creator.id}
							onClick={() => setUserFilter(creator.id)}
							className={`px-3 py-1 rounded-full text-sm transition-colors ${
								userFilter === creator.id
									? "bg-primary text-white"
									: "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}
						>
							{creator.displayName}
						</button>
					))}
				</div>
			)}

			{filteredPolls.length === 0 ? (
				<p>No polls matching the selected filters.</p>
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
