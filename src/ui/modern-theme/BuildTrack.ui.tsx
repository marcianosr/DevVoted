import { clsx } from "clsx";

import type { ConfigStatus } from "~/modules/run/config/domain/effect.model";

import type { ActionProps } from "./Action.ui";
import { Caret } from "./Caret.ui";
import { Dot, type DotTone } from "./Dot.ui";
import { figureLabel } from "./Figure.ui";
import type { BuildRow } from "./Build.ui";
import { occupancyOf } from "./slots";
import { skipCopy } from "./status";
import { Text } from "./Text.ui";
import { Tooltip } from "./Tooltip.ui";
import type { ModernTone } from "./tones";
import { capLabel, plural, signed, valueTone } from "./format";

const HEAD = "flex w-full items-baseline justify-between gap-4 pb-2";
const TOGGLE = `${HEAD} cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean lg:pointer-events-none`;
const NAMING = "flex items-baseline gap-2";
const CARET = "lg:hidden";

const TRACK =
	"flex w-full flex-col items-stretch gap-1 rounded-md border border-edge p-1.5 lg:flex-row";
const SHUT = "hidden lg:flex";
const COUNTS = "flex items-center gap-2";

const STUB = "flex min-w-full lg:min-w-0";
const FILL = "size-full";

const CELL =
	"relative flex h-10 min-w-0 items-center justify-between gap-2 overflow-hidden rounded border py-1.5 pl-2 pr-5 text-left lg:flex-col lg:items-stretch lg:justify-between lg:gap-0";
const CORNER = "absolute right-1.5 top-1.5";
const VACANT =
	"flex h-10 min-w-0 items-center justify-center overflow-hidden rounded border px-2";
const PRESSABLE =
	"cursor-pointer transition-colors hover:bg-theme-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean disabled:cursor-not-allowed disabled:opacity-40";

const LINE = "truncate";
const STRUCK = "line-through";

const SHAPE = {
	online: "border-celadon bg-celadon/5",
	unknown: "border-edge",
	skipped: "cursor-not-allowed border-edge opacity-40",
	offline: "border-cinnabar bg-cinnabar/10",
} as const satisfies Record<ConfigStatus["kind"], string>;

const DOT_TONE = {
	online: "saffron",
	unknown: "muted",
	skipped: "muted",
	offline: "cinnabar",
} as const satisfies Record<ConfigStatus["kind"], DotTone>;

const NAME_TONE = {
	online: "default",
	unknown: "default",
	skipped: "muted",
	offline: "cinnabar",
} as const satisfies Record<ConfigStatus["kind"], ModernTone>;

const FREE = "border-dashed border-zinc-700";
const UNBOUGHT = "border-edge bg-hatched";

const BUY_HINT = "Buy a slot in the shop for more room";
const TRACK_ID = "build-track";

const SEPARATOR = " · ";

type Standing = { readonly text: string; readonly tone: ModernTone };

const paidStanding = (row: BuildRow): Standing | null => {
	if (row.fired !== undefined)
		return { text: `paid ${signed(row.fired)}`, tone: valueTone(row.fired) };
	if (row.firedKb !== undefined)
		return {
			text: `paid ${signed(row.firedKb)} KB`,
			tone: valueTone(row.firedKb),
		};
	return null;
};

const standingOf = (row: BuildRow, settled: boolean): Standing => {
	if (row.status.kind === "offline")
		return { text: "offline", tone: "cinnabar" };
	if (row.status.kind === "skipped")
		return { text: skipCopy(row.status.why), tone: "muted" };
	if (settled) return paidStanding(row) ?? { text: "unused", tone: "muted" };
	if (row.action)
		return {
			text: [row.action.label, row.action.cost].filter(Boolean).join(" "),
			tone: row.action.disabled ? "muted" : "theme",
		};
	return {
		text: row.figure ? figureLabel(row.figure) : "online",
		tone: "celadon",
	};
};

const hintOf = (row: BuildRow, standing: Standing): string => {
	const said =
		row.status.kind === "offline"
			? ["offline", row.status.audit]
			: [standing.text];

	return [
		row.label,
		...said,
		row.action?.hint,
		row.remainingKb === undefined
			? undefined
			: `${capLabel(row.remainingKb)} left`,
		row.explainer,
	]
		.filter(Boolean)
		.join(SEPARATOR);
};

const pressLabel = (action: ActionProps): string =>
	[
		[action.label, action.on, action.cost].filter(Boolean).join(" "),
		action.hint,
	]
		.filter(Boolean)
		.join(", ");

export const offlineHeadline = (
	configs: readonly BuildRow[]
): string | null => {
	const audits = configs.flatMap((row) =>
		row.status.kind === "offline" ? [row.status.audit] : []
	);
	if (audits.length === 0) return null;
	return [`${audits.length} offline`, ...new Set(audits)].join(SEPARATOR);
};

type CellProps = {
	row: BuildRow;
	settled: boolean;
	width: number;
};

const Cell = ({ row, settled, width }: CellProps) => {
	const standing = standingOf(row, settled);
	const press = settled ? undefined : row.action;

	const body = (
		<>
			<span className={CORNER}>
				<Dot tone={DOT_TONE[row.status.kind]} />
			</span>
			<Text
				size="xxs"
				tone={NAME_TONE[row.status.kind]}
				className={clsx(LINE, row.status.kind === "offline" && STRUCK)}
			>
				{row.label}
			</Text>
			<Text size="xxs" tone={standing.tone} className={LINE}>
				{standing.text}
			</Text>
		</>
	);

	return (
		<li style={{ width: `${(row.slots / width) * 100}%` }} className={STUB}>
			<Tooltip hint={hintOf(row, standing)} className={FILL}>
				{press ? (
					<button
						type="button"
						disabled={press.disabled}
						aria-label={pressLabel(press)}
						onClick={press.onUse}
						className={clsx(CELL, FILL, SHAPE[row.status.kind], PRESSABLE)}
					>
						{body}
					</button>
				) : (
					<span className={clsx(CELL, FILL, SHAPE[row.status.kind])}>
						{body}
					</span>
				)}
			</Tooltip>
		</li>
	);
};

const Vacancy = ({ width }: { width: number }) => (
	<li style={{ width: `${(1 / width) * 100}%` }} className={STUB}>
		<span className={clsx(VACANT, FILL, FREE)}>
			<Text size="xxs" tone="muted">
				free
			</Text>
		</span>
	</li>
);

const Unreached = ({ width }: { width: number }) => (
	<li style={{ width: `${(1 / width) * 100}%` }} className={STUB}>
		<Tooltip hint={BUY_HINT} className={FILL} align="right">
			<span aria-hidden className={clsx(VACANT, FILL, UNBOUGHT)} />
			<span className="sr-only">{BUY_HINT}</span>
		</Tooltip>
	</li>
);

export type BuildTrackProps = {
	configs: readonly BuildRow[];
	slots: number;
	maxSlots?: number;
	settled?: boolean;
	/** Narrow screens only — a wide one draws the band whatever this says. */
	open?: boolean;
	onToggle?: () => void;
};

const Headline = ({ configs }: { configs: readonly BuildRow[] }) => {
	const headline = offlineHeadline(configs);
	if (headline === null) return null;
	return (
		<Text size="meta" tone="cinnabar">
			{headline}
		</Text>
	);
};

const runningCount = (configs: readonly BuildRow[]): number =>
	configs.filter((row) => row.status.kind === "online").length;

const tallyOf = (
	configs: readonly BuildRow[],
	used: number,
	slots: number,
	settled: boolean
): string => {
	const room = `${used} of ${plural(slots, "slot")}`;
	return settled ? room : `${room} · ${runningCount(configs)} running`;
};

type TallyProps = {
	configs: readonly BuildRow[];
	text: string;
	dotted: boolean;
};

const Tally = ({ configs, text, dotted }: TallyProps) => (
	<span className={COUNTS}>
		<Headline configs={configs} />
		<Text size="meta" tone="muted">
			{text}
		</Text>
		{dotted ? <Dot tone={DOT_TONE.online} /> : null}
	</span>
);

export const BuildTrack = ({
	configs,
	slots,
	maxSlots = slots,
	settled = false,
	open = true,
	onToggle,
}: BuildTrackProps) => {
	const { used, free, unbought } = occupancyOf(configs, slots, maxSlots);
	const width = used + free + (unbought > 0 ? 1 : 0) || 1;
	const tally = tallyOf(configs, used, slots, settled);

	const naming = (
		<span className={NAMING}>
			{onToggle ? (
				<span className={CARET}>
					<Caret />
				</span>
			) : null}
			<Text size="title">Build</Text>
		</span>
	);

	return (
		<section>
			{onToggle ? (
				<button
					type="button"
					className={clsx(TOGGLE, "group/fold")}
					aria-expanded={open}
					aria-controls={TRACK_ID}
					onClick={onToggle}
				>
					{naming}
					<Tally configs={configs} text={tally} dotted={!settled} />
				</button>
			) : (
				<div className={HEAD}>
					{naming}
					<Tally configs={configs} text={tally} dotted={!settled} />
				</div>
			)}
			<ul
				id={TRACK_ID}
				className={clsx(TRACK, !open && SHUT)}
				aria-label="Your build on this poll"
			>
				{configs.map((row) => (
					<Cell key={row.id} row={row} settled={settled} width={width} />
				))}
				{Array.from({ length: free }, (_, index) => (
					<Vacancy key={`free-${index}`} width={width} />
				))}
				{unbought > 0 ? <Unreached width={width} /> : null}
			</ul>
		</section>
	);
};
