import { clsx } from "clsx";

import type { Award, AwardEarner } from "../models/award.model";
import { AwardScoreBars } from "./AwardScoreBars.component";

type AwardCardProps = {
	award: Award;
};

export const AwardCard = ({ award }: AwardCardProps) => {
	const isUnclaimed = award.earners.length === 0;
	const winner = award.earners[0];

	return (
		<article
			data-category-theme={award.categoryCode}
			className={clsx(
				"border p-4 flex flex-col gap-3 min-h-40",
				isUnclaimed ? "border-zinc-700 opacity-60" : "border-theme"
			)}
		>
			<header className="flex flex-col gap-1">
				<h3 className="text-lg leading-tight text-theme font-medium">
					{award.name}
				</h3>
				<p className="text-xs text-gray-400">{award.description}</p>
			</header>

			<footer className="mt-auto">
				{isUnclaimed ? (
					<p className="text-sm text-zinc-500 italic">No holder yet</p>
				) : (
					winner && <AwardScoreBars earners={[winner]} type={award.type} />
				)}
			</footer>
		</article>
	);
};

type RunnersUpProps = {
	earners: AwardEarner[];
	type: Award["type"];
	categoryCode: Award["categoryCode"];
};

export const RunnersUp = ({ earners, type, categoryCode }: RunnersUpProps) => {
	if (earners.length === 0) return null;

	return (
		<div data-category-theme={categoryCode} className="pt-1">
			<AwardScoreBars earners={earners} type={type} startRank={2} />
		</div>
	);
};
