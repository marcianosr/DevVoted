import { type CSSProperties, type RefObject, useEffect, useRef } from "react";

import type { OutcomeRevealKind } from "~/modules/run/gate/domain/outcomeReveal.model";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Balance } from "./Balance.ui";
import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
	CoverageBar,
	type CoverageBarProps,
} from "./CoverageBar.ui";
import { Swatch } from "./Swatch.ui";
import { Typography } from "./Typography.ui";
import {
	type Beat,
	prefersReducedMotion,
	useRevealBeats,
} from "./useRevealBeats.hook";

const COPY = {
	skip: "Skip",
	continue: "Continue",
} as const;

const OVERLAY =
	"outcome-overlay fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden px-4";
const CARD =
	"outcome-card relative flex w-full max-w-xl flex-col gap-4 rounded-3xl border border-theme-faint bg-theme-faint p-5 sm:p-6";
const TITLE_ROW = "flex min-h-9 items-center gap-3";
const STAMP_SEAT = "relative h-14";
const STAMP =
	"outcome-stamp absolute top-1 left-0 rounded-xl border-[3px] border-theme px-4 py-1 text-2xl font-extrabold tracking-widest text-theme";
const FIGURES = "flex min-h-8 flex-wrap items-center gap-2";
const BALANCE_SEAT = "ml-auto";
const CATCHER =
	"outcome-catcher absolute top-40 left-5 flex flex-col rounded-xl border-2 border-theme bg-theme-raised px-4 py-2";
const NEXT =
	"outcome-rise flex items-center gap-3 rounded-2xl border border-theme-faint bg-theme-raised px-4 py-3";
const FLIP = "outcome-flip absolute -top-5 right-5";
const FLASH = "outcome-flash pointer-events-none absolute inset-0 bg-cinnabar";
const TERMINAL =
	"outcome-terminal absolute inset-0 flex items-center justify-center font-mono text-sm text-theme-muted";
const TERMINAL_LINES = "flex flex-col items-start gap-2";
const TERMINAL_LEAD = "font-bold text-theme";
const SKIP = "absolute right-4 bottom-4";
const PARTICLE =
	"pointer-events-none absolute top-0 left-0 size-2 rounded-[1px]";

const FINAL_HOLD_MS = 1800;
const CATCHER_COLOR = "saffron";
const BURST_PARTICLES = 34;
const SHATTER_PARTICLES = 40;

type Step =
	| "title"
	| "bar"
	| "sweep"
	| "stamp"
	| "gate"
	| "burst"
	| "swatch"
	| "balance"
	| "note"
	| "next"
	| "glitch"
	| "catcher"
	| "fall"
	| "hit"
	| "shatter"
	| "flash"
	| "crt"
	| "terminal"
	| "archived";

const BEATS = {
	cleared: [
		["title", 0],
		["bar", 200],
		["stamp", 800],
		["gate", 1100],
		["balance", 1400],
		["note", 1400],
		["next", 1900],
	],
	perfect: [
		["title", 0],
		["bar", 200],
		["sweep", 800],
		["stamp", 1100],
		["burst", 1350],
		["gate", 1350],
		["swatch", 1600],
		["balance", 2300],
		["next", 2700],
	],
	shaky: [
		["title", 0],
		["bar", 200],
		["stamp", 1000],
		["glitch", 1300],
		["gate", 1500],
		["balance", 1800],
		["note", 1800],
	],
	caught: [
		["bar", 200],
		["catcher", 600],
		["fall", 900],
		["hit", 1350],
		["shatter", 1750],
		["title", 2000],
		["stamp", 2000],
		["gate", 2300],
		["note", 2500],
	],
	ended: [
		["title", 0],
		["bar", 200],
		["flash", 700],
		["fall", 700],
		["crt", 1200],
		["terminal", 1950],
		["archived", 4000],
	],
} satisfies Record<OutcomeRevealKind, readonly Beat<Step>[]>;

const BURST_COLORS = [
	"var(--theme-color)",
	"var(--color-cerulean)",
	"var(--color-pallet)",
	"var(--color-saffron)",
] as const;

const SHATTER_COLORS = [
	"var(--color-saffron)",
	"oklch(from var(--color-saffron) 0.5 c h)",
	"var(--color-pallet)",
] as const;

export type OutcomeRevealBalance = {
	label: string;
	fromKb: number;
	toKb: number;
};

export type OutcomeRevealNext = {
	swatch: GateSwatch;
	label: string;
	detail?: string;
};

export type OutcomeRevealCatcher = {
	name: string;
	detail: string;
};

export type OutcomeRevealData = {
	kind: OutcomeRevealKind;
	swatch: GateSwatch;
	title: string;
	stamp: CoverageBandId;
	bar: CoverageBarProps;
	balance: OutcomeRevealBalance;
	note?: string;
	next?: OutcomeRevealNext;
	catcher?: OutcomeRevealCatcher;
	archive?: readonly string[];
};

export type OutcomeRevealProps = OutcomeRevealData & {
	onDone: () => void;
};

type TypedStyle = CSSProperties & Record<"--outcome-chars", number>;

const typedStyle = (text: string): TypedStyle => ({
	"--outcome-chars": Math.max(1, text.length),
});

type LineStyle = CSSProperties &
	Record<"--outcome-chars" | "--outcome-line", number>;

const lineStyle = (text: string, line: number): LineStyle => ({
	"--outcome-chars": Math.max(1, text.length),
	"--outcome-line": line,
});

type Burst = {
	colors: readonly string[];
	count: number;
	falls: boolean;
};

const particleTravel = (falls: boolean) => {
	const angle = Math.random() * Math.PI * 2;
	const reach = 60 + Math.random() * 120;

	return {
		dx: Math.cos(angle) * reach,
		dy: falls ? 40 + Math.random() * 120 : Math.sin(angle) * reach - 40,
	};
};

const burstFrom = (
	origin: HTMLElement,
	host: HTMLElement,
	{ colors, count, falls }: Burst
) => {
	const from = origin.getBoundingClientRect();
	const room = host.getBoundingClientRect();

	Array.from({ length: count }, (_, index) => {
		const particle = document.createElement("span");
		if (typeof particle.animate !== "function") return;

		particle.className = PARTICLE;
		particle.style.background = colors[index % colors.length];
		host.appendChild(particle);

		const x =
			from.left - room.left + from.width * (falls ? Math.random() : 0.5);
		const y = from.top - room.top + from.height * (falls ? Math.random() : 0.5);
		const { dx, dy } = particleTravel(falls);

		particle.animate(
			[
				{ transform: `translate(${x}px, ${y}px) rotate(0)`, opacity: 1 },
				{
					transform: `translate(${x + dx}px, ${y + dy}px) rotate(${Math.random() * 360}deg)`,
					opacity: 0,
				},
			],
			{
				duration: 700 + Math.random() * 500,
				easing: "cubic-bezier(0.2, 0.6, 0.4, 1)",
			}
		).onfinish = () => particle.remove();
	});
};

const useBurst = (
	fires: boolean,
	origin: RefObject<HTMLElement | null>,
	host: RefObject<HTMLElement | null>,
	burst: Burst
) => {
	const fired = useRef(false);

	useEffect(() => {
		if (!fires || fired.current || prefersReducedMotion()) return;
		if (origin.current === null || host.current === null) return;

		fired.current = true;
		burstFrom(origin.current, host.current, burst);
	}, [fires, origin, host, burst]);
};

const PERFECT_BURST: Burst = {
	colors: BURST_COLORS,
	count: BURST_PARTICLES,
	falls: false,
};

const CATCH_SHATTER: Burst = {
	colors: SHATTER_COLORS,
	count: SHATTER_PARTICLES,
	falls: true,
};

const useEscapeTo = (advance: () => void) => {
	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") advance();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [advance]);
};

const stopBubbling = (event: { stopPropagation: () => void }) =>
	event.stopPropagation();

const gateStateOf = (
	kind: OutcomeRevealKind,
	filled: boolean
): "discovered" | "current" =>
	filled && (kind === "cleared" || kind === "perfect")
		? "discovered"
		: "current";

const Title = ({ text, typed }: { text: string; typed: boolean }) => (
	<Typography variant="headline" as="span">
		<span
			className={typed ? "outcome-type" : undefined}
			style={typedStyle(text)}
		>
			{text}
		</span>
	</Typography>
);

const Terminal = ({ lines }: { lines: readonly string[] }) => (
	<div className={TERMINAL}>
		<div className={TERMINAL_LINES}>
			{lines.map((line, index) => (
				<span
					key={line}
					className={
						index === 0 ? `outcome-line ${TERMINAL_LEAD}` : "outcome-line"
					}
					style={lineStyle(line, index)}
				>
					{line}
				</span>
			))}
		</div>
	</div>
);

export const OutcomeReveal = ({
	kind,
	swatch,
	title,
	stamp,
	bar,
	balance,
	note,
	next,
	catcher,
	archive,
	onDone,
}: OutcomeRevealProps) => {
	const { reached, finished, advance } = useRevealBeats<Step>(
		BEATS[kind],
		FINAL_HOLD_MS,
		onDone
	);
	const host = useRef<HTMLDivElement>(null);
	const stampMark = useRef<HTMLSpanElement>(null);
	const catcherCard = useRef<HTMLDivElement>(null);

	useEscapeTo(advance);
	useBurst(reached("burst"), stampMark, host, PERFECT_BURST);
	useBurst(reached("shatter"), catcherCard, host, CATCH_SHATTER);

	const theme =
		next !== undefined && reached("next") ? next.swatch.theme : swatch.theme;

	return (
		<div
			ref={host}
			role="dialog"
			aria-modal
			aria-label={title}
			data-gate-theme={theme}
			data-reveal={kind}
			className={OVERLAY}
			onClick={advance}
		>
			<div className={CARD} data-crt={reached("crt")}>
				<div className={TITLE_ROW}>
					<span
						className={
							reached("gate")
								? `outcome-gate-${gateStateOf(kind, true)}`
								: undefined
						}
					>
						<Swatch
							size="large"
							state={gateStateOf(kind, reached("gate"))}
							swatch={swatch}
							marked={kind === "perfect" && reached("gate")}
						/>
					</span>
					{reached("title") ? (
						<span className={reached("glitch") ? "outcome-glitch" : undefined}>
							<Title text={title} typed={kind !== "shaky"} />
						</span>
					) : null}
					<span className={BALANCE_SEAT}>
						<Balance
							label={balance.label}
							kb={reached("balance") ? balance.toKb : balance.fromKb}
							layout="inline"
						/>
					</span>
				</div>

				<div className={STAMP_SEAT}>
					{reached("stamp") ? (
						<span
							ref={stampMark}
							data-screen-theme={COVERAGE_BAND_COLOR[stamp]}
							data-stamp={kind}
							className={STAMP}
						>
							{COVERAGE_BAND_WORD[stamp]}
						</span>
					) : null}
				</div>

				<div
					className="outcome-bar"
					data-sweep={reached("sweep")}
					data-fall={reached("fall")}
				>
					{reached("bar") ? <CoverageBar {...bar} /> : null}
				</div>

				<div className={FIGURES}>
					{note !== undefined && reached("note") ? (
						<span className="outcome-rise">
							<Typography variant="hint">{note}</Typography>
						</span>
					) : null}
					{catcher !== undefined && reached("note") ? (
						<span className="outcome-rise">
							<Badge color={CATCHER_COLOR}>{catcher.name}</Badge>
						</span>
					) : null}
				</div>

				{catcher !== undefined && reached("catcher") ? (
					<div
						ref={catcherCard}
						data-screen-theme={CATCHER_COLOR}
						data-hit={reached("hit")}
						data-gone={reached("shatter")}
						className={CATCHER}
					>
						<Typography variant="accent">{catcher.name}</Typography>
						<Typography variant="hint">{catcher.detail}</Typography>
					</div>
				) : null}

				{reached("swatch") ? (
					<span className={FLIP}>
						<Swatch size="hero" state="discovered" swatch={swatch} marked />
					</span>
				) : null}

				{next !== undefined && reached("next") ? (
					<div className={NEXT} data-gate-theme={next.swatch.theme}>
						<span className="outcome-gate-discovered">
							<Swatch size="small" state="current" swatch={next.swatch} />
						</span>
						<Typography variant="subtitle" as="span">
							{next.label}
						</Typography>
						{next.detail === undefined ? null : (
							<Typography variant="hint" as="span">
								{next.detail}
							</Typography>
						)}
					</div>
				) : null}
			</div>

			{reached("flash") ? <span className={FLASH} /> : null}

			{archive !== undefined && reached("terminal") ? (
				<Terminal lines={archive} />
			) : null}

			<span className={SKIP} onClick={stopBubbling}>
				<Button
					label={finished ? COPY.continue : COPY.skip}
					tone="ambient"
					size="sm"
					onPress={advance}
				/>
			</span>
		</div>
	);
};
