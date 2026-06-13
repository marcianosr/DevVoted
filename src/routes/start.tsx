import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";

import { useArchiveState } from "~/domains/economy/hooks/useArchiveState";
import { STORAGE_INJECTION_TIERS } from "~/domains/economy/data/storageInjectionTiers";
import { getOrCreateRun } from "~/domains/runs/api/runs";
import { formatStorage } from "~/lib/storage";
import { GameLoopExplainer } from "~/ui/GameLoopExplainer.component";
import { PrimaryButton } from "~/ui/PrimaryButton.component";

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

const NO_INJECTION = 0;

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const navigate = useNavigate();
	const archiveQuery = useArchiveState(user?.id);
	const [selectedTier, setSelectedTier] = useState<number>(NO_INJECTION);

	const startRunMutation = useMutation({
		mutationFn: () =>
			getOrCreateRun({ data: { injectFromArchive: selectedTier } }),
		onSuccess: () => {
			navigate({ to: "/daily-poll" });
		},
	});

	const archiveBalance = archiveQuery.data?.archivedStorage ?? 0;
	const canAfford = (tier: number) => tier <= archiveBalance;

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
						Can you survive and succeed all pipelines?
					</p>
				</section>

				{user ? (
					<>
						<StorageInjectionLoadout
							archiveBalance={archiveBalance}
							selectedTier={selectedTier}
							onSelectTier={setSelectedTier}
							canAfford={canAfford}
						/>

						<PrimaryButton
							onClick={() => startRunMutation.mutate()}
							disabled={startRunMutation.isPending}
						>
							{selectedTier > 0
								? `Start with +${formatStorage(selectedTier)} injected`
								: "Start New Run"}
						</PrimaryButton>

						{startRunMutation.isError && (
							<p className="text-red-400 mt-3 text-sm">
								{(startRunMutation.error as Error).message}
							</p>
						)}
					</>
				) : (
					<Link to="/login" className="py-8  text-3xl underline">
						Login to Start
					</Link>
				)}
			</div>
		</div>
	);
}

type LoadoutProps = {
	archiveBalance: number;
	selectedTier: number;
	onSelectTier: (tier: number) => void;
	canAfford: (tier: number) => boolean;
};

const StorageInjectionLoadout = ({
	archiveBalance,
	selectedTier,
	onSelectTier,
	canAfford,
}: LoadoutProps) => {
	return (
		<section className="mb-6 border border-white/20 p-4">
			<header className="mb-3 flex items-baseline justify-between gap-3">
				<h3 className="text-lg text-cyan-400">Inject archived storage</h3>
				<span className="text-sm text-gray-400">
					Archive: {formatStorage(archiveBalance)}
				</span>
			</header>

			<p className="text-sm text-gray-300 mb-4">
				Spend archive to start the run with extra storage. Spent archive is{" "}
				<span className="text-amber-300">gone</span> — choose carefully.
			</p>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
				<TierButton
					label="No boost"
					sublabel="Free"
					isSelected={selectedTier === NO_INJECTION}
					isAffordable={true}
					onClick={() => onSelectTier(NO_INJECTION)}
				/>
				{STORAGE_INJECTION_TIERS.map((tier) => (
					<TierButton
						key={tier}
						label={`+${formatStorage(tier)}`}
						sublabel={`Cost: ${formatStorage(tier)}`}
						isSelected={selectedTier === tier}
						isAffordable={canAfford(tier)}
						onClick={() => onSelectTier(tier)}
					/>
				))}
			</div>
		</section>
	);
};

type TierButtonProps = {
	label: string;
	sublabel: string;
	isSelected: boolean;
	isAffordable: boolean;
	onClick: () => void;
};

const TierButton = ({
	label,
	sublabel,
	isSelected,
	isAffordable,
	onClick,
}: TierButtonProps) => {
	const baseClasses =
		"p-3 text-left border transition-colors disabled:cursor-not-allowed";
	const stateClasses = isSelected
		? "border-cyan-400 bg-cyan-400/10 text-cyan-100"
		: isAffordable
			? "border-white/40 hover:border-white/80 text-white"
			: "border-white/10 text-white/30";

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={!isAffordable}
			className={`${baseClasses} ${stateClasses}`}
		>
			<div className="text-base">{label}</div>
			<div className="text-xs text-gray-400">{sublabel}</div>
		</button>
	);
};
