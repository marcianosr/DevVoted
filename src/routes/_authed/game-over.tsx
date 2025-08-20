import { createFileRoute } from "@tanstack/react-router";
import { StartRunScreen } from "~/domains/runs/components/StartRunScreen";
import { useActiveRun } from "~/domains/runs/hooks";

export const Route = createFileRoute("/_authed/game-over")({
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const { isStarting, startRun } = useActiveRun(user?.id);

	return (
		<div className="text-center py-8">
			<h1>Game over</h1>
			<StartRunScreen
				isStarting={isStarting}
				onStartRun={startRun}
				userId={user?.id}
			/>
			;
		</div>
	);
}
