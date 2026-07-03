import { CoverageEquation } from "~/ui/runs/CoverageEquation.ui";
import type { CoverageEquationData } from "~/ui/runs/CoverageEquation.ui";

type PipelineScoreSummaryProps = {
	equation: CoverageEquationData & { categoryName: string };
};

/**
 * The /pipelines score header: how the last answer scored, as the coverage
 * equation (base + modifiers = earned, with the category coverage bar and
 * streak line). The category names the block; per-check progress lives in the
 * CI Pipelines block beside it, so this is purely the answer's scoring.
 */
export const PipelineScoreSummary = ({
	equation,
}: PipelineScoreSummaryProps) => (
	<div className="border border-white">
		<div className="border-b border-white px-4 py-3">
			<p className="text-2xl">
				Poll score for{" "}
				<span className="text-theme">{equation.categoryName}</span>
			</p>
		</div>
		<div className="px-4 py-3">
			<CoverageEquation {...equation} />
		</div>
	</div>
);
