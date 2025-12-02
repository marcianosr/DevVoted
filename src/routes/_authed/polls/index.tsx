import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { getAllPolls } from "~/domains/polls/api/polls";
import { ErrorComponent } from "~/ui/ErrorComponent";
import { ADMIN_EMAILS } from "~/utils/adminAuth";
import { getSupabaseServerClient } from "~/utils/supabase";

const checkAdminAccess = createServerFn({ method: "GET" }).handler(async () => {
	const supabase = await getSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return { hasAccess: false };
	}

	const hasAccess = ADMIN_EMAILS.includes(user.email as any);
	return { hasAccess };
});

export const Route = createFileRoute("/_authed/polls/")({
	beforeLoad: async () => {
		const result = await checkAdminAccess();
		if (!result.hasAccess) {
			throw new Error("Admin access required");
		}
	},
	errorComponent: ({ error }) => {
		if (error.message === "Admin access required") {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h1 className="text-2xl text-red-600 mb-4">Access Denied</h1>
						<p>This area is restricted to administrators only.</p>
					</div>
				</div>
			);
		}
		throw error;
	},
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

	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl">Available Polls</h1>
				<Link
					to="/polls/new"
					className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
				>
					Create Poll
				</Link>
			</div>
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
