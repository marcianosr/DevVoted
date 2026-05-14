import { createFileRoute } from "@tanstack/react-router";

import Content from "~/components/Content.component";
import { AwardsGrid } from "~/domains/awards/components/AwardsGrid.component";

export const Route = createFileRoute("/awards")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Content>
			<section className="max-w-7xl mx-auto space-y-8">
				<header>
					<h1 className="text-4xl text-theme">Awards</h1>
					<p className="text-gray-400 mt-1">
						Current holders of DevVoted&apos;s competitive awards
					</p>
				</header>
				<AwardsGrid />
			</section>
		</Content>
	);
}
