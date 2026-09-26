import type { ReactNode } from "react";

import { LOCKED_CONFIG } from "~/shared/lib/copy";
import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { CHIP, EDGE, NAME, SKIPPED_CHIP, SKIPPED_NAME } from "./ConfigChip.ui";
import { Figures } from "./Figures.ui";
import { Meter } from "./Meter.ui";
import { Panel } from "./Panel.ui";
import { Redaction } from "./Redaction.ui";
import { Typography } from "./Typography.ui";
import { Version } from "./Version.ui";
import { Weight } from "./Weight.ui";

const COPY = {
	about: "About",
	howToUnlock: "how to unlock",
	unlockLead: "unlock",
	alternativeLead: "or",
	starterTag: "starter",
	earnedTag: "earned",
} as const;

const WRAP = "group/info relative inline-flex";
const FIT_WIDTH = "w-fit max-w-full";
const LOCKED_EDGE = "border-dashed border-theme-faint";
const IDENTITY = "flex min-w-0 items-center gap-1.5";
const NAME_LIMIT = "truncate";
const TRAILING = "flex shrink-0 items-center gap-1.5";

const PANEL =
	"fixed inset-x-4 bottom-4 z-30 transition-opacity sm:absolute sm:inset-x-auto sm:bottom-full sm:left-0 sm:mb-2";
const PANEL_SHUT =
	"pointer-events-none invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 group-has-[:focus-visible]/info:visible group-has-[:focus-visible]/info:opacity-100";
const PANEL_OPEN = "pointer-events-auto visible opacity-100";

const HINT = "w-80";
const LINES = "flex flex-col gap-1.5";
const EFFECT =
	"flex flex-wrap items-center gap-1.5 text-sm font-bold text-theme-faint";
const PATH = "flex flex-wrap items-center gap-1.5 text-xs text-theme-muted";
const ALTERNATIVE = "flex items-center gap-2 text-xs text-theme-muted";
const ALTERNATIVE_BAR = "min-w-0 flex-1";
const COUNT = "shrink-0 tabular-nums";
const READER_ONLY = "sr-only";

const INFO_GLYPH = "i";
const SEPARATOR = "·";
const GAIN: KantoColor = "viridian";
const FIRST_VERSION = 1;

export type UnlockProgress = { count: number; target: number };

export type DexUnlockPath = {
	text: string;
	progress: UnlockProgress | null;
};

type Granted = {
	state: "granted";
	name: string;
	effect: string;
	starter: boolean;
	provenance: string;
	figure?: string;
	maxVersion?: number;
};

type Met = { state: "met"; name: string; paths: readonly DexUnlockPath[] };

type Locked = { state: "locked"; paths: readonly DexUnlockPath[] };

export type DexConfigChipProps = {
	id: string;
	slots: number;
	infoOpen?: boolean;
	onToggleInfo?: () => void;
} & (Granted | Met | Locked);

export const unlockLabelOf = (path: DexUnlockPath): string =>
	`${COPY.unlockLead} ${SEPARATOR} ${path.text}`;

export const alternativeLabelOf = (path: DexUnlockPath): string =>
	`${COPY.alternativeLead} ${SEPARATOR} ${path.text}`;

export const progressLabelOf = ({ count, target }: UnlockProgress): string =>
	`${count}/${target}`;

export const provenanceTagOf = (starter: boolean): string =>
	starter ? COPY.starterTag : COPY.earnedTag;

export const leadLineOf = ({
	starter,
	maxVersion,
}: Pick<Granted, "starter" | "maxVersion">): string =>
	maxVersion === undefined
		? provenanceTagOf(starter)
		: `${provenanceTagOf(starter)} ${SEPARATOR} v${FIRST_VERSION} of ${maxVersion}`;

export const infoLabelOf = (props: DexConfigChipProps): string => {
	if (props.state === "granted") return `${COPY.about} ${props.name}`;
	if (props.state === "met") return `${COPY.howToUnlock} ${props.name}`;
	return `${LOCKED_CONFIG} ${SEPARATOR} ${COPY.howToUnlock}`;
};

const edgeOf = (state: DexConfigChipProps["state"]) =>
	state === "locked" ? LOCKED_EDGE : EDGE;

const Hint = ({ children }: { children: ReactNode }) => (
	<Panel className={HINT}>
		<Panel.Body>
			<div className={LINES}>{children}</div>
		</Panel.Body>
	</Panel>
);

const GrantedHint = ({ chip }: { chip: Granted }) => (
	<Hint>
		<Typography variant="hint" as="span">
			{leadLineOf(chip)}
		</Typography>
		<p className={EFFECT}>
			<Figures text={chip.effect} />
		</p>
		{chip.starter ? null : (
			<Typography variant="hint" as="span">
				<Figures text={chip.provenance} />
			</Typography>
		)}
	</Hint>
);

const Alternative = ({ path }: { path: DexUnlockPath }) => {
	if (path.progress === null)
		return (
			<span className={PATH}>
				<Figures text={alternativeLabelOf(path)} />
			</span>
		);

	return (
		<span className={ALTERNATIVE}>
			<span className={READER_ONLY}>{alternativeLabelOf(path)}</span>
			<span aria-hidden>{COPY.alternativeLead}</span>
			<span className={ALTERNATIVE_BAR}>
				<Meter value={path.progress.count} max={path.progress.target} />
			</span>
			<span className={COUNT}>{progressLabelOf(path.progress)}</span>
		</span>
	);
};

const UnlockHint = ({ paths }: { paths: readonly DexUnlockPath[] }) => {
	const [required, ...alternatives] = paths;

	return (
		<Hint>
			<span className={PATH}>
				<Figures text={unlockLabelOf(required)} />
				{required.progress === null ? null : (
					<Badge>{progressLabelOf(required.progress)}</Badge>
				)}
			</span>
			{alternatives.map((path) => (
				<Alternative key={path.text} path={path} />
			))}
		</Hint>
	);
};

const Identity = (props: DexConfigChipProps) => {
	if (props.state === "locked") {
		return (
			<span className={NAME}>
				<Redaction />
			</span>
		);
	}
	if (props.state === "met") {
		return <span className={clsx(SKIPPED_NAME, NAME_LIMIT)}>{props.name}</span>;
	}

	return (
		<>
			<span className={clsx(NAME, NAME_LIMIT)}>{props.name}</span>
			{props.maxVersion === undefined ? null : (
				<Version version={props.maxVersion} />
			)}
		</>
	);
};

const Effect = (props: DexConfigChipProps) => {
	if (props.state === "locked") return null;
	if (props.state === "met") return <Redaction />;
	if (props.figure === undefined) return null;

	return <Badge color={GAIN}>{props.figure}</Badge>;
};

export const DexConfigChip = (props: DexConfigChipProps) => {
	const { slots, infoOpen = false, onToggleInfo } = props;

	return (
		<span className={WRAP}>
			<span
				className={clsx(
					CHIP,
					edgeOf(props.state),
					FIT_WIDTH,
					props.state === "met" && SKIPPED_CHIP
				)}
			>
				<Weight slots={slots} />
				<span className={IDENTITY}>
					<Identity {...props} />
				</span>
				<span className={TRAILING}>
					<Effect {...props} />
					<Button
						tone="ambient"
						glyph={INFO_GLYPH}
						label={infoLabelOf(props)}
						expanded={infoOpen}
						onPress={onToggleInfo}
					/>
				</span>
			</span>
			<span
				aria-hidden={!infoOpen}
				className={clsx(PANEL, infoOpen ? PANEL_OPEN : PANEL_SHUT)}
			>
				{props.state === "granted" ? (
					<GrantedHint chip={props} />
				) : (
					<UnlockHint paths={props.paths} />
				)}
			</span>
		</span>
	);
};
