import { createFileRoute, Link } from "@tanstack/react-router";
import { requireActiveRun } from "~/domains/runs/guards/requireActiveRun";

export const Route = createFileRoute("/_authed/game-over")({
	component: RouteComponent,
	beforeLoad: async () => {
		const activeRun = await requireActiveRun();

		return { activeRun };
	},
});

function RouteComponent() {
	const { activeRun } = Route.useRouteContext();

	if (activeRun) return <h1>Run is still in progress!</h1>;

	return (
		<div className="text-center py-8">
			<h1>Game over!</h1>

			<p>Thank you for playing!</p>
			<p>Your results has been saved.</p>

			<p>
				You can start a new run from the{" "}
				<Link to="/start" className="underline">
					Start Page
				</Link>
			</p>
		</div>
	);
}
