import { Button, type ButtonTone } from "./Button.ui";
import { Climber } from "./Climber.ui";
import { Link } from "./Link.ui";
import {
	COPY as STANDING_COPY,
	GateTag,
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

const CLOSE_GLYPH = "×";

export const CARD_PANEL =
	"fixed inset-x-4 bottom-4 z-30 sm:absolute sm:inset-x-auto sm:top-full sm:left-1/2 sm:mt-2 sm:w-112 sm:-translate-x-1/2";

const CARD =
	"flex max-h-[70vh] w-full flex-col overflow-y-auto rounded-2xl border border-theme-faint bg-theme-raised";

const HEAD =
	"flex w-full items-center gap-3 border-b border-theme-faint px-4 py-3";
const BODY = "flex w-full flex-col gap-3 px-4 py-3";
const PRESS_ROW =
	"flex items-center justify-between gap-2 border-t border-theme-faint pt-3";
const PRESS_NOTE = "text-xs font-bold text-theme-muted";
const FACING = "flex shrink-0 flex-col items-center gap-1";
const RESCUE = "w-16 text-center text-xxs leading-tight text-theme-muted";
const NAMING = "flex min-w-0 flex-col items-start gap-1.5";
const NAME = "truncate text-base font-bold text-theme-soft";
const TRAILING = "ml-auto flex shrink-0 items-start gap-3";

export type ClimberCardStat = StandingStat;

export type ClimberCardStanding = StandingProps;

export type ClimberCardLoot = {
	label: string;
	onPress?: () => void;
	pending?: boolean;
};

export type ClimberCardFile = ClimberCardLoot & { refusal?: string };

export type ClimberCardProps = {
	name: string;
	profileHref?: string;
	title?: string;
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

type CardPressProps = ClimberCardFile & { tone: ButtonTone };

const CardPress = ({
	label,
	onPress,
	pending = false,
	refusal,
	tone,
}: CardPressProps) => (
	<div className={PRESS_ROW}>
		{onPress === undefined ? (
			<span className={PRESS_NOTE}>{refusal ?? label}</span>
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
	title,
}: Pick<ClimberCardProps, "profileHref" | "name" | "title">) => (
	<span className={NAMING}>
		<span className={NAME}>
			{profileHref === undefined ? (
				name
			) : (
				<Link href={profileHref}>{name}</Link>
			)}
		</span>
		{title === undefined ? null : <WornTitles titles={[title]} />}
	</span>
);

const Body = ({ standing }: Pick<ClimberCardProps, "standing">) =>
	standing === undefined ? (
		<Typography variant="hint" as="span">
			{COPY.noOpenRun}
		</Typography>
	) : (
		<Standing {...standing} namesGate={false} />
	);

export const ClimberCard = ({
	name,
	profileHref,
	title,
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
		<div className={HEAD}>
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
			<Naming profileHref={profileHref} name={name} title={title} />
			<span className={TRAILING}>
				{standing === undefined ? null : <GateTag {...standing.gate} />}
				{onClose === undefined ? null : (
					<Button
						tone="ambient"
						glyph={CLOSE_GLYPH}
						label={`${COPY.close} ${name}`}
						onPress={onClose}
					/>
				)}
			</span>
		</div>

		<div className={BODY}>
			<Body standing={standing} />
			{file === undefined ? null : <CardPress {...file} tone="danger" />}
			{loot === undefined ? null : <CardPress {...loot} tone="action" />}
		</div>
	</div>
);
