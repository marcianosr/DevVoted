import type { ActiveRunPlayer } from "~/domains/polls/api/communityStats.queries";
import { AvatarPopover } from "~/domains/economy/components/AvatarPopover.component";
import type { GateDifficulty } from "~/domains/runs/models/pipeline.model";
import { Avatar } from "~/domains/users/components/Avatar.component";
import {
	GatePathmap,
	type GatePathmapPlayer,
	type GatePathmapSlotDifficulty,
} from "~/ui/polls/GatePathmap.ui";

type GatePathmapComponentProps = {
	players: ActiveRunPlayer[];
};

const toUiDifficulty = (d: GateDifficulty): GatePathmapSlotDifficulty => d;

const toUiPlayer = (player: ActiveRunPlayer): GatePathmapPlayer => ({
	id: player.id,
	displayName: player.displayName ?? player.id,
	currentGate: player.activeRunProgress.currentGate,
	pollsInWindow: player.activeRunProgress.pollsInWindow,
	windowSize: player.activeRunProgress.windowSize,
	slots: player.pipelineSlots.map((slot) => toUiDifficulty(slot.difficulty)),
	avatarNode: (
		<AvatarPopover
			user={player}
			pipelineSlots={player.pipelineSlots}
			activeRunProgress={player.activeRunProgress}
		>
			<Avatar user={player} size="sm" />
		</AvatarPopover>
	),
});

export const GatePathmapComponent = ({
	players,
}: GatePathmapComponentProps) => {
	if (players.length === 0) return null;
	return <GatePathmap players={players.map(toUiPlayer)} />;
};
