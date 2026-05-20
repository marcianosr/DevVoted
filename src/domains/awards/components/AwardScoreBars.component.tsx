import { clsx } from "clsx";

import type { Award, AwardEarner } from "../models/award.model";

const formatScore = (score: number, type: Award["type"]): string => {
	if (type === "participation") return `${Math.round(score)} polls`;
	if (type === "coverage") return `${score.toFixed(1)}%`;
	return `${Math.round(score)} correct`;
};

const Avatar = ({
	displayName,
	photoUrl,
	className,
}: {
	displayName: string;
	photoUrl: string | null;
	className: string;
}) =>
	photoUrl ? (
		<img
			src={photoUrl}
			alt={displayName}
			className={clsx("rounded-full object-cover shrink-0", className)}
		/>
	) : (
		<span
			className={clsx(
				"rounded-full bg-zinc-700 flex items-center justify-center text-gray-400 shrink-0",
				className
			)}
		>
			{displayName[0]?.toUpperCase()}
		</span>
	);

const WinnerDisplay = ({
	earner,
	type,
}: {
	earner: AwardEarner;
	type: Award["type"];
}) => (
	<li className="flex flex-col items-center gap-1.5 py-2">
		<Avatar
			displayName={earner.displayName}
			photoUrl={earner.photoUrl}
			className="w-12 h-12 text-sm border-2 border-theme"
		/>
		<span className="prismatic-text text-sm font-bold text-center leading-tight">
			{earner.displayName}
		</span>
		<span className="text-lg text-theme tabular-nums">
			{formatScore(earner.score, type)}
		</span>
	</li>
);

const RunnerUpRow = ({
	earner,
	type,
	rank,
}: {
	earner: AwardEarner;
	type: Award["type"];
	rank: number;
}) => (
	<li className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900/70">
		<span className="text-xs text-gray-500 w-4 text-center shrink-0 tabular-nums">
			{rank}
		</span>
		<Avatar
			displayName={earner.displayName}
			photoUrl={earner.photoUrl}
			className="w-6 h-6 text-[10px]"
		/>
		<span className="flex-1 text-xs text-gray-300 truncate">
			{earner.displayName}
		</span>
		<span className="text-xs text-gray-500 shrink-0 tabular-nums">
			{formatScore(earner.score, type)}
		</span>
	</li>
);

type AwardScoreBarsProps = {
	earners: AwardEarner[];
	type: Award["type"];
	startRank?: number;
};

export const AwardScoreBars = ({
	earners,
	type,
	startRank = 1,
}: AwardScoreBarsProps) => (
	<ul className="space-y-1">
		{earners.map((earner, idx) => {
			const rank = startRank + idx;
			return rank === 1 ? (
				<WinnerDisplay key={earner.userId} earner={earner} type={type} />
			) : (
				<RunnerUpRow
					key={earner.userId}
					earner={earner}
					type={type}
					rank={rank}
				/>
			);
		})}
	</ul>
);
