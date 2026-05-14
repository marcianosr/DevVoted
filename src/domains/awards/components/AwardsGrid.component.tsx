import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";

import { getAwards } from "~/domains/awards/api/awards";
import type { AwardContext } from "~/domains/awards/models/award.model";
import { awardQueryKeys } from "~/domains/shared/queryKeys";

import type { Award } from "../models/award.model";
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

const AwardSection = ({
	title,
	subtitle,
	awards,
}: {
	title: string;
	subtitle: string;
	awards: Award[];
}) => (
	<section className="space-y-4">
		<header>
			<h2 className="text-2xl text-theme">{title}</h2>
			<p className="text-sm text-gray-400">{subtitle}</p>
		</header>
		<ol className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
			{awards.map((award) => (
				<li key={award.id} className="flex flex-col">
					<AwardCard award={award} />
					<RunnersUp
						earners={award.earners.slice(1)}
						type={award.type}
						categoryCode={award.categoryCode}
					/>
				</li>
			))}
		</ol>
	</section>
);

export const AwardsGrid = () => {
	const [context, setContext] = useState<AwardContext>("current-runs");

	const { data, isLoading, error } = useQuery({
		queryKey: awardQueryKeys.byContext(context),
		queryFn: () => getAwards({ data: { context } }),
		staleTime: 5 * 60 * 1000,
	});

	const awards = data?.success ? data.data : [];
	const masteryAwards = awards.filter((a) => a.type === "mastery");
	const participationAwards = awards.filter((a) => a.type === "participation");
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
				<div className="space-y-12">
					<AwardSection
						title="Mastery Awards"
						subtitle="Most correct answers per category"
						awards={masteryAwards}
					/>
					<AwardSection
						title="Participation Awards"
						subtitle="Most polls answered per category"
						awards={participationAwards}
					/>
				</div>
			)}
		</div>
	);
};
