import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";

import { getAwards } from "~/domains/awards/api/awards";
import type { Award, AwardContext } from "~/domains/awards/models/award.model";
import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";
import { awardQueryKeys } from "~/domains/shared/queryKeys";

import { AwardCard, RunnersUp } from "./AwardCard.component";

const CONTEXTS: { value: AwardContext; label: string; description: string }[] =
	[
		{
			value: "all-time",
			label: "All time",
			description:
				"Held by the player with the highest cumulative score across all completed runs",
		},
		{
			value: "current-runs",
			label: "Current runs",
			description: "Leading in active runs right now",
		},
	];

const TYPE_ORDER: Record<Award["type"], number> = {
	mastery: 0,
	coverage: 1,
	participation: 2,
};

const CategorySection = ({
	categoryCode,
	awards,
}: {
	categoryCode: CategoryCode;
	awards: Award[];
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const hasRunnersUp = awards.some((a) => a.earners.length > 1);

	return (
		<section data-category-theme={categoryCode} className="space-y-3">
			<div className="flex items-baseline gap-3">
				<h2 className="text-2xl text-theme">
					{getCategoryMetadata(categoryCode).name}
				</h2>
			</div>
			<ol className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
				{awards.map((award) => (
					<li key={award.id} className="flex flex-col">
						<AwardCard award={award} />
						{isExpanded && (
							<RunnersUp
								earners={award.earners.slice(1)}
								type={award.type}
								categoryCode={award.categoryCode}
							/>
						)}
					</li>
				))}
			</ol>
			<button
				type="button"
				onClick={() => setIsExpanded((v) => !v)}
				disabled={!hasRunnersUp}
				className="flex items-baseline gap-3 text-left disabled:cursor-default"
			>
				{hasRunnersUp && (
					<span className="text-md">
						{isExpanded ? "▾ Hide" : `▸ Show runners-up`}
					</span>
				)}
			</button>
		</section>
	);
};

const groupAwardsByCategory = (awards: Award[]) => {
	const groups = new Map<CategoryCode, Award[]>();

	for (const award of awards) {
		const existing = groups.get(award.categoryCode) ?? [];
		existing.push(award);
		groups.set(award.categoryCode, existing);
	}

	for (const [, list] of groups) {
		list.sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);
	}

	return Array.from(groups.entries());
};

export const AwardsGrid = () => {
	const [context, setContext] = useState<AwardContext>("current-runs");

	const { data, isLoading, error } = useQuery({
		queryKey: awardQueryKeys.byContext(context),
		queryFn: () => getAwards({ data: { context } }),
		staleTime: 5 * 60 * 1000,
	});

	const awards = data?.success ? data.data : [];
	const groupedAwards = groupAwardsByCategory(awards);
	const activeContext = CONTEXTS.find((c) => c.value === context)!;

	return (
		<div className="space-y-8">
			<header className="space-y-3">
				<div className="flex items-center gap-1">
					{CONTEXTS.map((c) => (
						<button
							key={c.value}
							type="button"
							onClick={() => setContext(c.value)}
							className={clsx("px-4 py-1.5 text-sm border transition-colors", {
								"border-theme text-theme": context === c.value,
								"border-zinc-700 text-gray-400 hover:border-zinc-500":
									context !== c.value,
							})}
						>
							{c.label}
						</button>
					))}
				</div>
				<p className="text-xs text-gray-500">{activeContext.description}</p>
			</header>

			{isLoading && <p className="text-gray-400 text-sm">Loading awards...</p>}
			{(error || (data && !data.success)) && (
				<p className="text-red-500 text-sm">Failed to load awards</p>
			)}

			{data?.success && (
				<div className="space-y-10">
					{groupedAwards.map(([categoryCode, categoryAwards]) => (
						<CategorySection
							key={categoryCode}
							categoryCode={categoryCode}
							awards={categoryAwards}
						/>
					))}
				</div>
			)}
		</div>
	);
};
