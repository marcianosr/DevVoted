import type { CategoryCode } from "~/domains/shared/categories";
import { CATEGORY_METADATA } from "~/domains/shared/categories";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Award = {
	name: string;
	description: string;
	earned: boolean;
};

export type DevCardData = {
	displayName: string;
	photoUrl: string | null;
	dominantCategory: CategoryCode | null;
	pinnacleAward: Award | null;
	awardsEarned: number;
	totalRuns: number;
};

// ─── DevCard ──────────────────────────────────────────────────────────────────

type DevCardSize = "default" | "small";

type DevCardProps = {
	data: DevCardData;
	size?: DevCardSize;
};

const SIZE_DIMS: Record<DevCardSize, { card: string; initials: string; name: string; award: string; footer: string }> = {
	default: { card: "w-44", initials: "text-6xl", name: "text-sm", award: "text-xs", footer: "text-xs" },
	small:   { card: "w-28", initials: "text-4xl", name: "text-xs", award: "text-xs", footer: "hidden" },
};

export const DevCard = ({ data, size = "default" }: DevCardProps) => {
	const d = SIZE_DIMS[size];
	const categoryName = data.dominantCategory
		? CATEGORY_METADATA[data.dominantCategory].name.toUpperCase()
		: null;
	const initials = data.displayName.slice(0, 2).toUpperCase();

	return (
		<div
			data-category-theme={data.dominantCategory ?? undefined}
			className={`${d.card} relative flex flex-col bg-gray-950 border-2 border-theme select-none`}
		>
			{/* Top banner — category label */}
			<div className="bg-theme/15 border-b border-theme px-2 py-1 flex items-center justify-center">
				<span className="text-theme text-xs font-bold tracking-[0.2em] uppercase">
					{categoryName ?? "UNKNOWN"}
				</span>
			</div>

			{/* Art area — initials with radial glow */}
			<div
				className="relative flex items-center justify-center py-8 overflow-hidden"
				style={{
					background:
						"radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in oklch, var(--theme-color) 20%, transparent), transparent 80%)",
				}}
			>
				{data.photoUrl ? (
					<img
						src={data.photoUrl}
						alt={data.displayName}
						className="w-20 h-20 object-cover"
					/>
				) : (
					<span
						className={`${d.initials} font-bold text-theme leading-none`}
						style={{
							textShadow:
								"0 0 24px var(--theme-color), 0 0 8px var(--theme-color)",
						}}
					>
						{initials}
					</span>
				)}
			</div>

			{/* Info area */}
			<div className="px-3 pb-1 flex flex-col gap-1 border-t border-theme">
				<p className={`text-white font-bold leading-tight truncate mt-2 ${d.name}`}>
					{data.displayName}
				</p>
				{data.pinnacleAward && (
					<p className={`text-theme font-bold ${d.award}`}>
						{data.pinnacleAward.name}
					</p>
				)}
			</div>

			{/* Footer stats + ticket notch row */}
			<div className="relative flex items-center px-3 py-1.5 border-t border-dashed border-theme mt-1">
				{/* Left notch */}
				<div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border border-theme" />
				<div className={`flex justify-between w-full text-gray-600 ${d.footer}`}>
					<span>{data.awardsEarned} awards</span>
					<span>{data.totalRuns} runs</span>
				</div>
				{/* Right notch */}
				<div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border border-theme" />
			</div>
		</div>
	);
};

// ─── DevCardMini ──────────────────────────────────────────────────────────────
// Compact horizontal strip — used inline where portrait cards would be too heavy

type DevCardMiniProps = {
	data: DevCardData;
};

export const DevCardMini = ({ data }: DevCardMiniProps) => (
	<div
		data-category-theme={data.dominantCategory ?? undefined}
		className="border-l-4 border-theme bg-gray-900 flex items-center gap-3 px-3 py-2"
	>
		<div className="flex items-center justify-center w-9 h-9 shrink-0 bg-gray-800">
			{data.photoUrl ? (
				<img
					src={data.photoUrl}
					alt={data.displayName}
					className="w-full h-full object-cover"
				/>
			) : (
				<span className="text-theme text-sm font-bold">
					{data.displayName.slice(0, 2).toUpperCase()}
				</span>
			)}
		</div>

		<div className="flex flex-col min-w-0">
			<span className="text-white text-sm font-bold truncate">
				{data.displayName}
			</span>
			{data.dominantCategory && (
				<span className="text-theme text-xs uppercase tracking-widest">
					{CATEGORY_METADATA[data.dominantCategory].name}
				</span>
			)}
		</div>

		{data.pinnacleAward && (
			<span className="text-theme text-xs font-bold ml-auto shrink-0">
				{data.pinnacleAward.name}
			</span>
		)}
	</div>
);

// ─── Mock data for prototype ──────────────────────────────────────────────────

export const MOCK_DEV_CARD: DevCardData = {
	displayName: "Marciano",
	photoUrl: null,
	dominantCategory: "html",
	pinnacleAward: {
		name: "Markup Master",
		description: "Reached critical mastery in HTML across your pipelines",
		earned: true,
	},
	awardsEarned: 7,
	totalRuns: 14,
};

export const MOCK_COMMUNITY: DevCardData[] = [
	MOCK_DEV_CARD,
	{
		displayName: "Banjo",
		photoUrl: null,
		dominantCategory: "js",
		pinnacleAward: {
			name: "Script Sage",
			description: "Reached critical mastery in JavaScript across your pipelines",
			earned: true,
		},
		awardsEarned: 5,
		totalRuns: 9,
	},
	{
		displayName: "Kazooie",
		photoUrl: null,
		dominantCategory: "ts",
		pinnacleAward: {
			name: "Type Architect",
			description: "Built a critical coverage-gain pipeline slot",
			earned: true,
		},
		awardsEarned: 11,
		totalRuns: 22,
	},
	{
		displayName: "Gruntilda",
		photoUrl: null,
		dominantCategory: "css",
		pinnacleAward: {
			name: "CSS Connoisseur",
			description: "Reached critical mastery in CSS across your pipelines",
			earned: true,
		},
		awardsEarned: 3,
		totalRuns: 6,
	},
	{
		displayName: "Mumbo",
		photoUrl: null,
		dominantCategory: "python",
		pinnacleAward: {
			name: "Oracle of Seasons",
			description: "Highest season streak of participation and correct polls",
			earned: true,
		},
		awardsEarned: 9,
		totalRuns: 31,
	},
	{
		displayName: "Tooty",
		photoUrl: null,
		dominantCategory: "react",
		pinnacleAward: {
			name: "Black Sheep",
			description: "Being the only one voting for the correct answer",
			earned: true,
		},
		awardsEarned: 4,
		totalRuns: 7,
	},
	{
		displayName: "Bottles",
		photoUrl: null,
		dominantCategory: "java",
		pinnacleAward: {
			name: "Cold Starter",
			description: "Built a critical cold-start pipeline slot and survived",
			earned: true,
		},
		awardsEarned: 6,
		totalRuns: 18,
	},
	{
		displayName: "Klungo",
		photoUrl: null,
		dominantCategory: "general-backend",
		pinnacleAward: {
			name: "Pipeline Veteran",
			description: "Discovered all 20 pipeline slot combinations",
			earned: true,
		},
		awardsEarned: 14,
		totalRuns: 40,
	},
];
