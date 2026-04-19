import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";

import { getOrCreateRun } from "~/domains/runs/api/runs";
import { GameLoopExplainer } from "~/ui/GameLoopExplainer";
import { PrimaryButton } from "~/ui/PrimaryButton";

export const Route = createFileRoute("/start")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (context.activeRun?.success && context.activeRun?.data?.id) {
			throw redirect({
				to: "/daily-poll",
			});
		}
	},
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const navigate = useNavigate();

	const startRunMutation = useMutation({
		mutationFn: () => getOrCreateRun(),
		onSuccess: () => {
			navigate({ to: "/daily-poll" });
		},
	});

	return (
		<div className="p-4">
			<div className="mx-auto max-w-2xl py-8">
				<h1 className="text-4xl mb-4">Welcome to the developer roguelike!</h1>

				<h2 className="text-xl mb-8">
					Click the button below to start your run!
				</h2>

				<GameLoopExplainer />

				<section className="text-white mb-6">
					<p className="text-gray-300">
						Each run starts at 0% coverage. Answer polls, pass checkpoints, and
						compete on the leaderboard. Can you reach{" "}
						<span className="text-yellow-500 font-bold">100%</span> coverage?
					</p>
				</section>

				{user ? (
					<PrimaryButton
						onClick={() => startRunMutation.mutate()}
						disabled={startRunMutation.isPending}
					>
						Start New Run
					</PrimaryButton>
				) : (
					<Link to="/login" className="py-8  text-3xl underline">
						Login to Start
					</Link>
				)}
			</div>
		</div>
	);
}
