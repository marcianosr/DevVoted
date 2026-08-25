import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "../Screen.ui";
import { Action } from "../Action.ui";
import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import { Dot } from "../Dot.ui";
import { Entry } from "../Entry.ui";
import { Fold } from "../Fold.ui";
import { Legend, RARITY_LEGEND } from "../Legend.ui";
import { Glyph } from "../Glyph.ui";
import { Lock } from "../Lock.ui";
import { Pick } from "../Pick.ui";
import type { Rarity } from "../rarity";
import { RarityWord } from "../RarityWord.ui";
import { Row } from "../Row.ui";
import { Slot } from "../Slot.ui";
import { Stake } from "../Stake.ui";
import { Swatch } from "../Swatch.ui";
import { Text } from "../Text.ui";
import type { ModernTone } from "../tones";
import { Tooltip } from "../Tooltip.ui";
import { plural } from "../format";

const HEADER =
	"flex flex-wrap items-center justify-between gap-4 border-b border-edge px-5 py-4";
const NAMING = "flex min-w-0 flex-wrap items-center gap-3";

const BODY = "flex flex-col lg:flex-row lg:items-stretch";
const COLUMN = "flex min-w-0 flex-col px-2 py-4";
const DEAL = "flex-1 border-b border-edge lg:border-b-0 lg:border-r";
const ASIDE = "gap-4 lg:w-96 lg:shrink-0";

const NOTE = "flex flex-col gap-3";

// Fixed width so the figures line up in a column down the deal.
const ROW_TAG = "w-20 shrink-0";

const COMBO =
	"flex flex-col gap-2 rounded-lg border border-celadon/30 bg-celadon/5 px-4 py-3";
const COMBO_HEAD = "flex flex-wrap items-center gap-2";
// Pushed to the card's floor so the three presses line up whatever the blurbs
// wrap to.
const COMBO_PRESS = "mt-auto pt-1";
// Three abreast: stacked, each card was a full-width row holding six words, and
// the openings are meant to be compared rather than read in order.
const COMBOS = "grid gap-2 sm:grid-cols-3";
const KEY = "px-3 pt-4";
const SPARK = "text-celadon";

const GATE_NAME = "flex items-center gap-2 px-3 py-2";
const GROW = "min-w-0 flex-1";
// Same bullet, same row, same gap as the Stake below it: the gate's demands, its
// rewards and its cost are three readings of one thing, so they read as one list.
const LIST = "flex flex-col gap-1";
const SECTION = "border-b border-edge last:border-b-0";
const BULLET = <Dot tone="muted" />;

const FOOT = "px-3 pt-2";

export type DealtConfig = {
	id: string;
	label: string;
	rarity?: Rarity;
	summary?: string;
	explainer: string;
	note?: ReactNode;
	locked?: boolean;
};

export type StartCombo = {
	id: string;
	name: string;
	blurb: string;
	recommended?: boolean;
	onTake: () => void;
};

/** A slot the run does not own yet names what opens it: a gate, a coverage
 * total, or either (ADR-041). An owned slot names neither. */
export type StartSlot = { id: string; gate?: number; coverage?: number };

export type StartStake = {
	removeOnMiss: number;
	/** Signed: what a wrong answer does to coverage, so it pairs with the
	 * reward's per-correct figure instead of asking the reader to flip it. */
	coveragePerWrong: number;
};

export type StartReward = {
	coveragePerCorrect: number;
	gateRewardKb: number;
	slotOpens?: number;
};

export type StartScreenProps = {
	seed?: string;
	archive?: string;
	dealt: readonly DealtConfig[];
	dealtFrom: number;
	pickedIds: readonly string[];
	onToggle: (id: string) => void;
	lock?: { cost: string; onToggle: (id: string) => void };
	rebuild?: { cost: string; onUse: () => void };
	combos?: readonly StartCombo[];
	slots: readonly StartSlot[];
	gateName: string;
	gateNumber: number;
	gateCount: number;
	pollCount: number;
	coverageDemand: number;
	auditCount: number;
	/** Where this build's streak stops paying, as the multiplier itself. */
	streakCap: number;
	stake: StartStake;
	reward: StartReward;
	onStart?: () => void;
	theme?: SwatchTheme;
};

// Name, one line of playstyle, and the press. The contents are not listed: the
// deal below is where a config is read, and a combo that has to be audited
// before it can be taken is not doing its job (ADR-026).
const Combo = ({
	name,
	blurb,
	recommended,
	onTake,
}: {
	name: string;
	blurb: string;
	recommended?: boolean;
	onTake: () => void;
}) => (
	<div className={COMBO}>
		<span className={COMBO_HEAD}>
			<Glyph name="suggest" className={SPARK} />
			<Text size="body">{name}</Text>
			{recommended ? <Chip tone="celadon">Recommended</Chip> : null}
		</span>
		<Text size="meta" tone="muted">
			{blurb}
		</Text>
		<span className={COMBO_PRESS}>
			<Action label="take these" emphasis="loud" full onUse={onTake} />
		</span>
	</div>
);

const Fact = ({
	label,
	value,
	tone,
}: {
	label: string;
	value: ReactNode;
	tone?: ModernTone;
}) => (
	<li>
		<Entry
			leading={BULLET}
			label={label}
			value={
				tone ? (
					<Text size="meta" tone={tone}>
						{value}
					</Text>
				) : (
					value
				)
			}
		/>
	</li>
);

export const StartScreen = ({
	seed,
	archive,
	dealt,
	dealtFrom,
	pickedIds,
	onToggle,
	lock,
	rebuild,
	combos,
	slots,
	gateName,
	gateNumber,
	gateCount,
	pollCount,
	coverageDemand,
	auditCount,
	streakCap,
	stake,
	reward,
	onStart,
	theme,
}: StartScreenProps) => {
	const picked = pickedIds.length;
	const openSlots = slots.filter((slot) => slot.gate === undefined);
	const picksRequired = openSlots.length;
	const toGo = picksRequired - picked;
	const ready = toGo === 0;

	const pipeline = [
		...dealt
			.filter((config) => pickedIds.includes(config.id))
			.map((config) => ({
				id: config.id,
				content: (
					<Entry
						label={config.label}
						rarity={config.rarity}
						notes={config.rarity ? <RarityWord rarity={config.rarity} /> : null}
						value={config.note}
					/>
				),
			})),
		...openSlots.slice(picked).map((slot) => ({
			id: slot.id,
			content: <Slot />,
		})),
		...slots
			.filter((slot) => slot.gate !== undefined || slot.coverage !== undefined)
			.map((slot) => ({
				id: slot.id,
				content: <Slot gate={slot.gate} coverage={slot.coverage} />,
			})),
	];

	const lockFor = (config: DealtConfig) => {
		if (!lock) return undefined;
		if (config.locked)
			return (
				<Lock
					on={config.label}
					state="locked"
					onToggle={() => lock.onToggle(config.id)}
				/>
			);
		return (
			<Lock
				on={config.label}
				state="unlocked"
				cost={lock.cost}
				onToggle={() => lock.onToggle(config.id)}
			/>
		);
	};

	const startButton = onStart ? (
		<Action
			label={ready ? "Start the run →" : `Pick ${toGo} to start`}
			size="lg"
			emphasis="loud"
			full
			disabled={!ready}
			onUse={onStart}
		/>
	) : null;

	return (
		<Screen theme={theme}>
			<header className={HEADER}>
				<div className={NAMING}>
					<Swatch size="badge" />
					<Text as="h2" size="title">
						New run
					</Text>
					{seed ? (
						<Text size="meta" tone="muted">
							seed {seed}
						</Text>
					) : null}
				</div>
				{archive ? (
					<p>
						<Text size="meta" tone="muted">
							archive{" "}
						</Text>
						<Text size="meta">{archive}</Text>
					</p>
				) : null}
			</header>

			<div className={BODY}>
				<section className={`${COLUMN} ${DEAL}`}>
					<Fold
						title="Configure your pipeline"
						action={
							rebuild ? (
								<Tooltip hint="Paid from your archive, not from this run's storage.">
									<Action
										icon={<Glyph name="rebuild" />}
										label="rebuild"
										cost={rebuild.cost}
										onUse={rebuild.onUse}
									/>
								</Tooltip>
							) : null
						}
						note={
							<div className={NOTE}>
								<Text as="p" size="meta" tone="muted">
									{dealt.length} dealt from {dealtFrom}
								</Text>
								{combos?.length ? (
									<div className={COMBOS}>
										{combos.map((combo) => (
											<Combo
												key={combo.id}
												name={combo.name}
												blurb={combo.blurb}
												recommended={combo.recommended}
												onTake={combo.onTake}
											/>
										))}
									</div>
								) : null}
							</div>
						}
						items={dealt.map((config) => ({
							id: config.id,
							content: (
								<Pick
									variant="draft"
									label={config.label}
									rarity={config.rarity}
									checked={pickedIds.includes(config.id)}
									onToggle={() => onToggle(config.id)}
									notes={
										<>
											{config.rarity ? (
												<RarityWord
													rarity={config.rarity}
													className={ROW_TAG}
												/>
											) : null}
											{config.note}
										</>
									}
									summary={config.summary}
									explainer={config.explainer}
									trailing={lockFor(config)}
								/>
							),
						}))}
					/>
					<div className={KEY}>
						<Legend items={RARITY_LEGEND} />
					</div>
				</section>

				<section className={`${COLUMN} ${ASIDE}`}>
					<Fold
						title="Your pipeline"
						value={
							<Text size="meta" tone="muted">
								{picked} of {picksRequired}
							</Text>
						}
						items={pipeline}
					/>

					{/* Flat, never folded: this panel is the reason to pick anything. */}
					<section className={SECTION}>
						<div className={GATE_NAME}>
							<Swatch size="pip" />
							<Text size="label" className={GROW}>
								{gateName} gate
							</Text>
							<Text size="meta" tone="muted">
								{gateNumber} / {gateCount}
							</Text>
						</div>
						<ul className={LIST}>
							<Fact
								label={`coverage from ${plural(pollCount, "poll")}`}
								value={`${coverageDemand}%`}
							/>
							<Fact
								label="audits"
								value={auditCount === 0 ? "none" : String(auditCount)}
								tone={auditCount === 0 ? "muted" : "saffron"}
							/>
							{/* A build number, not a rule of the gate: it sits here because
							    it bounds what the polls below can pay, and configs will
							    raise it. */}
							<Fact label="streak cap" value={`×${streakCap}`} />
						</ul>
					</section>

					<section className={SECTION}>
						<Row spacing="compact">
							<Text size="body">Clear rewards</Text>
						</Row>
						<ul className={LIST}>
							<Fact
								label="per correct answer"
								value={<Delta coverage={reward.coveragePerCorrect} />}
							/>
							<Fact
								label="gate cleared"
								value={<Delta kb={reward.gateRewardKb} />}
							/>
							{reward.slotOpens === undefined ? null : (
								<Fact
									label={`slot ${reward.slotOpens}`}
									value={<Chip tone="celadon">opens</Chip>}
								/>
							)}
							<Fact
								label={`${gateName} Swatch`}
								value={<Swatch size="pip" state="pending" />}
							/>
						</ul>
					</section>

					<Stake {...stake} />

					<div className={FOOT}>{startButton}</div>
				</section>
			</div>
		</Screen>
	);
};
