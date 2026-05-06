import { createFileRoute } from "@tanstack/react-router";

import { Polldex } from "~/domains/polls/components/Polldex.component";

const ProfilePage: React.FC = () => {
	const { userId } = Route.useParams();
	const { user } = Route.useRouteContext();

	// Check if viewing own profile
	const isOwnProfile = user?.id === userId;

	return (
		<section className="min-h-screen">
			<div className="max-w-7xl mx-auto p-4">
				<div className="mb-6">
					<h1 className="text-3xl text-theme">
						{isOwnProfile ? "Your Profile" : `Profile: ${userId}`}
					</h1>
				</div>

				<Polldex pollsWithStats={[]} />
			</div>
		</section>
	);
};

export const Route = createFileRoute("/_authed/profile/$userId")({
	component: ProfilePage,
});
