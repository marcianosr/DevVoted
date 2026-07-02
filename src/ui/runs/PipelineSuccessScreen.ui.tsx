import type { ReactNode } from "react";

import { formatStorage } from "~/lib/storage";
import { StorageMeter } from "./StorageMeter.ui";

export type PipelineReward = {
	label: string; // e.g. "Coverage Gain · medium"
	bytes: number; // storage payout for this slot
};

type PipelineSuccessScreenProps = {
	gateNumber: number;
	rewards: PipelineReward[];
	totalReward: number; // total bytes earned this gate (the delta)
	storageUsed: number;
	storageLimit: number;
	children?: ReactNode; // what happens next: upgrade picker or a continue action
};

/**
 * Shown after a pipeline check passes: congratulates the player, shows the
 * storage rewards earned this gate (meter + delta), then hands off to the
 * `children` slot — the upgrade-card picker, or a continue button when there
 * are no cards to pick.
 */
export const PipelineSuccessScreen = ({
	gateNumber,
	rewards,
	totalReward,
	storageUsed,
	storageLimit,
	children,
}: PipelineSuccessScreenProps) => (
	<div className="flex flex-col gap-8 py-8">
		<header className="flex flex-col gap-1">
			<h1 className="text-4xl">Gate {gateNumber} cleared ✅</h1>
			<p className="text-gray-300">
				Your pipeline is green. Storage rewards have been added to your run.
			</p>
		</header>

		{rewards.length > 0 && (
			<section className="flex flex-col gap-3">
				<h2 className="text-2xl">Rewards</h2>
				<ul className="flex flex-col gap-1">
					{rewards.map((reward) => (
						<li key={reward.label} className="flex justify-between">
							<span className="text-gray-300">{reward.label}</span>
							<span className="text-green-400">
								+{formatStorage(reward.bytes)}
							</span>
						</li>
					))}
				</ul>
			</section>
		)}

		<StorageMeter used={storageUsed} limit={storageLimit} delta={totalReward} />

		{children}
	</div>
);
