import { clsx } from "clsx";

export type ClimberSize = "sm" | "md";

const CHIP = "relative inline-block shrink-0";
const SIZE = {
	sm: "size-7",
	md: "size-9",
} satisfies Record<ClimberSize, string>;

const FACE =
	"absolute inset-0 flex items-center justify-center overflow-hidden rounded-md border border-b-4 border-edge-strong bg-theme-raised font-bold text-theme-soft";
const FACE_TEXT = {
	sm: "text-[10px]",
	md: "text-xs",
} satisfies Record<ClimberSize, string>;

const PHOTO = "size-full object-cover";
const FRAME = "pointer-events-none absolute inset-0 size-full";
const DIMMED = "opacity-40 grayscale";

const YOU = "ring-2 ring-viridian";
const RIVAL = "ring-2 ring-vermillion";

const PERFECT = "ring-2 ring-offset-1 ring-theme ring-offset-transparent";
const SHAKY = "climber-flicker";

const TAG =
	"absolute -top-1 -right-1 z-10 rounded-xs bg-saffron px-1 text-[8px] leading-tight font-bold text-indigo";
const TAG_WORD = "tag";

const STACK = "flex items-center -space-x-1.5";
const OVERFLOW = "pl-3 text-xs text-theme-muted tabular-nums";

const YOU_NAME = "you";
const NO_NAME = "?";
const INITIALS = 2;

export const initialsOf = (name: string): string => {
	const words = name.replace(/^@/, "").trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return NO_NAME;
	if (words.length === 1) return words[0].slice(0, INITIALS).toUpperCase();
	return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export type ClimberProps = {
	name: string;
	photoUrl?: string;
	borderUrl?: string;
	you?: boolean;
	rival?: boolean;
	perfect?: boolean;
	shaky?: boolean;
	rescued?: boolean;
	dimmed?: boolean;
	size?: ClimberSize;
};

export const Climber = ({
	name,
	photoUrl,
	borderUrl,
	you = false,
	rival = false,
	perfect = false,
	shaky = false,
	rescued = false,
	dimmed = false,
	size = "sm",
}: ClimberProps) => (
	<span
		title={you ? YOU_NAME : name}
		className={clsx(CHIP, SIZE[size], dimmed && DIMMED, shaky && SHAKY)}
	>
		<span
			className={clsx(
				FACE,
				FACE_TEXT[size],
				you && YOU,
				!you && rival && RIVAL,
				perfect && PERFECT
			)}
		>
			{photoUrl === undefined ? (
				initialsOf(name)
			) : (
				<img src={photoUrl} alt="" className={PHOTO} />
			)}
		</span>
		{borderUrl === undefined ? null : (
			<img src={borderUrl} alt="" aria-hidden className={FRAME} />
		)}
		{rescued ? (
			<span aria-hidden className={TAG}>
				{TAG_WORD}
			</span>
		) : null}
	</span>
);

export type ClimberStackProps = {
	climbers: readonly ClimberProps[];
	overflow?: number;
	size?: ClimberSize;
};

export const ClimberStack = ({
	climbers,
	overflow = 0,
	size = "sm",
}: ClimberStackProps) => (
	<span className={STACK}>
		{climbers.map((climber) => (
			<Climber key={climber.name} {...climber} size={size} />
		))}
		{overflow === 0 ? null : (
			<span className={OVERFLOW}>{`+${overflow.toLocaleString()}`}</span>
		)}
	</span>
);
