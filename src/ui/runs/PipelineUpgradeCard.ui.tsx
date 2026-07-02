import { clsx } from "clsx";

import { formatStorage } from "~/lib/storage";

type PipelineUpgradeCardProps = {
	badge: string; // "Upgrade" | "Add pipeline"
	title: string;
	slug: string; // gate type identifier, shown as the colored subtitle
	reward: number; // storage payout in bytes
	needs: string; // requirement summary
	description?: string;
	riskClassName: string; // difficulty color (text + border), e.g. "text-blue-400 border-blue-400"
	selected: boolean;
	onToggle: () => void;
	disabled?: boolean;
};

export const PipelineUpgradeCard = ({
	badge,
	title,
	slug,
	reward,
	needs,
	description,
	riskClassName,
	selected,
	onToggle,
	disabled = false,
}: PipelineUpgradeCardProps) => (
	<button
		type="button"
		onClick={onToggle}
		disabled={disabled}
		aria-pressed={selected}
		className={clsx(
			"relative flex flex-col items-start gap-3 overflow-hidden border bg-zinc-900/60 p-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
			selected
				? "border-white ring-1 ring-white"
				: "border-zinc-700 hover:border-zinc-500"
		)}
	>
		<span
			className={clsx("absolute inset-x-0 top-0 border-t-4", riskClassName)}
		/>
		<span
			className={clsx(
				"border px-2 py-0.5 text-xs uppercase tracking-wide",
				riskClassName
			)}
		>
			{badge}
		</span>
		<div>
			<span className="block text-lg text-white">{title}</span>
			<span className="block text-sm text-theme">{slug}</span>
		</div>
		<span className="text-xl text-emerald-400">+{formatStorage(reward)}</span>
		<span className="text-sm text-zinc-300">needs: {needs}</span>
		{description && (
			<span className="text-sm text-zinc-300">{description}</span>
		)}
	</button>
);
