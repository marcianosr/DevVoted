import type { Award } from "./DevCard.component";

// ─── Mock awards for prototype ────────────────────────────────────────────────

export const MOCK_AWARDS: (Award & { category?: string })[] = [
	// Category mastery
	{
		name: "Markup Master",
		description: "Reached critical mastery in HTML across your pipelines",
		earned: true,
		category: "html",
	},
	{
		name: "CSS Connoisseur",
		description: "Reached critical mastery in CSS across your pipelines",
		earned: true,
		category: "css",
	},
	{
		name: "Script Sage",
		description: "Reached critical mastery in JavaScript across your pipelines",
		earned: false,
		category: "js",
	},
	{
		name: "Type Architect",
		description: "Reached critical mastery in TypeScript across your pipelines",
		earned: false,
		category: "ts",
	},
	{
		name: "React Ranger",
		description: "Reached critical mastery in React across your pipelines",
		earned: false,
		category: "react",
	},
	// Pipeline mastery
	{
		name: "Cold Starter",
		description: "Built a critical cold-start pipeline slot and survived",
		earned: true,
	},
	{
		name: "Coverage Hound",
		description: "Maxed a coverage-gain pipeline to critical difficulty",
		earned: true,
	},
	{
		name: "Window Dasher",
		description: "Ran a critical short-window pipeline to completion",
		earned: false,
	},
	{
		name: "Pipeline Veteran",
		description: "Discovered all 20 pipeline slot combinations",
		earned: false,
	},
	// Meta / social
	{
		name: "Black Sheep",
		description: "Being the only one voting for the correct answer",
		earned: true,
	},
	{
		name: "Jack of All Trades",
		description: "Participated in all poll categories, no specialism award yet",
		earned: true,
	},
	{
		name: "Rock Steady",
		description: "Highest season streak of poll participation",
		earned: false,
	},
	{
		name: "Oracle of Seasons",
		description: "Highest season streak of participation and correct polls",
		earned: false,
	},
	{
		name: "Polls Galore",
		description: "Answered over 200 polls in total across all runs",
		earned: true,
	},
];

// ─── Components ───────────────────────────────────────────────────────────────

type AwardCardProps = {
	award: Award & { category?: string };
};

const AwardCard = ({ award }: AwardCardProps) => {
	if (!award.earned) {
		return (
			<div className="border border-gray-800 rounded p-3 bg-gray-900/30 flex flex-col gap-1 min-h-[80px]">
				<span className="text-gray-700 text-xs uppercase tracking-widest">
					???
				</span>
				<span className="text-gray-700 text-xs mt-auto">not yet earned</span>
			</div>
		);
	}

	return (
		<div className="border border-theme rounded p-3 bg-gray-900 flex flex-col gap-1 min-h-[80px]">
			<span className="text-theme text-sm font-bold leading-tight">
				{award.name}
			</span>
			<span className="text-gray-400 text-xs leading-snug mt-auto">
				{award.description}
			</span>
		</div>
	);
};

type AwardsGalleryProps = {
	awards: (Award & { category?: string })[];
};

export const AwardsGallery = ({ awards }: AwardsGalleryProps) => {
	const earned = awards.filter((a) => a.earned).length;

	return (
		<section>
			<div className="flex items-baseline gap-3 mb-6">
				<h2 className="text-lg text-theme">Awards</h2>
				<span className="text-gray-500 text-xs uppercase tracking-widest">
					{earned} / {awards.length} earned
				</span>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
				{awards.map((award, i) => (
					<AwardCard key={award.earned ? award.name : `locked-${i}`} award={award} />
				))}
			</div>
		</section>
	);
};
