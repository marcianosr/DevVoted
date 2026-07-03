import type { CoverageEquationData } from "~/ui/runs/CoverageEquation.ui";
import { PipelineScoreSummary } from "~/ui/runs/PipelineScoreSummary.ui";

type PipelineScoreSectionProps = {
	equation: CoverageEquationData & { categoryName: string };
};

export const PipelineScoreSection = ({
	equation,
}: PipelineScoreSectionProps) => <PipelineScoreSummary equation={equation} />;
