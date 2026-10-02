import { ReviewView } from "~/modules/run/run/presentation/ReviewView.component";
import { REVIEW_BACK } from "~/modules/run/run/application/runRoutes.viewmodel";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunReview = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const goTo = useRunNavigation();

	if (!view) return null;

	return (
		<ReviewView
			runNumber={runNumber.view}
			view={view}
			back={{
				label: REVIEW_BACK.label,
				onUse: () => goTo(REVIEW_BACK.path),
			}}
		/>
	);
};
