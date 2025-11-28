import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { clsx } from "clsx";

import { removeConfigFromRunServerFn } from "~/domains/configs/api/configs";
import ActiveCard from "~/domains/configs/components/Cards/ActiveCard";
import { applyEffects, configs } from "~/domains/configs/data/configs";
import { Config } from "~/domains/configs/models/config";
import { withDiscount } from "~/domains/configs/services/discount.service";
import ShopContainer from "~/domains/economy/components/ShopContainer";
import {
	getRandomConfigs,
	getStorageInfo,
} from "~/domains/economy/services/configManager.service";
import {
	getDailyPoll,
	getPollsSeenInRun,
	getRunPollHistoryServerFn,
} from "~/domains/polls/api/polls";
import { RunPollHistory } from "~/domains/polls/api/queries";
import { PollCountdown } from "~/domains/polls/components/PollCountdown";
import { Poll } from "~/domains/polls/models/poll";
import { CategoryCoverageGrid } from "~/domains/runs/components/CategoryCoverageGrid";
import {
	CI_GATES,
	getCurrentRound,
	POLLS_PER_ROUND,
} from "~/domains/runs/services/thresholdCalculator.service";
import { formatGateRequirements } from "~/domains/runs/utils/gateFormatting";
import {
	CATEGORY_METADATA,
	type CategoryCode,
} from "~/domains/shared/categories";
import { formatStorage } from "~/lib/storage";

export const Route = createFileRoute("/_authed/progress")({
	component: RouteComponent,
	loader: async ({ context: { activeRun } }) => {
		const pollResponse = await getDailyPoll();

		if (!pollResponse.success) {
			throw new Error(pollResponse.error);
		}

		if (!activeRun?.success) {
			throw new Error("No active run");
		}

		const [pollsSeenResponse, pollHistoryResponse] = await Promise.all([
			getPollsSeenInRun(),
			getRunPollHistoryServerFn(),
		]);

		const pollsSeen = pollsSeenResponse.success ? pollsSeenResponse.data : 0;
		const pollHistory = pollHistoryResponse.success
			? pollHistoryResponse.data
			: [];
		const currentRound = getCurrentRound(pollsSeen);

		const configEffects = applyEffects(
			{
				poll: pollResponse.data.poll,
				options: pollResponse.data.options,
				hasAnswered: pollResponse.data.hasAnswered,
				run: activeRun.data,
			},
			activeRun.data.activeConfigIds
		);

		const offeredConfigs = getRandomConfigs({
			count: 3,
			run: activeRun.data,
			configs,
		});

		const displayedConfigs = offeredConfigs.map((c) =>
			withDiscount(c, configEffects.reductionCost ?? 0)
		);

		return {
			dailyPoll: {
				poll: pollResponse.data.poll,
				options: pollResponse.data.options,
				hasAnswered: pollResponse.data.hasAnswered,
				selectedOptions: pollResponse.data.selectedOptions,
			},
			activeRun: activeRun.data,
			offeredConfigs: displayedConfigs,
			configEffects,
			currentRound,
			pollsSeen,
			pollHistory,
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

const getGateStatus = (
	gateNumber: number,
	currentRound: number
): BadgeStatus => {
	if (gateNumber < currentRound) return "pass";
	if (gateNumber === currentRound) return "pending";
	return "pending";
};

const getPollsForGate = (
	pollHistory: RunPollHistory[],
	gateNumber: number
): RunPollHistory[] => {
	const startIndex = (gateNumber - 1) * POLLS_PER_ROUND;
	const endIndex = startIndex + POLLS_PER_ROUND;
	return pollHistory.slice(startIndex, endIndex);
};

const PollHistoryItem = ({
	poll,
	dailyPoll,
	idx,
}: {
	poll: RunPollHistory;
	dailyPoll: Poll;
	idx: number;
}) => {
	const categoryName =
		CATEGORY_METADATA[poll.categoryCode as CategoryCode]?.name ??
		poll.categoryCode;
	const isAnswered = poll.answeredAt !== null;

	const isCurrentDailyPoll = dailyPoll && dailyPoll.id === poll.pollId;

	if (!isAnswered) {
		return (
			<li
				className={clsx(
					"flex items-center gap-2",
					isCurrentDailyPoll ? "text-yellow-400" : "text-gray-500"
				)}
			>
				<span className="w-4 text-center">{idx + 1}</span>
				<span data-category-theme={poll.categoryCode} className="text-theme">
					{categoryName}
				</span>
				<span className="text-xs">(not answered)</span>
				<span>{!isCurrentDailyPoll && <span>Missed!</span>}</span>
				<span>{isCurrentDailyPoll && <span>(Today)</span>}</span>
			</li>
		);
	}

	return (
		<li className="flex items-center gap-2">
			<span className="w-4 text-center">{idx + 1}</span>
			{isAnswered ? (
				<span
					className={`w-4 text-center ${poll.isCorrect ? "text-green-400" : "text-red-400"}`}
				>
					{poll.isCorrect ? "✓" : "✗"}
				</span>
			) : (
				<span className="text-yellow-400 w-4 text-center">❯</span>
			)}
			<span data-category-theme={poll.categoryCode} className="text-theme">
				{categoryName}
			</span>
			<span>{isCurrentDailyPoll && <span>(Today)</span>}</span>
		</li>
	);
};

function RouteComponent() {
	const {
		activeRun,
		offeredConfigs,
		configEffects: { reductionCost },
		currentRound,
		pollHistory,
		dailyPoll,
	} = Route.useLoaderData();

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
		<section className="max-w-5xl mx-auto p-4 space-y-12">
			<PollCountdown />

			<h1 className="text-3xl mb-8">Your progress this run</h1>

			<section className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="space-y-4">
					<h3 className="text-xl">Gate Progress</h3>
					{CI_GATES.slice(0, currentRound).map((gate) => {
						const status = getGateStatus(gate.gate, currentRound);
						const isCurrent = gate.gate === currentRound;

						return (
							<details
								key={gate.gate}
								className={`group border-b border-t border-white py-4 ${isCurrent ? "bg-white/5" : ""}`}
								open={isCurrent}
							>
								<summary className="list-none flex gap-4 items-center cursor-pointer before:content-['▸'] before:text-2xl before:w-6 group-open:before:content-['▾']">
									<Badge status={status} />
									<h2 className="text-2xl">Gate #{gate.gate}</h2>
								</summary>
								<div className="mt-2">
									<p className="text-gray-400">
										Score atleast: {formatGateRequirements(gate)}
									</p>
								</div>
								<ol className="mt-3 space-y-1">
									{getPollsForGate(pollHistory, gate.gate).map((poll, idx) => (
										<>
											<PollHistoryItem
												key={poll.pollId}
												poll={poll}
												dailyPoll={dailyPoll.poll}
												idx={idx + (gate.gate - 1) * POLLS_PER_ROUND}
											/>
										</>
									))}
								</ol>
							</details>
						);
					})}
				</div>
				<CategoryCoverageGrid
					categoryCoverage={activeRun.categoryCoverage}
					currentCategoryCode={dailyPoll.poll.categoryCode}
				/>
			</section>
			<ShopContainer
				activeRun={activeRun}
				offeredConfigs={offeredConfigs}
				reductionCost={reductionCost}
				isOpen={dailyPoll.hasAnswered}
			/>
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
								disabled={!dailyPoll.hasAnswered}
							/>
						))
					)}
				</ul>
			</section>
		</section>
	);
}
