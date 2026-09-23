import { useNavigate } from "@tanstack/react-router";

import { StartView } from "~/modules/run/build/presentation/StartView.component";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

/**
 * Tier 2: the opening build. Starting does not fire `start` — it turns the page
 * to prep, where gate 0 states its terms the way every later gate does.
 */
export const RunNew = () => {
	const { view } = useTodaysRun();
	const { send } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const installed = new Set(view.configs.map((config) => config.id));

	return (
		<StartView
			view={view}
			onToggle={(configId) =>
				send({
					type: installed.has(configId) ? "uninstall" : "install",
					configId,
				})
			}
			onVendorLock={(configId) => send({ type: "vendor-lock", configId })}
			onStart={() => navigate({ to: "/run/prep" })}
		/>
	);
};
