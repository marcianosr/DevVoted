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
// The figure is a count, and `Figures` only badges signed values, prices and
// scales — a bare count would come out unbadged beside a badged category.
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
	/** What it takes to claim an open seat. Ignored while somebody holds it. */
	claim?: string;
};

/**
 * The same chrome the poll's byline gives its author: a handle is a handle
 * wherever it appears, and this line sits directly under that one on the poll
 * screen, where two weights for one kind of name read as two kinds of name.
 */
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

/**
 * One category and whoever leads it: the longest unbroken run of correct
 * answers anyone has strung together in it.
 *
 * One line on two surfaces — under the poll byline for the category being
 * played, and once per category on the community board — so the figure a
 * player meets mid-run is drawn by the same component as the one they compare
 * against on the board.
 *
 * It carries no padding or rule of its own: the poll screen gives it a region
 * so the rule reaches the panel's edges, and the board hands it a `Panel.Row`.
 */
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
