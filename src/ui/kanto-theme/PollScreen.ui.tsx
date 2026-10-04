import { type RefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { clsx } from "clsx";

import { AUDITS } from "~/shared/lib/copy";
import { Accuracy } from "./Accuracy.ui";
import type { AccuracyTrackProps } from "./AccuracyTrack.ui";
import { Action } from "./Action.ui";
import { Audit, auditsFiringOf, type AuditProps } from "./Audit.ui";
import { Author, type AuthorProps, type AuthorSize } from "./Author.ui";
import { Badge } from "./Badge.ui";
import { BuildFooter, type BuildFooterProps } from "./BuildFooter.ui";
import { useBarHeight } from "./useBarHeight.hook";
import type { KantoColor } from "./colors";
import { CoverageBar, CoverageReading } from "./CoverageBar.ui";
import type { CoverageBarProps } from "./CoverageBar.ui";
import { CategoryLeader, type CategoryLeaderProps } from "./CategoryLeader.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Lead, type LeadLine } from "./Lead.ui";
import { Panel } from "./Panel.ui";
import { PollFacts, type PollFactsProps } from "./PollFacts.ui";
import { Question, questionFactsOf, type QuestionProps } from "./Question.ui";
import { Redaction, type Redactable } from "./Redaction.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { Swatch, type SwatchMark } from "./Swatch.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	coverage: "Coverage",
	wrongCost: "wrong costs",
	readingDown: "Coverage reading unavailable",
	readingDownHint: "The meter is down. Answers still score.",
} as const;

const AUDITS_ROW = "flex w-full flex-wrap items-stretch gap-3";
const META_ROW = "flex flex-wrap items-center gap-2";
const POLL_ROW =
	"grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]";
const DARK_TRACK =
	"flex h-6 w-full items-center justify-center rounded-md bg-theme-raised";
const DARK_READOUT = "flex w-full flex-col gap-1.5";

const PAID = "border-t border-theme-faint";
const SHAKE = "answer-shake";
const CARD = "relative poll-card-enter";
const LEAVING = "poll-card-leave";
const REVEALED = "poll-card-revealed";
const COMBO =
	"poll-combo pointer-events-none absolute top-3 right-4 z-10 text-sm font-extrabold text-theme";
const COMBO_COLOR: KantoColor = "vermillion";
const FLIGHT =
	"pointer-events-none fixed top-0 left-0 z-50 text-sm font-bold opacity-0";

const POP_MS = 120;
const HOLD_MS = 500;
const FLY_MS = 420;
const FLY_EASING = "cubic-bezier(.4,.1,.2,1)";
const RIDE_MS = 550;
const RIDE_EASING = "cubic-bezier(0.3, 0.7, 0.2, 1)";
const FADE_MS = 200;
const POP_SCALE = 0.6;
const CHIP_GAP = 12;
const FLIGHT_COLOR: KantoColor = "viridian";
const FLIGHT_ORIGIN = '[data-answer="right"][data-picked="true"]';
const FLIGHT_FALLBACK = '[data-answer="right"]';
const FLIGHT_TRACK = '[role="img"]';
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const FULL = 100;
const LEADER_REGION = "border-t border-theme-faint px-4 py-3";

const POLL_FLOOR = "94vh";
const META_REGION =
	"flex w-full flex-wrap items-center gap-2 border-b border-theme-faint px-4 py-3 first:rounded-t-2xl";
const META_TRAILING = "flex flex-wrap items-center gap-2 sm:ml-auto";
const KEYS_HINT = "hidden pointer-fine:inline";
const COMMIT_REGION =
	"sticky bottom-0 z-10 flex w-full flex-col gap-3 px-4 py-3 last:rounded-b-2xl";
const COMMIT_GROUND = "border-t border-theme-faint bg-theme-faint";

const WRONG_COST_COLOR: KantoColor = "cinnabar";
const CREDIT_SIZE: AuthorSize = "sm";

export type PollReadout = {
	bar: CoverageBarProps;
	lead?: LeadLine;
	accuracy?: AccuracyTrackProps;
};

export type PollFlight = {
	figure: string;
	id: string;
	fromHeld: number;
	toHeld: number;
};

export type PollCoverage = Redactable<PollReadout>;

export type PollLock = {
	label: string;
	note?: string;
	onPress?: () => void;
};

export type PollCommit = {
	lock?: PollLock;
};

export type PollClockBadge = { label: string; color: KantoColor };

export type PollScreenProps = {
	header: HeaderProps;
	coverage: PollCoverage;
	buildFooter: BuildFooterProps;
	question: QuestionProps;
	category: string;
	categoryColor?: KantoColor;
	wrongCost?: string;
	holds?: string;
	clock?: PollClockBadge;

	facts?: Omit<PollFactsProps, "trailing">;
	audits?: readonly AuditProps[];
	hint?: string;
	author?: AuthorProps;
	commit?: PollCommit;
	keysHint?: string;
	step?: number;
	categoryLeader?: CategoryLeaderProps;
	footer?: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
	shake?: string;
	combo?: string;
	pollKey?: string;
	leaving?: boolean;
	revealed?: boolean;
	flight?: PollFlight;
	onFlightLanded?: () => void;
};

type PollCreditProps = Pick<PollScreenProps, "hint" | "author">;

const CreditTrailing = ({ hint }: PollCreditProps) =>
	hint === undefined ? null : <Badge>{hint}</Badge>;

const PollCredit = ({ hint, author }: PollCreditProps) => {
	if (hint === undefined && author === undefined) return null;

	return (
		<Panel.Footer trailing={<CreditTrailing hint={hint} />}>
			{author === undefined ? null : (
				<Author {...author} size={CREDIT_SIZE} rule={false} />
			)}
		</Panel.Footer>
	);
};

const DarkReading = () => (
	<Panel.Body>
		<div className={DARK_READOUT}>
			<div className={DARK_TRACK}>
				<Redaction label={COPY.readingDown} />
			</div>
			<Typography variant="hint">{COPY.readingDownHint}</Typography>
		</div>
	</Panel.Body>
);

type GaugeRef = { gauge: RefObject<HTMLDivElement | null> };

const LiveReading = ({
	bar,
	lead,
	accuracy,
	gauge,
}: PollReadout & GaugeRef) => (
	<>
		<Panel.Body>
			<div ref={gauge}>
				<CoverageBar {...bar} />
			</div>
			{lead === undefined ? null : <Lead line={lead} variant="caption" />}
		</Panel.Body>
		{accuracy === undefined ? null : (
			<Panel.Body className={PAID}>
				<Accuracy track={accuracy} />
			</Panel.Body>
		)}
	</>
);

const CoveragePanel = ({
	coverage,
	gauge,
}: { coverage: PollCoverage } & GaugeRef) => (
	<Panel>
		<Panel.Header
			label={COPY.coverage}
			meta={
				coverage.locked === true ? undefined : (
					<CoverageReading {...coverage.bar} />
				)
			}
		/>
		{coverage.locked === true ? (
			<DarkReading />
		) : (
			<LiveReading {...coverage} gauge={gauge} />
		)}
	</Panel>
);

const prefersReducedMotion = () =>
	typeof window.matchMedia === "function" &&
	window.matchMedia(REDUCED_MOTION).matches;

type Point = { x: number; y: number };

const POP_TIMING = {
	duration: POP_MS + HOLD_MS + FLY_MS,
	fill: "forwards",
} as const;
const RIDE_TIMING = { duration: RIDE_MS + FADE_MS } as const;

const ANSWER_TEXT_INDEX = 1;

const answerTextOf = (row: Element | null | undefined) =>
	row?.children.item(ANSWER_TEXT_INDEX) ?? row;

const originIn = (card: HTMLElement | null) =>
	answerTextOf(
		card?.querySelector(FLIGHT_ORIGIN) ?? card?.querySelector(FLIGHT_FALLBACK)
	)?.getBoundingClientRect();

const trackIn = (gauge: HTMLElement | null) =>
	(gauge?.querySelector(FLIGHT_TRACK) ?? gauge)?.getBoundingClientRect();

const besideOf = (text: DOMRect): Point => ({
	x: text.right + CHIP_GAP,
	y: text.top + text.height / 2,
});

const fillEdgeOf = (track: DOMRect, held: number): Point => ({
	x: track.left + (track.width * Math.min(FULL, Math.max(0, held))) / FULL,
	y: track.top + track.height / 2,
});

const chipAt = ({ x, y }: Point, anchor: "start" | "centre", scale = 1) =>
	`translate(${x}px, ${y}px) translate(${anchor === "start" ? 0 : -50}%, -50%) scale(${scale})`;

const popPathOf = (beside: Point, from: Point) => [
	{ offset: 0, transform: chipAt(beside, "start", POP_SCALE), opacity: 0 },
	{
		offset: POP_MS / POP_TIMING.duration,
		transform: chipAt(beside, "start"),
		opacity: 1,
	},
	{
		offset: (POP_MS + HOLD_MS) / POP_TIMING.duration,
		transform: chipAt(beside, "start"),
		opacity: 1,
		easing: FLY_EASING,
	},
	{ offset: 1, transform: chipAt(from, "centre"), opacity: 1 },
];

const ridePathOf = (from: Point, to: Point) => [
	{
		offset: 0,
		transform: chipAt(from, "centre"),
		opacity: 1,
		easing: RIDE_EASING,
	},
	{
		offset: RIDE_MS / RIDE_TIMING.duration,
		transform: chipAt(to, "centre"),
		opacity: 1,
	},
	{ offset: 1, transform: chipAt(to, "centre"), opacity: 0 },
];

type GainFlightProps = {
	flight: PollFlight;
	card: RefObject<HTMLDivElement | null>;
	gauge: RefObject<HTMLDivElement | null>;
	onLanded?: () => void;
};

const GainFlight = ({ flight, card, gauge, onLanded }: GainFlightProps) => {
	const chip = useRef<HTMLSpanElement>(null);
	const landed = useRef(onLanded);
	const [settledId, setSettledId] = useState<string>();

	useEffect(() => {
		landed.current = onLanded;
	}, [onLanded]);

	useEffect(() => {
		const settle = () => setSettledId(flight.id);
		const text = originIn(card.current);
		const track = trackIn(gauge.current);
		const node = chip.current;

		if (
			text === undefined ||
			track === undefined ||
			node === null ||
			typeof node.animate !== "function" ||
			prefersReducedMotion()
		) {
			settle();
			landed.current?.();
			return;
		}

		const from = fillEdgeOf(track, flight.fromHeld);
		const to = fillEdgeOf(track, flight.toHeld);
		let running = node.animate(popPathOf(besideOf(text), from), POP_TIMING);
		running.onfinish = () => {
			landed.current?.();
			running = node.animate(ridePathOf(from, to), RIDE_TIMING);
			running.onfinish = settle;
		};

		return () => {
			running.onfinish = null;
			running.cancel();
		};
	}, [flight.id, flight.fromHeld, flight.toHeld, card, gauge]);

	if (settledId === flight.id) return null;

	return createPortal(
		<span ref={chip} aria-hidden className={FLIGHT}>
			<Badge color={FLIGHT_COLOR}>{flight.figure}</Badge>
		</span>,
		document.body
	);
};

const PollSend = ({ commit, footer, measure }: PollSendProps) => {
	if (footer === undefined && commit === undefined) return null;

	return (
		<div
			ref={measure}
			className={clsx(COMMIT_REGION, footer !== undefined && COMMIT_GROUND)}
		>
			{footer === undefined ? null : <ScreenFooter {...footer} rule={false} />}
			{commit?.lock === undefined ? null : <Action {...commit.lock} />}
		</div>
	);
};

type PollSendProps = Pick<PollScreenProps, "commit" | "footer"> & {
	measure: (bar: HTMLElement | null) => void;
};

type PollPanelProps = Pick<
	PollScreenProps,
	| "question"
	| "category"
	| "categoryColor"
	| "wrongCost"
	| "holds"
	| "clock"
	| "facts"
	| "hint"
	| "author"
	| "keysHint"
	| "categoryLeader"
> &
	PollSendProps & { swatch: SwatchMark };

const PollPanel = ({
	question,
	category,
	categoryColor,
	wrongCost,
	holds,
	clock,
	facts,
	hint,
	author,
	keysHint,
	categoryLeader,
	commit,
	footer,
	swatch,
	measure,
}: PollPanelProps) => (
	<Panel>
		<div className={META_REGION}>
			<Swatch {...swatch} />
			<Badge color={categoryColor}>{category}</Badge>
			<Typography variant="hint" as="span">
				{questionFactsOf(question)}
			</Typography>
			{holds === undefined &&
			wrongCost === undefined &&
			clock === undefined &&
			keysHint === undefined ? null : (
				<span className={META_TRAILING}>
					{keysHint === undefined ? null : (
						<span className={KEYS_HINT}>
							<Typography variant="hint" as="span">
								{keysHint}
							</Typography>
						</span>
					)}
					{clock === undefined ? null : (
						<Badge color={clock.color}>{clock.label}</Badge>
					)}
					{holds === undefined ? null : <Badge>{holds}</Badge>}
					{wrongCost === undefined ? null : (
						<span className={META_ROW}>
							<Typography variant="hint" as="span">
								{COPY.wrongCost}
							</Typography>
							<Badge color={WRONG_COST_COLOR}>{wrongCost}</Badge>
						</span>
					)}
				</span>
			)}
		</div>
		{facts === undefined ? null : <PollFacts {...facts} />}
		<Panel.Body className={facts === undefined ? undefined : PAID}>
			<Question {...question} />
		</Panel.Body>
		<PollSend commit={commit} footer={footer} measure={measure} />
		<PollCredit hint={hint} author={author} />
		{categoryLeader === undefined ? null : (
			<div className={LEADER_REGION}>
				<CategoryLeader {...categoryLeader} />
			</div>
		)}
	</Panel>
);

export const PollScreen = ({
	header,
	coverage,
	buildFooter,
	audits = [],
	step,
	width = "wide",
	ground = "bare",
	shake,
	combo,
	pollKey,
	leaving = false,
	revealed = false,
	flight,
	onFlightLanded,
	...poll
}: PollScreenProps) => {
	const [measureSend, sendHeight] = useBarHeight();
	const card = useRef<HTMLDivElement>(null);
	const gauge = useRef<HTMLDivElement>(null);

	return (
		<Screen
			gate={header.swatch.theme}
			width={width}
			ground={ground}
			floor={POLL_FLOOR}
		>
			<Header {...header} />

			{audits.length === 0 ? null : (
				<Panel>
					<Panel.Header label={AUDITS} meta={auditsFiringOf(audits.length)} />
					<Panel.Body>
						<div className={AUDITS_ROW}>
							{audits.map((audit, index) => (
								<Audit key={audit.code ?? index} {...audit} />
							))}
						</div>
					</Panel.Body>
				</Panel>
			)}

			<div className={POLL_ROW}>
				<div
					key={pollKey}
					ref={card}
					className={clsx(
						CARD,
						shake !== undefined && SHAKE,
						revealed && REVEALED,
						leaving && LEAVING
					)}
				>
					<PollPanel
						{...poll}
						swatch={{ state: "current", swatch: header.swatch, count: step }}
						measure={measureSend}
					/>
					{combo === undefined ? null : (
						<span
							role="status"
							data-screen-theme={COMBO_COLOR}
							className={COMBO}
						>
							{combo}
						</span>
					)}
				</div>
				<CoveragePanel coverage={coverage} gauge={gauge} />
			</div>

			{flight === undefined ? null : (
				<GainFlight
					key={flight.id}
					flight={flight}
					card={card}
					gauge={gauge}
					onLanded={onFlightLanded}
				/>
			)}

			<BuildFooter {...buildFooter} seat={sendHeight} />
		</Screen>
	);
};
