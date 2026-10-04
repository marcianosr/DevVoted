import {
	type CSSProperties,
	type FocusEvent,
	type MouseEvent,
	type ReactNode,
	useId,
} from "react";

import { clsx } from "clsx";

import {
	PLAYER_CARD_TOOLTIP_ID,
	type PlayerAnchor,
	usePlayerHover,
} from "~/shared/hooks/usePlayerHover.hook";
import { profilePathFor } from "~/shared/lib/profilePath";

export type ClimberSize = "sm" | "md" | "lg" | "xl";

const CHIP = "relative inline-block shrink-0";
const SIZE = {
	sm: "size-7",
	md: "size-9",
	lg: "size-16",
	xl: "size-24",
} satisfies Record<ClimberSize, string>;

const FACE =
	"absolute inset-0 flex items-center justify-center overflow-hidden rounded-md border border-b-4 border-edge-strong bg-theme-raised font-bold text-theme-soft";
const FACE_TEXT = {
	sm: "text-[10px]",
	md: "text-xs",
	lg: "text-xl",
	xl: "text-3xl",
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
const MORE =
	"ml-1.5 cursor-pointer rounded-md px-1.5 py-0.5 text-xs text-theme-muted tabular-nums ring-1 ring-inset ring-theme-faint hover:text-theme-soft focus-visible:outline-2 focus-visible:outline-theme";
const MORE_PANEL =
	"popover-anchored rounded-xl border border-theme-faint bg-theme-raised p-3 text-xs text-theme-muted shadow-lg";
const MORE_FACES = "flex max-h-64 max-w-xs flex-wrap gap-1 overflow-y-auto";
const MORE_REST = "mt-2 block";

const FACE_LINK =
	"inline-flex shrink-0 rounded-md focus:outline-none focus-visible:ring-2";

export const COPY = {
	profileOf: (name: string) => `${name}'s profile`,
	showMore: (count: number) => `show ${count.toLocaleString()} more players`,
	andMore: (count: number) => `and ${count.toLocaleString()} more`,
} as const;

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
	userId?: string;
	onPress?: () => void;
};

const anchorOf = (element: Element): PlayerAnchor => {
	const { top, bottom, left, right } = element.getBoundingClientRect();
	return { top, bottom, left, right };
};

export type PlayerFaceLinkProps = {
	userId: string;
	name: string;
	className?: string;
	children: ReactNode;
};

export const PlayerFaceLink = ({
	userId,
	name,
	className = FACE_LINK,
	children,
}: PlayerFaceLinkProps) => {
	const { show, hide } = usePlayerHover();
	const reveal = (event: MouseEvent<Element> | FocusEvent<Element>) =>
		show(userId, anchorOf(event.currentTarget));

	return (
		<a
			href={profilePathFor(userId)}
			aria-label={COPY.profileOf(name)}
			aria-describedby={PLAYER_CARD_TOOLTIP_ID}
			className={className}
			onMouseEnter={reveal}
			onFocus={reveal}
			onMouseLeave={hide}
			onBlur={hide}
		>
			{children}
		</a>
	);
};

const titleOf = (name: string, you: boolean): string => (you ? YOU_NAME : name);

type FaceProps = Omit<ClimberProps, "userId"> & { titled: boolean };

const Face = ({
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
	titled,
}: FaceProps) => (
	<span
		title={titled ? titleOf(name, you) : undefined}
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

const PressableFace = ({
	onPress,
	...face
}: Omit<ClimberProps, "userId"> & { onPress: () => void }) => (
	<button
		type="button"
		aria-label={face.name}
		className={FACE_LINK}
		onClick={onPress}
	>
		<Face {...face} titled />
	</button>
);

export const Climber = ({ userId, onPress, ...face }: ClimberProps) => {
	if (onPress !== undefined)
		return <PressableFace {...face} onPress={onPress} />;

	return userId === undefined ? (
		<Face {...face} titled />
	) : (
		<PlayerFaceLink userId={userId} name={face.name}>
			<Face {...face} titled={false} />
		</PlayerFaceLink>
	);
};

export type ClimberStackProps = {
	climbers: readonly ClimberProps[];
	overflow?: number;
	shown?: number;
	size?: ClimberSize;
};

const popoverAnchorOf = (id: string) => `--more-${id.replaceAll(":", "")}`;

const MorePlayers = ({
	hidden,
	overflow,
	size,
}: {
	hidden: readonly ClimberProps[];
	overflow: number;
	size: ClimberSize;
}) => {
	const id = useId();
	const anchor = popoverAnchorOf(id);
	const count = hidden.length + overflow;
	const trigger: CSSProperties = { anchorName: anchor };
	const panel: CSSProperties = { positionAnchor: anchor };

	return (
		<>
			<button
				type="button"
				popoverTarget={id}
				aria-label={COPY.showMore(count)}
				style={trigger}
				className={MORE}
			>
				{`+${count.toLocaleString()}`}
			</button>
			<div id={id} popover="auto" style={panel} className={MORE_PANEL}>
				<span className={MORE_FACES}>
					{hidden.map((climber) => (
						<Climber
							key={climber.userId ?? climber.name}
							{...climber}
							size={size}
						/>
					))}
				</span>
				{overflow === 0 ? null : (
					<span className={MORE_REST}>{COPY.andMore(overflow)}</span>
				)}
			</div>
		</>
	);
};

export const ClimberStack = ({
	climbers,
	overflow = 0,
	shown = climbers.length,
	size = "sm",
}: ClimberStackProps) => {
	const hidden = climbers.slice(shown);

	return (
		<span className={STACK}>
			{climbers.slice(0, shown).map((climber) => (
				<Climber
					key={climber.userId ?? climber.name}
					{...climber}
					size={size}
				/>
			))}
			{hidden.length === 0 ? null : (
				<MorePlayers hidden={hidden} overflow={overflow} size={size} />
			)}
			{hidden.length === 0 && overflow > 0 ? (
				<span className={OVERFLOW}>{`+${overflow.toLocaleString()}`}</span>
			) : null}
		</span>
	);
};
