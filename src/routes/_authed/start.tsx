import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getOrCreateRun } from "~/domains/runs/api/runs";
import { StartRunScreen } from "~/domains/runs/components/StartRunScreen";
import { requiresActiveRun } from "~/domains/runs/guards/requiresActiveRun";

export const Route = createFileRoute("/_authed/start")({
	component: RouteComponent,
	beforeLoad: async (routeContext) => {
		// TODO: Redirect to daily-poll if active run exists
		// const activeRun = await requiresActiveRun();
		// return { activeRun };
	},
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const router = useRouter();

	const startRunMutation = useMutation({
		mutationFn: () => getOrCreateRun(),
		onSuccess: () => {
			router.invalidate();
			router.navigate({ to: "/daily-poll" });
		},
	});

	return (
		<StartRunScreen
			isStarting={startRunMutation.isPending}
			onStartRun={() => startRunMutation.mutate()}
			userId={user?.id}
		/>
	);
}
