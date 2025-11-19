import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { getOrCreateRun } from "~/domains/runs/api/runs";
import { PrimaryButton } from "~/ui/PrimaryButton";

export const Route = createFileRoute("/start")({
	component: RouteComponent,
});

function RouteComponent() {
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
				<h1 className="text-4xl mb-4">
					Welcome to the developer roguelike!
				</h1>

				<h2 className="text-xl mb-4">
					To get started, click the button below to start your run!
				</h2>
				<section className="text-white mb-6">
					<h3 className="mt-4 text-2xl">How it works:</h3>
					<ul>
						<li>- Each day a new poll appears in a category</li>
						<li>
							- Answering polls increases your coverage for each
							category
						</li>
						<li>
							- Answering wrong answers will decrease your
							coverage
						</li>
						<li>
							- Meeting a CI gate allows you to continue the run
						</li>
						<li>- Failing a CI gate ends your run</li>
						<li>
							- Configs (so-called "modifiers") are installed from
							the{" "}
							<span className="underline">Package Manager</span>{" "}
							and can help you increase your coverage. Use them
							wisely!
						</li>
						<li>- Compete with others on the leaderboard!</li>
					</ul>
					<p className="mt-8">
						Answer polls and earn coverage to beat the CI gates!
						Each run you start with 0% coverage. Can you beat all CI
						Gates? And can you get to{" "}
						<span className="text-yellow-500 underline">100%</span>{" "}
						coverage?
					</p>
				</section>

				<PrimaryButton
					onClick={() => startRunMutation.mutate()}
					disabled={startRunMutation.isPending}
				>
					Start New Run
				</PrimaryButton>
			</div>
		</div>
	);
}
