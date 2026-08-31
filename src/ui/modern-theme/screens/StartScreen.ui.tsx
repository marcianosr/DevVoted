import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "../Screen.ui";
import { Action } from "../Action.ui";
import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import { Dot } from "../Dot.ui";
import { Entry } from "../Entry.ui";
import { Fold } from "../Fold.ui";
import { Glyph } from "../Glyph.ui";
import { Lock } from "../Lock.ui";
import { Pick } from "../Pick.ui";
import { RowFigures } from "../RowFigures.ui";
import { Row } from "../Row.ui";
import { SlotTrack, type SlotTrackProps } from "../SlotTrack.ui";
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

const COMBO =
	"flex flex-col gap-2 rounded-lg border border-celadon/30 bg-celadon/5 px-4 py-3";
const COMBO_HEAD = "flex flex-wrap items-center gap-2";
const COMBO_PRESS = "mt-auto pt-1";
const COMBOS = "grid gap-2 sm:grid-cols-3";
const SPARK = "text-celadon";
const SHAPE = "tabular-nums";

const GATE_NAME = "flex items-center gap-2 px-3 py-2";
const GROW = "min-w-0 flex-1";
const LIST = "flex flex-col gap-1";
const SECTION = "border-b border-edge last:border-b-0";
const BULLET = <Dot tone="muted" />;

const FOOT = "px-3 pt-2";

export type DealtConfig = {
	id: string;
	label: string;
	slots: number;
	summary?: ReactNode;
	explainer: string;
	note?: ReactNode;
	locked?: boolean;
};

export type StartCombo = {
	id: string;
	name: string;
	blurb: string;
	shape?: string;
	recommended?: boolean;
	onTake: () => void;
};

export type StartStake = {
	removeOnMiss: number;
	coveragePerWrong: number;
};

export type StartReward = {
	coveragePerCorrect: number;
	gateRewardKb: number;
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
	slots: number;
	maxSlots?: number;
	fits?: number | null;
	slotDeals?: Pick<SlotTrackProps, "buy" | "cash">;
	gateName: string;
	pollCount: number;
	coverageDemand: number;
	auditCount: number;
	streakCap: number;
	stake: StartStake;
	reward: StartReward;
	onStart?: () => void;
	canStart?: boolean;
	theme?: SwatchTheme;
};

const Combo = ({
	name,
	blurb,
	shape,
	recommended,
	onTake,
}: {
	name: string;
	blurb: string;
	shape?: string;
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
		{shape ? (
			<Text size="meta" tone="muted" className={SHAPE}>
				{shape}
			</Text>
		) : null}
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
	maxSlots,
	fits,
	slotDeals,
	gateName,
	pollCount,
	coverageDemand,
	auditCount,
	streakCap,
	stake,
	reward,
	onStart,
	canStart,
	theme,
}: StartScreenProps) => {
	const picked = dealt.filter((config) => pickedIds.includes(config.id));
	const slotsUsed = picked.reduce((total, config) => total + config.slots, 0);
	const slotsFree = Math.max(0, slots - slotsUsed);
	const ready = canStart ?? slotsUsed > 0;

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

	const dealRow = (config: DealtConfig) => {
		const isPicked = pickedIds.includes(config.id);
		const wontFit = !isPicked && config.slots > slotsFree;

		return {
			id: config.id,
			content: (
				<Pick
					variant="draft"
					label={config.label}
					slots={config.slots}
					sizeHint={`takes ${config.slots} of ${slots} slots`}
					checked={isPicked}
					disabled={wontFit}
					onToggle={() => onToggle(config.id)}
					value={<RowFigures slots={config.slots} figure={config.note} />}
					summary={config.summary}
					explainer={config.explainer}
					trailing={lockFor(config)}
				/>
			),
		};
	};

	const startButton = onStart ? (
		<Action
			label={ready ? "Start the run →" : "Pick a config to start"}
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
						title="Configure your build"
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
												shape={combo.shape}
												recommended={combo.recommended}
												onTake={combo.onTake}
											/>
										))}
									</div>
								) : null}
							</div>
						}
						divided
						items={dealt.map(dealRow)}
					/>
				</section>

				<section className={`${COLUMN} ${ASIDE}`}>
					<Fold
						title="Your build"
						value={
							<Text size="meta" tone="muted">
								{slotsUsed} of {slots} slots
							</Text>
						}
						note={
							<SlotTrack
								configs={picked}
								slots={slots}
								maxSlots={maxSlots}
								fits={fits}
								{...slotDeals}
							/>
						}
					/>

					<section className={SECTION}>
						<div className={GATE_NAME}>
							<Swatch size="pip" />
							<Text size="label" className={GROW}>
								{gateName} gate
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
