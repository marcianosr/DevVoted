import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import { removeConfigFromRunServerFn } from "~/domains/configs/api/configs";
import ActiveCard from "~/domains/configs/components/Cards/ActiveCard";
import { configs } from "~/domains/configs/data/configs";
import { Config } from "~/domains/configs/models/config";
import ShopContainer from "~/domains/economy/components/ShopContainer";
import {
	getRandomConfigs,
	getStorageInfo,
} from "~/domains/economy/services/configManager.service";
import { formatStorage } from "~/lib/storage";

export const Route = createFileRoute("/_authed/progress")({
	component: RouteComponent,
	loader: async ({ context: { activeRun } }) => {
		if (!activeRun?.success) {
			throw new Error("No active run");
		}

		const offeredConfigs = getRandomConfigs({
			count: 3,
			run: activeRun.data,
			configs,
		});

		return {
			activeRun: activeRun.data,
			offeredConfigs,
		};
	},
});

type BadgeStatus = "pass" | "fail" | "pending";

const BADGE_CONFIG: Record<
	BadgeStatus,
	{ icon: string; label: string; className: string }
> = {
	pass: { icon: "✓", label: "PASS", className: "bg-green-400" },
	fail: { icon: "✗", label: "FAIL", className: "bg-red-400" },
	pending: { icon: "❯", label: "PENDING", className: "bg-yellow-400" },
};

const Badge = ({ status }: { status: BadgeStatus }) => {
	const config = BADGE_CONFIG[status];
	if (!config) return null;

	return (
		<span className={`${config.className} p-2 text-black`}>
			{config.icon} {config.label}
		</span>
	);
};

function RouteComponent() {
	const { activeRun, offeredConfigs } = Route.useLoaderData();
	const router = useRouter();

	const { activeConfigs, storageAvailable, storageLimit, storageUsed } =
		getStorageInfo(activeRun);

	const deinstallConfigMutation = useMutation({
		mutationFn: removeConfigFromRunServerFn,
		onSuccess: () => {
			router.invalidate();
		},
	});

	const onDeinstallConfig = (config: Config) => {
		deinstallConfigMutation.mutate({
			data: { configIds: [config.id], runId: activeRun.id },
		});
	};
	return (
		<section className="max-w-5xl mx-auto p-4">
			<h1 className="text-3xl mb-4">Your progress this run</h1>

			<div className="w-1/3">
				<section className="border-b border-t border-white py-4 my-4">
					<div className="space-y-4">
						<div className="flex gap-4">
							<Badge status="pending" />
							<h2 className="text-3xl">Gate #1</h2>
						</div>
						<div>
							<h2 className="text-xl">Requirement(s):</h2>
							<ul className="space-y-1 pt-2">
								<li className="flex items-center gap-2 before:content-['✓'] before:text-green-400 before:w-4 before:text-center text-green-400">
									Score 4% coverage in ANY category
								</li>
								<li className="flex items-center gap-2 before:content-['❯'] before:text-gray-400 before:w-4 before:text-center">
									Score 14% coverage in ANY category
								</li>
							</ul>
						</div>
						<div>
							<h2 className="text-xl">Polls 1-5</h2>
							<ul className="mt-2">
								<li className="flex items-center gap-3 before:content-['✓'] before:text-green-400 before:w-4 before:text-center">
									<span className="w-16">Poll #1</span>
									<span className="text-lavender">TypeScript</span>
								</li>
								<li className="flex items-center gap-3 before:content-['✓'] before:text-green-400 before:w-4 before:text-center">
									<span className="w-16">Poll #2</span>
									<span className="text-saffron">JavaScript</span>
								</li>
								<li className="flex items-center gap-3 before:content-['✗'] before:text-red-400 before:w-4 before:text-center">
									<span className="w-16">Poll #3</span>
									<span className="text-saffron">JavaScript</span>
								</li>
								<li className="flex items-center gap-3 before:content-['❯'] before:text-yellow-400 before:w-4 before:text-center">
									<span className="w-16">Poll #4</span>
									<span className="text-cerulean">CSS</span>
								</li>
								<li className="flex items-center gap-3 before:content-['·'] before:text-gray-500 before:w-4 before:text-center">
									<span className="w-16">Poll #5</span>
									<span className="text-gray-500">?????</span>
								</li>
							</ul>
						</div>
					</div>
				</section>
			</div>

			<ShopContainer activeRun={activeRun} offeredConfigs={offeredConfigs} />
			<section>
				<h3 className="text-3xl">Your active configs</h3>
				<div className="text-sm text-gray-400">
					<span>Used: </span>
					{formatStorage(storageUsed)} / {formatStorage(storageLimit)}
					{storageAvailable > 0 && (
						<div className="text-green-600">
							{formatStorage(storageAvailable)} available
						</div>
					)}
				</div>
				<ul className="flex gap-4">
					{activeConfigs.length === 0 ? (
						<p className="text-gray-400">No active configs installed</p>
					) : (
						activeConfigs.map((config) => (
							<ActiveCard
								key={config.id}
								config={config}
								onDeinstall={onDeinstallConfig}
							/>
						))
					)}
				</ul>
			</section>
		</section>
	);
}
