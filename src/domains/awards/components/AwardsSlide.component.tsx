import { CATEGORY_METADATA } from "~/domains/shared/categories";
import type { CategoryCode } from "~/domains/shared/categories";
import type { AwardMetric, CategoryAwardWithHolder } from "../models/award";

const METRIC_LABEL: Record<AwardMetric, string> = {
	coverage: "highest coverage",
	streak: "longest streak",
	polls_answered: "most polls answered",
};

type AwardsSlideProps = {
	awards: CategoryAwardWithHolder[];
	categoryCode: CategoryCode;
	onContinue: () => void;
};

export const AwardsSlide = ({
	awards,
	categoryCode,
	onContinue,
}: AwardsSlideProps) => {
	const categoryName = CATEGORY_METADATA[categoryCode].name;

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10">
			<div className="space-y-2">
				<p className="text-zinc-400 text-lg uppercase tracking-widest">
					{categoryName} · Current Record Holder{awards.length > 1 ? "s" : ""}
				</p>
				<h2 className="text-5xl font-bold text-theme">You hold a title</h2>
			</div>

			<ul className="space-y-8 w-full max-w-sm">
				{awards.map(({ award, holder }) => (
					<li key={award.metric} className="border border-theme p-6 space-y-1">
						<p className="text-3xl">★ {award.name}</p>
						<p className="text-zinc-400 text-sm">
							{METRIC_LABEL[award.metric]} in {categoryName}
						</p>
						<p className="text-zinc-500 text-sm mt-2">
							{award.metric === "coverage" &&
								`${Math.round(holder.value)}% coverage`}
							{award.metric === "streak" && `${holder.value} correct in a row`}
							{award.metric === "polls_answered" &&
								`${holder.value} polls answered`}
						</p>
					</li>
				))}
			</ul>

			<button
				onClick={onContinue}
				className="text-xl border border-theme px-8 py-3 hover:bg-theme/10 transition-colors cursor-pointer"
			>
				Continue →
			</button>
		</div>
	);
};
