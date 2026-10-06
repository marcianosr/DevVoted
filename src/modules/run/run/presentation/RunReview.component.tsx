import { ReviewView } from "~/modules/run/run/presentation/ReviewView.component";
import { reviewBackOf } from "~/modules/run/run/application/runRoutes.viewmodel";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunReview = () => {
	const { view } = useTodaysRun();
	const goTo = useRunNavigation();

	if (!view) return null;

	const back = reviewBackOf(view);

	return (
		<ReviewView
			view={view}
			back={{
				label: back.label,
				onUse: () => goTo(back.path),
			}}
		/>
	);
};
