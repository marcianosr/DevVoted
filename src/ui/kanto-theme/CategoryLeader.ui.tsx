import { profilePathFor } from "~/shared/lib/profilePath";

import { Badge } from "./Badge.ui";
import { Climber } from "./Climber.ui";
import { Link } from "./Link.ui";
import { Typography } from "./Typography.ui";

const LINE = "grid w-full min-w-0 grid-cols-[1fr_auto] items-center gap-2";
const FACTS = "flex min-w-0 flex-wrap items-center gap-2";
const TRAILING = "flex min-w-0 shrink-0 items-center gap-2";

const COPY = {
	unranked: "unranked",
};

const FIGURE_TONE = "pewter";
const YOUR_FIGURE_TONE = "viridian";

export type CategorySeatLeader = {
	userId: string;
	handle: string;
	figure: string;
	photoUrl?: string;
	borderUrl?: string;
	you?: boolean;
};

export type CategoryLeaderProps = {
	category: string;
	leader?: CategorySeatLeader;
	claim?: string;
};

const LeaderName = ({ userId, handle }: CategorySeatLeader) => (
	<Typography variant="hint" as="span">
		<Link href={profilePathFor(userId)}>{handle}</Link>
	</Typography>
);

const Face = (leader: CategorySeatLeader) => (
	<Climber
		userId={leader.userId}
		name={leader.handle}
		photoUrl={leader.photoUrl}
		borderUrl={leader.borderUrl}
		you={leader.you}
	/>
);

const Open = () => (
	<Typography variant="hint" as="span">
		{COPY.unranked}
	</Typography>
);

const Figure = ({ leader, claim }: Omit<CategoryLeaderProps, "category">) => {
	if (leader !== undefined)
		return (
			<Badge color={leader.you === true ? YOUR_FIGURE_TONE : FIGURE_TONE}>
				{leader.figure}
			</Badge>
		);

	if (claim === undefined) return null;

	return (
		<Typography variant="hint" as="span">
			{claim}
		</Typography>
	);
};

export const CategoryLeader = ({
	category,
	leader,
	claim,
}: CategoryLeaderProps) => (
	<div className={LINE}>
		<span className={FACTS}>
			<Badge>{category}</Badge>
			{leader === undefined ? <Open /> : null}
		</span>
		<span className={TRAILING}>
			{leader === undefined ? null : (
				<>
					<Face {...leader} />
					<LeaderName {...leader} />
				</>
			)}
			<Figure leader={leader} claim={claim} />
		</span>
	</div>
);
