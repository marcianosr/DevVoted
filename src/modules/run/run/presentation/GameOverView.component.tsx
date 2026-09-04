import { kbLabel } from "~/shared/lib/storage";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	ALL_SWATCHES,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import { GameOverScreen } from "~/ui/terminal-theme/screens/GameOverScreen.ui";
import type { TrackSwatch } from "~/ui/terminal-theme/SwatchTrack.ui";
import { plural } from "~/ui/terminal-theme/format";

const earnedSwatches = (view: RunView): readonly TrackSwatch[] =>
	ALL_SWATCHES.filter((swatch) => swatch.gate < view.gatesCleared).map(
		(swatch) => ({ theme: swatch.theme, state: "earned" as const })
	);

const fellSwatches = (view: RunView): readonly TrackSwatch[] =>
	ALL_SWATCHES.filter((swatch) => swatch.gate >= view.gatesCleared).map(() => ({
		state: "locked" as const,
	}));

const missesOf = (answered: readonly AnsweredPoll[]) =>
	answered.filter((poll) => poll.outcome !== "correct");

export type GameOverViewProps = {
	view: RunView;
	won: boolean;
	onNewRun: () => void;
};

export const GameOverView = ({ view, won, onNewRun }: GameOverViewProps) => {
	const stoppedAt = swatchForGate(view.gatesCleared);
	const misses = missesOf(view.allAnswered);

	return (
		<GameOverScreen
			theme={view.gateTheme}
			earned={{
				swatches: earnedSwatches(view),
				title: won
					? "The climb is done"
					: `Stopped at ${stoppedAt?.gateName ?? `gate ${view.gatesCleared}`}`,
				subtitle: `${plural(view.gatesCleared, "gate")} of ${view.victoryGate} cleared · ${Math.round(view.coverage * 10) / 10}% coverage · ${kbLabel(view.storage)} left`,
			}}
			fell={{
				swatches: fellSwatches(view),
				note: won
					? "every swatch earned"
					: `${view.victoryGate - view.gatesCleared} still out there`,
			}}
			lostBy={{
				meta: plural(misses.length, "missed poll"),
				rows: misses.slice(0, 5).map((poll) => ({
					name: poll.question,
					detail: poll.picked.join(", "),
					tag: poll.outcome,
				})),
			}}
			finalBuild={{
				meta: plural(view.configs.length, "config"),
				rows: view.configs.map((config) => ({
					name: config.label,
					detail: config.description,
				})),
				note: `${view.slotsUsed} of ${plural(view.slots, "slot")} filled`,
			}}
			shareLabel="Copy result"
			newRunLabel="Play again →"
			onNewRun={onNewRun}
		/>
	);
};
