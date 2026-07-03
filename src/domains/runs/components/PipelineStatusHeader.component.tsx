import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";
import { PipelineStatusHeader as PipelineStatusHeaderUI } from "~/ui/runs/PipelineStatusHeader.ui";

type PipelineStatusHeaderProps = {
	context?: PipelineEvaluationContext;
};

export const PipelineStatusHeader = ({
	context,
}: PipelineStatusHeaderProps) => (
	<PipelineStatusHeaderUI
		gate={context?.currentGate}
		pollsLeft={
			context
				? context.pollsInWindow - context.pollsAnsweredInWindow
				: undefined
		}
	/>
);
