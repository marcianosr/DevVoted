import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { getRunsByUserIdFn } from "~/domains/runs/api/runs";
import { PipelineCollection } from "~/domains/runs/components/PipelineCollection.component";
import { getDiscoveredSlotKeys } from "~/domains/runs/utils/pipelineCollection";
import { Polldex } from "~/domains/polls/components/Polldex.component";
import {
	DevCard,
	MOCK_DEV_CARD,
} from "~/domains/users/components/DevCard.component";
import {
	AwardsGallery,
	MOCK_AWARDS,
} from "~/domains/users/components/AwardsGallery.component";

const ProfilePage: React.FC = () => {
	const { userId } = Route.useParams();
	const { user } = Route.useRouteContext();

	const isOwnProfile = user?.id === userId;

	const { data: runs = [] } = useQuery({
		queryKey: ["runs", "user", userId],
		queryFn: () => getRunsByUserIdFn({ data: { userId } }),
	});

	const discoveredKeys = getDiscoveredSlotKeys(runs);

	return (
		<section className="min-h-screen">
			<div className="max-w-7xl mx-auto p-4">
				<div className="mb-8">
					<h1 className="text-3xl text-theme">
						{isOwnProfile ? "Your Profile" : `Profile: ${userId}`}
					</h1>
				</div>

				<div className="flex flex-col gap-12">
					{/* Dev card prototype — mock data */}
					<div className="flex gap-6 items-start">
						<DevCard data={MOCK_DEV_CARD} />
						<div className="text-gray-600 text-xs self-center">
							← prototype, no real data yet
						</div>
					</div>

					<AwardsGallery awards={MOCK_AWARDS} />

					<PipelineCollection discoveredKeys={discoveredKeys} />

					<Polldex pollsWithStats={[]} />
				</div>
			</div>
		</section>
	);
};

export const Route = createFileRoute("/_authed/profile/$userId")({
	component: ProfilePage,
});
