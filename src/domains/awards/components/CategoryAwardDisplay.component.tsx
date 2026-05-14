import { clsx } from "clsx";

import type { AwardHolder, AwardMetric, CategoryAward } from "../models/award";

const formatCoverage = (value: number): string => {
	const level = Math.floor(value / 100);
	const remainder = Math.round(value % 100);
	if (level === 0) return `${remainder}%`;
	return `L${level} · ${remainder}%`;
};

const formatValue = (metric: AwardMetric, value: number): string => {
	if (metric === "coverage") return formatCoverage(value);
	if (metric === "streak") return `${value} streak`;
	return `${value} polls answered`;
};

const formatGap = (metric: AwardMetric, gap: number): string => {
	if (metric === "coverage") return `${Math.round(gap)}% ahead of`;
	if (metric === "streak") return `${gap} ahead of`;
	return `${gap} more than`;
};

const KANTO_COLORS = [
	"bg-pallet",
	"bg-viridian",
	"bg-pewter",
	"bg-cerulean",
	"bg-vermillion",
	"bg-lavender",
	"bg-celadon",
	"bg-fuchsia",
	"bg-saffron",
	"bg-cinnabar",
	"bg-indigo",
	"bg-seafoam",
] as const;

const getColorFromString = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return KANTO_COLORS[Math.abs(hash) % KANTO_COLORS.length];
};

const AwardAvatar = ({ holder }: { holder: AwardHolder }) => {
	const initial = (holder.displayName || holder.userId).charAt(0).toUpperCase();
	const colorClass = getColorFromString(holder.userId);

	if (holder.photoUrl) {
		return (
			<img
				src={holder.photoUrl}
				alt={holder.displayName}
				className="w-6 h-6 rounded-full inline-block"
			/>
		);
	}

	return (
		<span
			className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-white text-xs ${colorClass}`}
		>
			{initial}
		</span>
	);
};

type CategoryAwardDisplayProps = {
	award: CategoryAward;
	holder: AwardHolder;
	runnerUp?: AwardHolder | null;
	isCurrentUser?: boolean;
	isNewlyUnlocked?: boolean;
};

export const CategoryAwardDisplay = ({
	award,
	holder,
	runnerUp,
	isCurrentUser = false,
	isNewlyUnlocked = false,
}: CategoryAwardDisplayProps) => {
	const gap = runnerUp ? Math.round(holder.value - runnerUp.value) : null;

	return (
		<div
			className={clsx("mt-4 pl-3", {
				"border-l-2 border-yellow-400": isCurrentUser,
			})}
		>
			<div className="flex items-center gap-2">
				<p className={clsx("text-xl", { "text-yellow-400": isCurrentUser })}>
					★ {award.name}
				</p>
				{isNewlyUnlocked && (
					<span className="text-xs border border-yellow-400 text-yellow-400 px-1.5 py-0.5 uppercase tracking-wide">
						Unlocked
					</span>
				)}
			</div>
			<p className="text-zinc-500 text-sm">{award.description}</p>
			<div className="flex gap-2 items-center mt-1 flex-wrap">
				<AwardAvatar holder={holder} />
				<p>{isCurrentUser ? "You" : holder.displayName}</p>
				<span>·</span>
				<span
					className={clsx("text-sm", {
						"text-yellow-400/70": isCurrentUser,
						"text-zinc-400": !isCurrentUser,
					})}
				>
					{formatValue(award.metric, holder.value)}
				</span>
				{gap !== null && gap > 0 && runnerUp && (
					<span className="text-zinc-600 text-sm">
						· {formatGap(award.metric, gap)} {runnerUp.displayName}
					</span>
				)}
			</div>
		</div>
	);
};
