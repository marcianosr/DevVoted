import { createFileRoute } from "@tanstack/react-router";

import { ArchiveSummary } from "~/domains/economy/components/ArchiveSummary.component";
import { AvatarWithBorder } from "~/domains/economy/components/AvatarWithBorder.component";
import { BorderShop } from "~/domains/economy/components/BorderShop.component";
import { useArchiveState } from "~/domains/economy/hooks/useArchiveState";
import { Polldex } from "~/domains/polls/components/Polldex.component";

const ProfilePage: React.FC = () => {
	const { userId } = Route.useParams();
	const { user } = Route.useRouteContext();

	const isOwnProfile = user?.id === userId;
	const { data: archive } = useArchiveState(isOwnProfile ? userId : undefined);

	return (
		<section className="min-h-screen">
			<div className="max-w-7xl mx-auto p-4 space-y-8">
				<header className="flex items-center gap-4">
					<AvatarWithBorder
						photoUrl={user?.photoUrl ?? null}
						displayName={user?.displayName ?? userId}
						borderId={archive?.equippedBorderId ?? null}
						size="xl"
					/>
					<div>
						<h1 className="text-3xl text-theme">
							{isOwnProfile ? "Your Profile" : `Profile: ${userId}`}
						</h1>
					</div>
				</header>

				{isOwnProfile && (
					<>
						<ArchiveSummary userId={userId} />
						<BorderShop userId={userId} />
					</>
				)}

				<Polldex pollsWithStats={[]} />
			</div>
		</section>
	);
};

export const Route = createFileRoute("/_authed/profile/$userId")({
	component: ProfilePage,
});
