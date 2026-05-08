import { createFileRoute } from "@tanstack/react-router";

import {
	DevCard,
	MOCK_COMMUNITY,
} from "~/domains/users/components/DevCard.component";

const CommunityPage: React.FC = () => (
	<section className="min-h-screen">
		<div className="max-w-7xl mx-auto p-4">
			<div className="mb-8">
				<h1 className="text-3xl text-theme">Community</h1>
				<p className="text-gray-500 text-sm mt-1">
					Players who've earned something special
				</p>
			</div>

			<div className="flex flex-wrap gap-4">
				{MOCK_COMMUNITY.map((player) => (
					<DevCard key={player.displayName} data={player} />
				))}
			</div>
		</div>
	</section>
);

export const Route = createFileRoute("/community")({
	component: CommunityPage,
});
