import { useNavigate } from "@tanstack/react-router";

import { StartView } from "~/modules/run/build/presentation/StartView.component";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";

export const RunNew = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { send, warmBoot } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const installed = new Set(view.configs.map((config) => config.id));

	return (
		<StartView
			runNumber={runNumber.view}
			view={view}
			onToggle={(configId) =>
				send({
					type: installed.has(configId) ? "uninstall" : "install",
					configId,
				})
			}
			onVendorLock={(configId) => send({ type: "vendor-lock", configId })}
			onStart={() => navigate({ to: "/run/prep" })}
			onWarmBoot={(pick) =>
				warmBoot.mutate(pick, {
					onSuccess: (result) => {
						if (result.success) navigate({ to: "/run/prep" });
					},
				})
			}
			bootRefusal={
				warmBoot.data?.success === false ? warmBoot.data.error : undefined
			}
			booting={warmBoot.isPending}
		/>
	);
};
