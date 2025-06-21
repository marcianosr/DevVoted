import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPollById } from "~/domains/polls/api/polls";

const PollDetail: React.FC = () => {
	const { pollId } = Route.useParams();
	const pollIdNumber = parseInt(pollId, 10);

	const {
		data: pollResponse,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["poll", pollIdNumber],
		queryFn: () => getPollById({ data: { id: pollIdNumber } }),
	});

	if (isLoading) {
		return (
			<div className="p-4">
				<div className="animate-pulse flex flex-col gap-4">
					<div className="h-8 rounded w-3/4"></div>
					<div className="h-4 rounded w-1/2"></div>
					<div className="h-24 rounded w-full"></div>
				</div>
			</div>
		);
	}

	if (error || !pollResponse || !pollResponse.success) {
		return (
			<div className="p-4">
				<h1 className="text-2xl font-bold mb-4 text-red-600">
					Error Loading Poll
				</h1>
				<p className="text-gray-600">
					{error instanceof Error
						? error.message
						: pollResponse &&
							  "success" in pollResponse &&
							  !pollResponse.success
							? pollResponse.error
							: "Failed to load poll data"}
				</p>
			</div>
		);
	}

	const poll = pollResponse.data;

	if (!poll) {
		return (
			<div className="p-4">
				<h1 className="text-2xl font-bold mb-4 text-red-600">
					Poll Not Found
				</h1>
				<p className="text-gray-600">
					The requested poll could not be found.
				</p>
			</div>
		);
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

				<div className=" p-4 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-2">Timeline</h2>
					<div className="space-y-2">
						<p>
							<span className="font-medium">Opens:</span>{" "}
							{new Date(poll.openingTime).toLocaleString()}
						</p>
						<p>
							<span className="font-medium">Closes:</span>{" "}
							{new Date(poll.closingTime).toLocaleString()}
						</p>
						<p>
							<span className="font-medium">Created:</span>{" "}
							{new Date(poll.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>

			<div className="mt-6">
				<h2 className="text-xl font-semibold mb-4">Answer Options</h2>
				<p className="text-gray-600 italic">
					Options will be displayed here once implemented
				</p>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/polls/$pollId")({
	component: PollDetail,
});
