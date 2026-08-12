import { Avatar } from "~/domains/users/components/Avatar.component";
import type { CommunityVoter } from "~/modules/run/community/application/community.service";
import { Tooltip } from "~/ui/Tooltip.component";

/**
 * A player, as the community page draws them everywhere: the shared Avatar in a
 * ring, cerulean when it is you and zinc otherwise so overlapping chips stay
 * separate. Shared by the option rows and the standouts panel, which is why it
 * sits in its own file rather than in either of them.
 */
export const VoterAvatar = ({
	voter,
	focusable = false,
}: {
	voter: CommunityVoter;
	/** Lets a mobile tap reveal the tooltip. */
	focusable?: boolean;
}) => (
	<span
		tabIndex={focusable ? 0 : undefined}
		className={`inline-flex cursor-default rounded-full ring-2 ${voter.you ? "ring-cerulean" : "ring-zinc-950"}`}
	>
		<Avatar
			user={{
				id: voter.id,
				displayName: voter.displayName,
				photoUrl: voter.photoUrl,
			}}
			size="sm"
			noTitle
		/>
	</span>
);

/** The name lives in the chip's tooltip: hover on desktop, tap on mobile. */
export const VoterChip = ({ voter }: { voter: CommunityVoter }) => (
	<Tooltip compact content={voter.you ? "you" : voter.displayName}>
		<VoterAvatar voter={voter} focusable />
	</Tooltip>
);
