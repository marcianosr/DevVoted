import type { AuditId } from "~/modules/run/gate/domain/audit.model";

import { Audit } from "./Audit.ui";
import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { Climber } from "./Climber.ui";
import type { KantoColor } from "./colors";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Figures } from "./Figures.ui";
import { Panel, type PanelBadge } from "./Panel.ui";
import { Swatch, type SwatchFill } from "./Swatch.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	inspect: "inspect",
	close: "close",
	send: "send",
	hits: "hits",
	nothingInstalled: "nothing installed",
} as const;

const RIVAL = "flex w-full min-w-0 flex-col gap-2";
const HEAD = "flex w-full flex-wrap items-center gap-2";
const NAME = "text-sm font-bold text-theme-soft";
const TITLE = "text-xs text-theme-muted";
const GATE = "text-xs text-theme-muted";
const FIGURE = "ml-auto text-xs text-theme-muted tabular-nums";
const BUILD = "flex flex-wrap items-center gap-1.5";
const PAYLOADS = "flex w-full flex-col gap-2 pt-1";
const PAYLOAD = "flex w-full items-center gap-3";
const PAYLOAD_BODY = "min-w-0 flex-1";

const PRESS_TONE = "action";
const PRESS_SIZE = "sm";
const HITS_COLOR: KantoColor = "cinnabar";

export type AttackPayload = {
	auditId: AuditId;
	code: number;
	name: string;
	/** What it does where it lands, as the roster states it. */
	effect: string;
	/** The whole press: "Fire 404 at Misty". */
	label: string;
	/** The rival config this payload names, where the build alone names one. */
	hits?: string;
	onPress?: () => void;
};

export type AttackRival = {
	targetRunId: number;
	/** Who they are, so an audit they sent you can find their row again. */
	userId: string;
	name: string;
	/** Their GitHub photo, so a rival wears the same face as every other chip. */
	photoUrl?: string;
	/** The border they equipped, drawn over the photo. */
	borderUrl?: string;
	/** The title they wear, earned through play (ADR-109). */
	title?: string;
	/** Where the audit lands, as the row states it: "gate 7 · Marsh". */
	gate: string;
	/** That gate's colour, so the row carries the same mark the screen does. */
	swatch: SwatchFill;
	/** What their build costs to run — the one figure ADR-101 makes public. */
	weight: string;
	/** What they run, readable before you fire (ADR-101). */
	build: readonly ConfigChipProps[];
	/** Config names a payload would take out, lit once the row is open. */
	hits: readonly string[];
	payloads: readonly AttackPayload[];
};

export type AttackPanelProps = {
	title: string;
	/** What the armed band earns: "1 payload" or "choose 1 of 2 payloads". */
	meta?: string;
	/** The gate that opens the panel, while it is still shut. */
	badge?: PanelBadge;
	rivals: readonly AttackRival[];
	/** Why there is nothing to press: shut, unarmed, no rival in range, dealing. */
	empty?: string;
	/** A refusal or a result, under the rows. */
	note?: string;
	/** Whose payloads are open. Tier 1 holds no state of its own. */
	openRunId?: number;
	onInspect?: (targetRunId: number) => void;
};

const RivalBuild = ({
	build,
	hits,
}: {
	build: readonly ConfigChipProps[];
	hits: readonly string[];
}) => {
	if (build.length === 0)
		return <span className={GATE}>{COPY.nothingInstalled}</span>;

	return (
		<span className={BUILD}>
			{build.map((config, index) =>
				config.locked === true ? (
					<ConfigChip key={index} locked />
				) : (
					<ConfigChip
						key={config.name}
						{...config}
						width="fit"
						highlighted={hits.includes(config.name)}
					/>
				)
			)}
		</span>
	);
};

const Payload = ({
	code,
	name,
	effect,
	label,
	hits,
	onPress,
}: AttackPayload) => (
	<span className={PAYLOAD}>
		<span className={PAYLOAD_BODY}>
			<Audit code={code} name={name} cue={effect} layout="full" />
		</span>
		{hits === undefined ? null : (
			<Badge color={HITS_COLOR}>{`${COPY.hits} ${hits}`}</Badge>
		)}
		<Button
			label={COPY.send}
			hint={label}
			tone={PRESS_TONE}
			size={PRESS_SIZE}
			onPress={onPress}
		/>
	</span>
);

const Rival = ({
	rival,
	open,
	onInspect,
}: {
	rival: AttackRival;
	open: boolean;
	onInspect?: (targetRunId: number) => void;
}) => (
	<Panel.Row>
		<span className={RIVAL}>
			<span className={HEAD}>
				<Climber
					name={rival.name}
					photoUrl={rival.photoUrl}
					borderUrl={rival.borderUrl}
					size="sm"
				/>
				<span className={NAME}>{rival.name}</span>
				{rival.title === undefined ? null : (
					<span className={TITLE}>{rival.title}</span>
				)}
				<Swatch {...rival.swatch} size="small" />
				<span className={GATE}>{rival.gate}</span>
				<span className={FIGURE}>{rival.weight}</span>
				<Button
					label={open ? COPY.close : COPY.inspect}
					hint={`${open ? COPY.close : COPY.inspect} ${rival.name}`}
					size={PRESS_SIZE}
					expanded={open}
					onPress={
						onInspect === undefined
							? undefined
							: () => onInspect(rival.targetRunId)
					}
				/>
			</span>

			<RivalBuild build={rival.build} hits={open ? rival.hits : []} />

			{open ? (
				<span className={PAYLOADS}>
					{rival.payloads.map((payload) => (
						<Payload key={payload.auditId} {...payload} />
					))}
				</span>
			) : null}
		</span>
	</Panel.Row>
);

/**
 * The one moment a player acts against another: the rivals an armed attack may
 * be aimed at, each read as a person with a build. Opening a rival is what
 * shows the payload and the config it would take out, so the build above it is
 * read for a reason rather than decorating the row. Its empty states teach how
 * an audit is earned and when the exchange opens, so the panel is always drawn
 * and never withheld.
 */
export const AttackPanel = ({
	title,
	meta,
	badge,
	rivals,
	empty,
	note,
	openRunId,
	onInspect,
}: AttackPanelProps) => (
	<Panel>
		<Panel.Header
			label={title}
			badge={badge}
			meta={meta === undefined ? undefined : <Badge>{meta}</Badge>}
		/>

		{rivals.length === 0 ? (
			<Panel.Body>
				<Typography variant="hint">
					<Figures text={empty ?? ""} />
				</Typography>
			</Panel.Body>
		) : (
			<Panel.Rows>
				{rivals.map((rival) => (
					<Rival
						key={rival.targetRunId}
						rival={rival}
						open={rival.targetRunId === openRunId}
						onInspect={onInspect}
					/>
				))}
			</Panel.Rows>
		)}

		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">
					<Figures text={note} />
				</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
