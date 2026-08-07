/**
 * THROWAWAY playable prototype for the session-run + configs loop (DVTD-88si).
 * Open at /proto-session-slice. Not production, not styled to spec — its only job
 * is to let us feel the climb: build → clear gate → reward → harder gate → strip → clutch.
 *
 * One board: you stack configs onto a single pipeline. The gate has a baseline correct
 * check; check-configs (Coverage/Cold Start/Speed/Mirrored) and Focus configs each add a
 * condition to the same window. Every check must pass. Harder conditions pay more.
 *
 * (Deliberately breaks the src/ui vs src/domains UI split — it's a slice, not a keeper.)
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useReducer, useRef, useState } from "react";

import {
	checkStatuses,
	createSession,
	disabledOptionIds,
	gateDemands,
	hasLinter,
	LINT_COST,
	rerollCost,
	SessionAction,
	sessionReducer,
	SessionState,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/domains/runs/prototype/sessionRun";
import {
	focusCoverageMultiplier,
	MAX_SLOTS_PER_PIPELINE,
	Rarity,
	rarityOf,
	rewardMultiplierFor,
	SLICE_TAGS,
	Tag,
} from "~/domains/runs/prototype/sessionSlice";
import { buildSlicePool } from "~/domains/runs/prototype/slicePolls";
import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";

export const Route = createFileRoute("/proto-session-slice")({
	component: RouteComponent,
});

const POOL_SIZE = VICTORY_GATE * SLICE_WINDOW + SLICE_WINDOW;
const HANDED_TAGS: Tag[] = [
	SLICE_TAGS.js,
	SLICE_TAGS.mirrored,
	SLICE_TAGS.speed,
	SLICE_TAGS.eslint,
	SLICE_TAGS.copilot,
	SLICE_TAGS.coverageGain,
];

/** Focus configs wear their category's Kanto color; everything else is a neutral slate. */
const CATEGORY_COLOR: Partial<Record<CategoryCode, string>> = {
	js: "#F4C430",
	ts: "#4A6FE3",
	css: "#B57EDC",
	react: "#9FE2BF",
	html: "#FF6240",
	git: "#D9381E",
	java: "#7FBFA8",
	python: "#3F9E6E",
	ruby: "#D357C8",
};

const NEUTRAL_FILL = "#403a5e";
const LIGHT_BG = new Set(["#F4C430", "#9FE2BF", "#7FBFA8"]);

const categoryColor = (category: CategoryCode): string =>
	CATEGORY_COLOR[category] ?? "#8B8D98";

/** Rarity rides the border + glow, never the fill — the loot ramp (gray → green → blue → gold). */
const RARITY_STYLE: Record<
	Rarity,
	{ border: string; width: number; glow?: string; spark?: boolean }
> = {
	common: { border: "#5a5570", width: 1 },
	uncommon: { border: "#3F9E6E", width: 2 },
	rare: { border: "#4A6FE3", width: 2, glow: "0 0 8px #4A6FE3" },
	legendary: {
		border: "#F4C430",
		width: 2,
		glow: "0 0 14px #F4C430",
		spark: true,
	},
};

const tagColor = (tag: Tag): string =>
	tag.focusCategory
		? (CATEGORY_COLOR[tag.focusCategory] ?? NEUTRAL_FILL)
		: NEUTRAL_FILL;

type Dispatch = React.Dispatch<SessionAction>;

const TagChip = ({
	tag,
	onClick,
	action,
}: {
	tag: Tag;
	onClick?: () => void;
	action?: string;
}) => {
	const background = tagColor(tag);
	const rarity = RARITY_STYLE[rarityOf(tag)];
	return (
		<button
			type="button"
			title={`${tag.description} · ${rarityOf(tag)}`}
			onClick={onClick}
			disabled={!onClick}
			className="rounded-lg px-3 py-2 text-sm font-semibold enabled:hover:brightness-125 transition"
			style={{
				backgroundColor: background,
				color: LIGHT_BG.has(background) ? "#141221" : "#F7F7FB",
				border: `${rarity.width}px solid ${rarity.border}`,
				boxShadow: rarity.glow,
			}}
		>
			{rarity.spark ? (
				<span className="mr-1" style={{ color: "#F4C430" }}>
					✦
				</span>
			) : null}
			{tag.label}
			{(tag.level ?? 1) > 1 ? (
				<span className="ml-1 opacity-90">L{tag.level}</span>
			) : null}
			{action ? <span className="ml-2 opacity-80">{action}</span> : null}
		</button>
	);
};

const RARITY_ORDER: readonly Rarity[] = [
	"common",
	"uncommon",
	"rare",
	"legendary",
];

/** Teaches the glow language: brighter, thicker border = rarer config. */
const RarityLegend = () => (
	<div className="flex flex-wrap items-center gap-3 text-xs text-[#8B8D98]">
		<span className="uppercase tracking-wide">Rarity =</span>
		{RARITY_ORDER.map((rarity) => {
			const style = RARITY_STYLE[rarity];
			return (
				<span
					key={rarity}
					className="rounded px-2 py-1"
					style={{
						backgroundColor: NEUTRAL_FILL,
						color: "#F7F7FB",
						border: `${style.width}px solid ${style.border}`,
						boxShadow: style.glow,
					}}
				>
					{style.spark ? "✦ " : ""}
					{rarity}
				</span>
			);
		})}
	</div>
);

const TagRow = ({
	tag,
	action,
	onClick,
}: {
	tag: Tag;
	action?: string;
	onClick?: () => void;
}) => (
	<div className="flex items-center gap-3">
		<TagChip tag={tag} action={action} onClick={onClick} />
		<span className="text-sm text-[#8B8D98]">{tag.description}</span>
	</div>
);

/** The live gate: every stacked check, met or not. The gate passes only if all are green. */
const GatePanel = ({ state }: { state: SessionState }) => (
	<div className="rounded-lg bg-[#1f1b33] p-4">
		<p className="mb-2 text-xs uppercase tracking-wide text-[#8B8D98]">
			This gate needs (all must pass)
		</p>
		<div className="flex flex-col gap-1">
			{checkStatuses(state).map((check) => (
				<div
					key={check.label}
					className="flex items-center justify-between text-sm"
				>
					<span style={{ color: check.met ? "#3F9E6E" : "#F7F7FB" }}>
						{check.met ? "✓" : "○"} {check.label}
					</span>
					<span style={{ color: check.met ? "#3F9E6E" : "#F4C430" }}>
						{check.progress}
					</span>
				</div>
			))}
		</div>
	</div>
);

/** Live spec of the current build: what the gate will demand, and what a clear pays. */
const BuildSummary = ({ state }: { state: SessionState }) => {
	const reward = rewardMultiplierFor(state.pipeline);
	return (
		<div className="rounded-lg bg-[#1f1b33] p-4">
			<p className="mb-2 text-xs uppercase tracking-wide text-[#8B8D98]">
				Your gate will demand · per {SLICE_WINDOW} polls
			</p>
			<ul className="flex flex-col gap-1">
				{gateDemands(state).map((line) => (
					<li key={line} className="text-sm text-[#F7F7FB]">
						• {line}
					</li>
				))}
			</ul>
			{reward > 1 ? (
				<p className="mt-2 text-sm font-bold text-[#F4C430]">
					Clear pays ×{reward} storage
				</p>
			) : null}
		</div>
	);
};

/** The climb at a glance: which gates are cleared, which is current, which lie ahead. */
const GateTrack = ({ state }: { state: SessionState }) => (
	<div className="flex flex-col gap-2">
		<span className="text-xs uppercase tracking-wide text-[#8B8D98]">
			The climb
		</span>
		<div className="flex flex-wrap gap-2">
			{Array.from({ length: VICTORY_GATE }, (_, index) => {
				const gateNumber = index + 1;
				const cleared = gateNumber <= state.gatesCleared;
				const current = gateNumber === state.gatesCleared + 1;
				const accent = cleared ? "#3F9E6E" : current ? "#F4C430" : "#8B8D98";
				return (
					<div
						key={gateNumber}
						className="flex min-w-16 flex-col items-center rounded-lg border px-3 py-2"
						style={{
							backgroundColor: current ? "#2a2440" : "#1f1b33",
							borderColor: cleared
								? "#3F9E6E"
								: current
									? "#F4C430"
									: "#33304a",
						}}
					>
						<span className="text-xs font-bold" style={{ color: accent }}>
							Gate {gateNumber}
						</span>
						<span className="text-sm text-[#F7F7FB]">
							{cleared ? "✓ done" : current ? "now" : "ahead"}
						</span>
					</div>
				);
			})}
		</div>
	</div>
);

const Stat = ({
	label,
	value,
	accent,
}: {
	label: string;
	value: string | number;
	accent?: string;
}) => (
	<div className="flex flex-col">
		<span className="text-xs uppercase tracking-wide text-[#8B8D98]">
			{label}
		</span>
		<span className="text-xl font-bold" style={{ color: accent ?? "#F7F7FB" }}>
			{value}
		</span>
	</div>
);

/** The board's slots — filled configs plus empty placeholders. */
const Board = ({
	state,
	onUnslot,
}: {
	state: SessionState;
	onUnslot?: (tagId: string) => void;
}) => (
	<div className="flex flex-wrap gap-3">
		{Array.from({ length: state.pipeline.slots }, (_, index) => {
			const tag = state.pipeline.tags[index];
			return tag ? (
				<TagChip
					key={tag.id}
					tag={tag}
					action={onUnslot ? "✕" : undefined}
					onClick={onUnslot ? () => onUnslot(tag.id) : undefined}
				/>
			) : (
				<div
					key={`empty-${index}`}
					className="rounded-lg border-1 border-dashed border-[#8B8D98] px-6 py-2 text-sm text-[#8B8D98]"
				>
					empty
				</div>
			);
		})}
	</div>
);

const Configuring = ({
	state,
	dispatch,
}: {
	state: SessionState;
	dispatch: Dispatch;
}) => {
	const full = state.pipeline.tags.length >= state.pipeline.slots;
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h2 className="text-2xl font-bold">Configure your board</h2>
				<p className="text-[#8B8D98]">
					{state.pipeline.slots} slots to start. Pick your build — the rest stay
					on the bench. Add slots and configs as you climb.
				</p>
			</div>

			<Board
				state={state}
				onUnslot={(tagId) => dispatch({ type: "unslot", tagId })}
			/>

			<BuildSummary state={state} />

			<RarityLegend />

			<div>
				<p className="mb-2 text-xs uppercase tracking-wide text-[#8B8D98]">
					On the bench
				</p>
				<div className="flex flex-col gap-2">
					{state.available.map((tag) => (
						<TagRow
							key={tag.id}
							tag={tag}
							action={full ? undefined : "＋"}
							onClick={
								full
									? undefined
									: () => dispatch({ type: "slot", tagId: tag.id })
							}
						/>
					))}
				</div>
			</div>

			<button
				type="button"
				onClick={() => dispatch({ type: "start" })}
				className="mt-2 self-start rounded-xl bg-[#4A6FE3] px-6 py-3 text-lg font-bold text-[#F7F7FB] hover:brightness-125 transition"
			>
				Start the climb →
			</button>
		</div>
	);
};

const Answering = ({
	state,
	dispatch,
}: {
	state: SessionState;
	dispatch: Dispatch;
}) => {
	const poll = state.polls[state.currentIndex];
	const pollsToGate = SLICE_WINDOW - state.windowAnswered;
	const disabled = new Set([
		...disabledOptionIds(state.pipeline.tags, poll),
		...state.manualDisabled,
	]);
	const linterEquipped = hasLinter(state.pipeline.tags);

	// Track how long the poll has been on screen, so the Speed check can score fast answers.
	const shownAt = useRef<number>(Date.now());
	useEffect(() => {
		shownAt.current = Date.now();
	}, [state.currentIndex]);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap gap-6">
				<Stat
					label="Gate"
					value={`${state.gatesCleared + 1}/${VICTORY_GATE}`}
					accent="#F4C430"
				/>
				<Stat
					label="Gate in"
					value={`${pollsToGate} poll${pollsToGate === 1 ? "" : "s"}`}
				/>
				<Stat label="Coverage" value={`${state.coverage}%`} accent="#4A6FE3" />
				<Stat label="Storage" value={`${state.storage}KB`} accent="#F4C430" />
			</div>

			<Board state={state} />
			<GatePanel state={state} />

			<div className="flex flex-col gap-5">
				<p
					className="text-4xl font-extrabold leading-none"
					style={{ color: categoryColor(poll.category) }}
				>
					{getCategoryMetadata(poll.category).name}
				</p>

				<hr
					className="border-t-2"
					style={{ borderColor: categoryColor(poll.category) }}
				/>

				<h2
					className="text-3xl font-extrabold leading-tight"
					style={{ color: categoryColor(poll.category) }}
				>
					{poll.question}
				</h2>

				{linterEquipped && (
					<button
						type="button"
						disabled={state.storage < LINT_COST}
						onClick={() => dispatch({ type: "lint-poll" })}
						className="self-start rounded border border-[#3F9E6E] px-3 py-1 text-xs text-[#3F9E6E] enabled:hover:bg-[#3F9E6E] enabled:hover:text-[#141221] disabled:opacity-40 transition"
					>
						Run linter · cross out a wrong answer ({LINT_COST}KB)
					</button>
				)}

				<div className="flex flex-col gap-3">
					{poll.options.map((option) => {
						const off = disabled.has(option.id);
						return (
							<button
								key={option.id}
								type="button"
								disabled={off}
								onClick={() =>
									dispatch({
										type: "answer",
										optionId: option.id,
										elapsedMs: Date.now() - shownAt.current,
									})
								}
								style={{ borderColor: categoryColor(poll.category) }}
								className={`rounded-lg border-2 px-4 py-3 text-left transition ${off ? "cursor-not-allowed line-through opacity-40" : "hover:bg-white/5"}`}
							>
								{option.label}
								{off ? (
									<span className="ml-2 text-xs text-[#8B8D98]">
										(linted out)
									</span>
								) : null}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

const Rewarding = ({
	state,
	dispatch,
}: {
	state: SessionState;
	dispatch: Dispatch;
}) => {
	const full = state.pipeline.tags.length >= state.pipeline.slots;
	const rerollPrice = rerollCost(state.rerollsUsed);
	const canAddSlot = state.pipeline.slots < MAX_SLOTS_PER_PIPELINE;
	const focusTags = state.pipeline.tags.filter((tag) => tag.focusCategory);

	return (
		<div className="flex flex-col gap-6">
			<div className="rounded-xl border border-[#3F9E6E] bg-[#16281f] p-6">
				<h2 className="text-2xl font-bold text-[#3F9E6E]">
					Gate cleared — take one reward
				</h2>
				<p className="text-[#8B8D98]">
					{full
						? "Board full — drop a config to make room, or skip."
						: "Grow your build for the harder gates ahead. Pick one, then climb on."}
				</p>
				<p className="mt-2 text-sm text-[#F4C430]">
					Storage: {state.storage}KB
				</p>
			</div>

			<Board state={state} />

			<section className="flex flex-col gap-2">
				<p className="text-xs uppercase tracking-wide text-[#8B8D98]">
					Draft a config
				</p>
				{state.draftOptions.map((tag) => {
					const owned = state.pipeline.tags.find(
						(candidate) => candidate.id === tag.id
					);
					const isUpgrade = !!owned?.focusCategory;
					const canAdd = !owned && !full;
					const action = isUpgrade
						? `upgrade → L${(owned?.level ?? 1) + 1}`
						: canAdd
							? "draft ＋"
							: "full";
					return (
						<TagRow
							key={tag.id}
							tag={tag}
							action={action}
							onClick={
								isUpgrade || canAdd
									? () => dispatch({ type: "draft", tagId: tag.id })
									: undefined
							}
						/>
					);
				})}
				<button
					type="button"
					disabled={state.storage < rerollPrice}
					onClick={() => dispatch({ type: "reroll-draft" })}
					className="mt-1 self-start rounded-xl border border-[#4A6FE3] px-4 py-2 text-sm font-bold text-[#F7F7FB] enabled:hover:bg-[#4A6FE3] disabled:opacity-40 transition"
				>
					Rebuild draft ({rerollPrice}KB)
				</button>
			</section>

			{canAddSlot && (
				<section className="flex flex-col gap-2">
					<p className="text-xs uppercase tracking-wide text-[#8B8D98]">
						Or widen the board
					</p>
					<button
						type="button"
						onClick={() => dispatch({ type: "add-slot" })}
						className="self-start rounded-lg border border-[#3F9E6E] px-3 py-2 text-sm text-[#3F9E6E] hover:bg-[#3F9E6E] hover:text-[#141221] transition"
					>
						Add a slot: {state.pipeline.slots} → {state.pipeline.slots + 1}
					</button>
				</section>
			)}

			{focusTags.length > 0 && (
				<section className="flex flex-col gap-2">
					<p className="text-xs uppercase tracking-wide text-[#8B8D98]">
						Or upgrade a Focus config
					</p>
					{focusTags.map((tag) => {
						const level = tag.level ?? 1;
						const category = (tag.focusCategory ?? "").toUpperCase();
						const evolution = `L${level} → L${level + 1}: ${category} coverage ${focusCoverageMultiplier(level)}× → ${focusCoverageMultiplier(level + 1)}× · but must nail ${level} → ${level + 1} if ${category} shows`;
						return (
							<div key={tag.id} className="flex items-center gap-3">
								<TagChip
									tag={tag}
									action={`→ L${level + 1}`}
									onClick={() => dispatch({ type: "upgrade", tagId: tag.id })}
								/>
								<span className="text-sm text-[#8B8D98]">{evolution}</span>
							</div>
						);
					})}
				</section>
			)}

			{full && (
				<section className="flex flex-col gap-2">
					<p className="text-xs uppercase tracking-wide text-[#8B8D98]">
						Drop one to make room
					</p>
					<div className="flex flex-wrap gap-2">
						{state.pipeline.tags.map((tag) => (
							<TagChip
								key={tag.id}
								tag={tag}
								action="drop ✕"
								onClick={() => dispatch({ type: "drop", tagId: tag.id })}
							/>
						))}
					</div>
				</section>
			)}

			<button
				type="button"
				onClick={() => dispatch({ type: "skip-reward" })}
				className="self-start rounded-xl bg-[#1f1b33] px-6 py-3 font-bold text-[#F7F7FB] hover:brightness-125 transition"
			>
				Skip reward →
			</button>
		</div>
	);
};

const AwaitingStrip = ({
	state,
	dispatch,
}: {
	state: SessionState;
	dispatch: Dispatch;
}) => (
	<div className="flex flex-col gap-6">
		<div className="rounded-xl border border-[#D9381E] bg-[#2a1620] p-6">
			<h2 className="text-2xl font-bold text-[#D9381E]">Gate missed!</h2>
			<p className="text-[#8B8D98]">
				Peel{" "}
				<span className="font-bold text-[#F7F7FB]">
					{state.stripsRemaining}
				</span>{" "}
				config{state.stripsRemaining > 1 ? "s" : ""} off your board — your
				choice which. Deeper gates cost more.
			</p>
		</div>
		<div className="flex flex-wrap gap-2">
			{state.pipeline.tags.map((tag) => (
				<TagChip
					key={tag.id}
					tag={tag}
					action="peel ✕"
					onClick={() => dispatch({ type: "strip", tagId: tag.id })}
				/>
			))}
		</div>
	</div>
);

const Ended = ({
	state,
	onRestart,
}: {
	state: SessionState;
	onRestart: () => void;
}) => {
	const won = state.status === "won";
	return (
		<div className="flex flex-col gap-6">
			<div
				className="rounded-xl p-6"
				style={{
					backgroundColor: won ? "#16281f" : "#2a1620",
					border: `1px solid ${won ? "#3F9E6E" : "#D9381E"}`,
				}}
			>
				<h2
					className="text-3xl font-bold"
					style={{ color: won ? "#3F9E6E" : "#D9381E" }}
				>
					{won ? "You summited! 🟢" : "Run over. 💥"}
				</h2>
				<p className="text-[#8B8D98]">
					{won
						? `You cleared all ${VICTORY_GATE} gates with your build intact.`
						: "Your board was stripped bare and broke."}
				</p>
			</div>
			<div className="flex flex-wrap gap-8">
				<Stat
					label="Gates cleared"
					value={state.gatesCleared}
					accent="#3F9E6E"
				/>
				<Stat label="Coverage" value={`${state.coverage}%`} accent="#4A6FE3" />
				<Stat label="Storage" value={`${state.storage}KB`} accent="#F4C430" />
			</div>
			<button
				type="button"
				onClick={onRestart}
				className="mt-2 self-start rounded-xl bg-[#4A6FE3] px-6 py-3 text-lg font-bold hover:brightness-125 transition"
			>
				Play again →
			</button>
		</div>
	);
};

const SessionGame = ({ onRestart }: { onRestart: () => void }) => {
	const [state, dispatch] = useReducer(sessionReducer, 0, () =>
		createSession(buildSlicePool(POOL_SIZE), HANDED_TAGS)
	);
	const midClimb =
		state.status === "answering" ||
		state.status === "rewarding" ||
		state.status === "awaiting-strip";

	return (
		<div className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
			{midClimb && <GateTrack state={state} />}
			{state.status === "configuring" && (
				<Configuring state={state} dispatch={dispatch} />
			)}
			{state.status === "answering" && (
				<Answering state={state} dispatch={dispatch} />
			)}
			{state.status === "rewarding" && (
				<Rewarding state={state} dispatch={dispatch} />
			)}
			{state.status === "awaiting-strip" && (
				<AwaitingStrip state={state} dispatch={dispatch} />
			)}
			{(state.status === "won" || state.status === "dead") && (
				<Ended state={state} onRestart={onRestart} />
			)}

			{state.log.length > 0 && (
				<div className="mt-4 rounded-lg bg-[#1f1b33] p-4 text-xs text-[#8B8D98]">
					{state.log.slice(-4).map((line, index) => (
						<p key={index}>▸ {line}</p>
					))}
				</div>
			)}
		</div>
	);
};

function RouteComponent() {
	const [seed, setSeed] = useState(0);
	return (
		<div className="min-h-screen bg-[#141221] text-[#F7F7FB]">
			<div className="mx-auto max-w-2xl px-8 pt-8">
				<p className="text-xs text-[#8B8D98]">
					DEVVOTED · PROTOTYPE · session-run climb
				</p>
			</div>
			<SessionGame
				key={seed}
				onRestart={() => setSeed((current) => current + 1)}
			/>
		</div>
	);
}
