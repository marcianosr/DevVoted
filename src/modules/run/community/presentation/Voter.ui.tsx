import { clsx } from "clsx";

import { Avatar } from "~/domains/users/components/Avatar.component";
import type { CommunityVoter } from "~/modules/run/community/application/community.service";
import { Tooltip } from "~/ui/Tooltip.component";

type RingedPlayer = {
	readonly id: string;
	readonly displayName: string;
	readonly photoUrl?: string | null;
	/** Rings you in cerulean, so you stay findable in a stack. */
	readonly you: boolean;
};

/**
 * A player, as the community page draws them everywhere: the shared Avatar in a
 * ring, cerulean when it is you and zinc otherwise so overlapping chips stay
 * separate. The poll rows, the standouts panel and the climb track all draw
 * them, which is why this sits in its own file rather than in any of them.
 */
export const AvatarRing = ({
	player,
	titled = false,
	focusable = false,
}: {
	player: RingedPlayer;
	/**
	 * Keeps the browser's own hover name. Off wherever a Tooltip supplies it,
	 * since the two together read as a doubled name.
	 */
	titled?: boolean;
	/** Lets a mobile tap reveal the tooltip. */
	focusable?: boolean;
}) => (
	<span
		tabIndex={focusable ? 0 : undefined}
		className={clsx(
			"inline-flex cursor-default rounded-full ring-2",
			player.you ? "ring-cerulean" : "ring-zinc-950"
		)}
	>
		<Avatar
			user={{
				id: player.id,
				displayName: player.displayName,
				photoUrl: player.photoUrl,
			}}
			size="sm"
			noTitle={!titled}
		/>
	</span>
);

export const VoterAvatar = ({
	voter,
	focusable = false,
}: {
	voter: CommunityVoter;
	focusable?: boolean;
}) => <AvatarRing player={voter} focusable={focusable} />;

/** The name lives in the chip's tooltip: hover on desktop, tap on mobile. */
export const VoterChip = ({ voter }: { voter: CommunityVoter }) => (
	<Tooltip compact content={voter.you ? "you" : voter.displayName}>
		<VoterAvatar voter={voter} focusable />
	</Tooltip>
);
