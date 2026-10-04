import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Button, type ButtonTone } from "./Button.ui";
import { Climber } from "./Climber.ui";
import { Contribution, type ContributionProps } from "./Contribution.ui";
import { Icon } from "./Icon.ui";
import { Link } from "./Link.ui";
import type { KantoColor } from "./colors";
import type { SwatchFill } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import {
	COPY as STANDING_COPY,
	Standing,
	type StandingProps,
	type StandingStat,
} from "./Standing.ui";
import { Typography } from "./Typography.ui";
import { WornTitles } from "./WornTitles.ui";

export const COPY = {
	...STANDING_COPY,
	close: "Close",
	rescued: "Saved by git tag",
	noOpenRun: "no open run",
	profileOf: (name: string) => `${name}'s profile`,
} as const;

const CLOSE_ICON = "size-4 stroke-[1.5]";

const CARD =
	"flex max-h-[70vh] w-full flex-col overflow-y-auto rounded-2xl border border-theme-faint bg-theme-raised";

const HEAD =
	"flex w-full items-center gap-4 border-b border-theme-faint bg-linear-to-br from-theme/20 via-theme/5 to-transparent px-4 py-4";
const BODY = "flex w-full flex-col gap-3 px-4 py-3";
const PRESS_ROW =
	"flex items-center justify-between gap-2 border-t border-theme-faint pt-3";
const PRESS_NOTE = "flex items-center gap-2 text-xs font-bold text-theme-muted";
const FACING = "flex shrink-0 flex-col items-center gap-1";
const RESCUE = "w-16 text-center text-xxs leading-tight text-theme-muted";
const NAMING = "flex min-w-0 flex-1 flex-col items-start gap-1.5";
const NAME = "max-w-full truncate text-lg font-extrabold text-theme-soft";
const TRAILING = "ml-auto flex shrink-0 self-start";

const QUIET_TITLE: KantoColor = "pewter";

export type ClimberCardStat = StandingStat;

export type ClimberCardStanding = StandingProps;

export type ClimberCardLooter = {
	name: string;
	photoUrl?: string;
	borderUrl?: string;
};

export type ClimberCardLoot = {
	label: string;
	onPress?: () => void;
	pending?: boolean;
	looter?: ClimberCardLooter;
};

export type ClimberCardFile = Omit<ClimberCardLoot, "looter"> & {
	refusal?: string;
};

export type ClimberCardProps = {
	name: string;
	profileHref?: string;
	titles?: readonly string[];
	contribution?: ContributionProps;
	swatches?: readonly SwatchFill[];
	theme: SwatchTheme;
	photoUrl?: string;
	borderUrl?: string;
	you?: boolean;
	rival?: boolean;
	perfect?: boolean;
	shaky?: boolean;
	rescued?: boolean;
	standing?: ClimberCardStanding;
	loot?: ClimberCardLoot;
	file?: ClimberCardFile;
	onClose?: () => void;
};

type CardPressProps = ClimberCardFile & {
	tone: ButtonTone;
	looter?: ClimberCardLooter;
};

const CardPress = ({
	label,
	onPress,
	pending = false,
	refusal,
	tone,
	looter,
}: CardPressProps) => (
	<div className={PRESS_ROW}>
		{onPress === undefined ? (
			<span className={PRESS_NOTE}>
				{looter === undefined ? null : <Climber {...looter} size="sm" />}
				{refusal ?? label}
			</span>
		) : (
			<Button
				tone={tone}
				size="sm"
				label={label}
				disabled={pending}
				onPress={onPress}
			/>
		)}
	</div>
);

type FaceProps = Pick<
	ClimberCardProps,
	| "profileHref"
	| "name"
	| "photoUrl"
	| "borderUrl"
	| "you"
	| "rival"
	| "perfect"
	| "shaky"
	| "rescued"
>;

const Face = ({ profileHref, ...climber }: FaceProps) => {
	const face = <Climber {...climber} size="lg" />;

	return (
		<span className={FACING}>
			{profileHref === undefined ? (
				face
			) : (
				<a href={profileHref} aria-label={COPY.profileOf(climber.name)}>
					{face}
				</a>
			)}
			{climber.rescued === true ? (
				<span className={RESCUE}>{COPY.rescued}</span>
			) : null}
		</span>
	);
};

const Naming = ({
	profileHref,
	name,
	titles,
	contribution,
	swatches,
}: Pick<
	ClimberCardProps,
	"profileHref" | "name" | "contribution" | "swatches"
> & {
	titles: readonly string[];
}) => (
	<span className={NAMING}>
		<span className={NAME}>
			{profileHref === undefined ? (
				name
			) : (
				<Link href={profileHref}>{name}</Link>
			)}
		</span>
		{titles.length === 0 ? null : (
			<WornTitles titles={titles} rest={QUIET_TITLE} />
		)}
		{contribution === undefined ? null : <Contribution {...contribution} />}
		{swatches === undefined ? null : (
			<SwatchTrack swatches={swatches} size="small" />
		)}
	</span>
);

const Body = ({ standing }: Pick<ClimberCardProps, "standing">) =>
	standing === undefined ? (
		<Typography variant="hint" as="span">
			{COPY.noOpenRun}
		</Typography>
	) : (
		<Standing {...standing} />
	);

export const ClimberCard = ({
	name,
	profileHref,
	titles = [],
	contribution,
	swatches,
	theme,
	photoUrl,
	borderUrl,
	you = false,
	rival = false,
	perfect = false,
	shaky = false,
	rescued = false,
	standing,
	loot,
	file,
	onClose,
}: ClimberCardProps) => (
	<div className={CARD}>
		<div data-gate-theme={theme} className={HEAD}>
			<Face
				profileHref={profileHref}
				name={name}
				photoUrl={photoUrl}
				borderUrl={borderUrl}
				you={you}
				rival={rival}
				perfect={perfect}
				shaky={shaky}
				rescued={rescued}
			/>
			<Naming
				profileHref={profileHref}
				name={name}
				titles={titles}
				contribution={contribution}
				swatches={swatches}
			/>
			{onClose === undefined ? null : (
				<span className={TRAILING}>
					<Button
						tone="ambient"
						glyph={<Icon name="close" className={CLOSE_ICON} />}
						label={`${COPY.close} ${name}`}
						onPress={onClose}
					/>
				</span>
			)}
		</div>

		<div className={BODY}>
			<Body standing={standing} />
			{file === undefined ? null : <CardPress {...file} tone="danger" />}
			{loot === undefined ? null : <CardPress {...loot} tone="action" />}
		</div>
	</div>
);
