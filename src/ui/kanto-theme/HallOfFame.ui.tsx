import { Badge } from "./Badge.ui";
import { Climber } from "./Climber.ui";
import { Link } from "./Link.ui";
import { Typography } from "./Typography.ui";

const REGION = "flex flex-col gap-2 border-t border-theme-faint px-4 py-3";
const CAPTION = "flex flex-wrap items-baseline gap-2";
const ROW = "flex min-w-0 flex-wrap items-center gap-2";
const NAME = "flex min-w-0 items-center gap-2 pr-1";
const TRAILING = "ml-auto shrink-0";

const TITLE = "Record holder of";
const UNCLAIMED = "— unclaimed —";
const GITHUB = "https://github.com";
// The record is a count, and `Figures` only badges signed values, prices and
// scales — a bare count would come out unbadged beside a badged title.
const FIGURE_TONE = "pewter";

export type HallOfFameHolder = {
	handle: string;
	title: string;
	figure: string;
	githubLogin?: string;
	photoUrl?: string;
	borderUrl?: string;
	you?: boolean;
};

export type HallOfFameProps = {
	caption: string;
	holder?: HallOfFameHolder;
	yourBest?: string;
};

const HolderName = ({ handle, githubLogin }: HallOfFameHolder) => {
	if (githubLogin === undefined) {
		return (
			<Typography variant="accent" as="span">
				{handle}
			</Typography>
		);
	}

	return (
		<Link href={`${GITHUB}/${githubLogin}`} external>
			{handle}
		</Link>
	);
};

const Holder = (holder: HallOfFameHolder) => (
	<>
		<span className={NAME}>
			<Climber
				name={holder.handle}
				photoUrl={holder.photoUrl}
				borderUrl={holder.borderUrl}
				you={holder.you}
			/>
			<HolderName {...holder} />
		</span>
		<Badge>{holder.title}</Badge>
		<Badge color={FIGURE_TONE}>{holder.figure}</Badge>
	</>
);

/**
 * A category's living record, stated under the poll that belongs to it: the
 * longest unbroken run of correct answers anyone has strung together, who holds
 * it, and how far this account has ever got.
 *
 * Its own region rather than a second line inside the credit footer, because
 * `Panel` pads each region and not its surface — that is what lets the rule
 * above this block reach the panel's edges instead of stopping at the padding.
 */
export const HallOfFame = ({ caption, holder, yourBest }: HallOfFameProps) => (
	<div className={REGION}>
		<p className={CAPTION}>
			<Typography variant="label" as="span">
				{TITLE}
			</Typography>
			<Typography variant="hint" as="span">
				{caption}
			</Typography>
		</p>
		<div className={ROW}>
			{holder === undefined ? (
				<Typography variant="hint" as="span">
					{UNCLAIMED}
				</Typography>
			) : (
				<Holder {...holder} />
			)}
			{yourBest === undefined ? null : (
				<span className={TRAILING}>
					<Typography variant="hint" as="span">
						{yourBest}
					</Typography>
				</span>
			)}
		</div>
	</div>
);
