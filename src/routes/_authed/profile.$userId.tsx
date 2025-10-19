import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllPollsWithUserStats } from "~/domains/polls/api/polls";
import { Polldex } from "~/domains/polls/components/Polldex";
import { ErrorComponent } from "~/ui/ErrorComponent";
import { LoadingSkeleton } from "~/ui/LoadingSkeleton";

const ProfilePage: React.FC = () => {
	const { userId } = Route.useParams();
	const { user } = Route.useRouteContext();

	// Check if viewing own profile
	const isOwnProfile = user?.id === userId;

	// Fetch polls with user stats
	const pollsQuery = useQuery({
		queryKey: ["polls", "userStats", userId],
		queryFn: () => getAllPollsWithUserStats({ data: { userId } }),
		enabled: !!userId,
	});

	if (pollsQuery.isLoading) {
		return <LoadingSkeleton />;
	}

	if (pollsQuery.error || !pollsQuery.data) {
		return <ErrorComponent text="Error loading profile data" />;
	}

	if (!pollsQuery.data.success) {
		return <ErrorComponent text={pollsQuery.data.error || "Failed to load polls"} />;
	}

	return (
		<section className="min-h-screen">
			<div className="max-w-7xl mx-auto p-4">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-saffron">
						{isOwnProfile ? "Your Profile" : `Profile: ${userId}`}
					</h1>
				</div>

				<Polldex pollsWithStats={pollsQuery.data.data} />
			</div>
		</section>
	);
};

export const Route = createFileRoute("/_authed/profile/$userId")({
	component: ProfilePage,
});