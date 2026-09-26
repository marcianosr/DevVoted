import { Badge } from "./Badge.ui";
import { Climber } from "./Climber.ui";
import { Link } from "./Link.ui";
import { Typography } from "./Typography.ui";

const LINE = "flex w-full min-w-0 flex-wrap items-center gap-2";
const NAME = "flex min-w-0 items-center gap-2";
const TRAILING = "ml-auto shrink-0";

const COPY = {
	leader: "leader",
	unranked: "unranked",
};

const GITHUB = "https://github.com";
const FIGURE_TONE = "pewter";
const YOUR_FIGURE_TONE = "viridian";

export type CategorySeatLeader = {
	handle: string;
	figure: string;
	githubLogin?: string;
	photoUrl?: string;
	borderUrl?: string;
	you?: boolean;
};

export type CategoryLeaderProps = {
	category: string;
	leader?: CategorySeatLeader;
	claim?: string;
};

const LeaderName = ({ handle, githubLogin }: CategorySeatLeader) => (
	<Typography variant="hint" as="span">
		{githubLogin === undefined ? (
			handle
		) : (
			<Link href={`${GITHUB}/${githubLogin}`} external>
				{handle}
			</Link>
		)}
	</Typography>
);

const Held = (leader: CategorySeatLeader) => (
	<>
		<Typography variant="hint" as="span">
			{COPY.leader}
		</Typography>
		<span className={NAME}>
			<Climber
				name={leader.handle}
				photoUrl={leader.photoUrl}
				borderUrl={leader.borderUrl}
				you={leader.you}
			/>
			<LeaderName {...leader} />
		</span>
		<span className={TRAILING}>
			<Badge color={leader.you === true ? YOUR_FIGURE_TONE : FIGURE_TONE}>
				{leader.figure}
			</Badge>
		</span>
	</>
);

const Open = ({ claim }: Pick<CategoryLeaderProps, "claim">) => (
	<>
		<Typography variant="hint" as="span">
			{COPY.unranked}
		</Typography>
		{claim === undefined ? null : (
			<span className={TRAILING}>
				<Typography variant="hint" as="span">
					{claim}
				</Typography>
			</span>
		)}
	</>
);

export const CategoryLeader = ({
	category,
	leader,
	claim,
}: CategoryLeaderProps) => (
	<div className={LINE}>
		<Badge>{category}</Badge>
		{leader === undefined ? <Open claim={claim} /> : <Held {...leader} />}
	</div>
);
