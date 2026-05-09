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

// ─── Corner ornament ──────────────────────────────────────────────────────────

const CornerOrnament = ({
	position,
}: {
	position: "tl" | "tr" | "bl" | "br";
}) => {
	const pos: Record<string, string> = {
		tl: "top-0 left-0",
		tr: "top-0 right-0",
		bl: "bottom-0 left-0",
		br: "bottom-0 right-0",
	};
	const flip: Record<string, string> = {
		tl: "",
		tr: "scale-x-[-1]",
		bl: "scale-y-[-1]",
		br: "scale-x-[-1] scale-y-[-1]",
	};
	return (
		<div
			className={`absolute ${pos[position]} ${flip[position]} w-5 h-5 pointer-events-none`}
		>
			<div className="absolute top-0 left-0 w-full h-[2px] bg-theme" />
			<div className="absolute top-0 left-0 h-full w-[2px] bg-theme" />
			<div className="absolute top-[5px] left-[5px] w-[5px] h-[5px] rotate-45 border border-theme" />
		</div>
	);
};

// ─── DevCard ──────────────────────────────────────────────────────────────────

type DevCardSize = "default" | "small";

type DevCardProps = {
	data: DevCardData;
	size?: DevCardSize;
};

const SIZE_DIMS: Record<
	DevCardSize,
	{
		width: string;
		height: string;
		initials: string;
		name: string;
		award: string;
	}
> = {
	default: {
		width: "w-40",
		height: "h-60",
		initials: "text-7xl",
		name: "text-sm",
		award: "text-xs",
	},
	small: {
		width: "w-28",
		height: "h-40",
		initials: "text-5xl",
		name: "text-xs",
		award: "text-xs",
	},
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
			className={`${d.width} ${d.height} relative flex flex-col overflow-hidden bg-gray-950 border border-theme/40 select-none`}
		>
			{/* Corner ornaments */}
			<CornerOrnament position="tl" />
			<CornerOrnament position="tr" />
			<CornerOrnament position="bl" />
			<CornerOrnament position="br" />

			{/* Top gem — category indicator */}
			<div
				className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-3.5 h-3.5 rotate-45 bg-theme border border-theme/60"
				style={{ boxShadow: "0 0 8px var(--theme-color)" }}
			/>

			{/* Art area — fills card, initials with deep radial glow */}
			<div
				className="flex-1 relative flex items-center justify-center overflow-hidden"
				style={{
					background:
						"radial-gradient(ellipse 80% 70% at 50% 50%, color-mix(in oklch, var(--theme-color) 18%, #0a0a0f), #0a0a0f)",
				}}
			>
				{data.photoUrl ? (
					<img
						src={data.photoUrl}
						alt={data.displayName}
						className="w-full h-full object-cover"
					/>
				) : (
					<span
						className={`${d.initials} font-bold text-theme leading-none`}
						style={{
							textShadow:
								"0 0 40px var(--theme-color), 0 0 12px var(--theme-color)",
						}}
					>
						{initials}
					</span>
				)}

				{/* Bottom gradient overlay — fades art into the info strip */}
				<div
					className="absolute inset-x-0 bottom-0 h-16"
					style={{
						background: "linear-gradient(to top, #0a0a0f, transparent)",
					}}
				/>
			</div>

			{/* Info strip — overlaid on bottom */}
			<div className="relative z-10 px-3 pt-1 pb-2 flex flex-col gap-0.5">
				<p className={`text-white font-bold leading-tight truncate ${d.name}`}>
					{data.displayName}
				</p>
				{data.pinnacleAward ? (
					<p className={`text-theme leading-tight truncate ${d.award}`}>
						{data.pinnacleAward.name}
					</p>
				) : (
					categoryName && (
						<p className={`text-theme/60 leading-tight ${d.award}`}>
							{categoryName}
						</p>
					)
				)}
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
			description:
				"Reached critical mastery in JavaScript across your pipelines",
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
