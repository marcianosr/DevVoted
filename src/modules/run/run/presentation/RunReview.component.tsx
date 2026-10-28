import { useNavigate } from "@tanstack/react-router";

import { useViewer } from "~/modules/account/auth/application/useViewer.hook";
import { AccountLock } from "~/modules/account/auth/presentation/AccountLock.ui";
import { kantoReview } from "~/test/kantoGate.factory";
import { ReviewScreen } from "~/modules/run/run/presentation/ReviewScreen.ui";
import { ReviewView } from "~/modules/run/run/presentation/ReviewView.component";
import { reviewBackOf } from "~/modules/run/run/application/runRoutes.viewmodel";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunReview = () => {
	const viewer = useViewer();
	const navigate = useNavigate();
	const { view } = useTodaysRun();
	const goTo = useRunNavigation();

	if (viewer?.isGuest === true)
		return (
			<AccountLock onSignIn={() => navigate({ to: "/login" })}>
				<ReviewScreen {...kantoReview()} />
			</AccountLock>
		);

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
