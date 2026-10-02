import { StartView } from "~/modules/run/build/presentation/StartView.component";
import { nextFrom } from "~/modules/run/run/application/runRoutes.viewmodel";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";

export const RunNew = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { send, warmBoot } = useRunActions();
	const goTo = useRunNavigation();

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
			onStart={() => goTo(nextFrom("new", view))}
			onWarmBoot={(pick) =>
				warmBoot.mutate(pick, {
					onSuccess: (result) => {
						if (result.success) goTo(nextFrom("new", result.data));
					},
				})
			}
			bootRefusal={warmBoot.errorMessage ?? undefined}
			booting={warmBoot.isPending}
		/>
	);
};
