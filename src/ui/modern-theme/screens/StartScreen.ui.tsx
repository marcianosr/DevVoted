import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "../Screen.ui";
import { Action } from "../Action.ui";
import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import { Entry } from "../Entry.ui";
import { FAMILY, FAMILY_ORDER, Family, type ConfigFamily } from "../Family.ui";
import { Fold } from "../Fold.ui";
import { Legend, RARITY_LEGEND } from "../Legend.ui";
import { Glyph } from "../Glyph.ui";
import { Lock } from "../Lock.ui";
import { Pick } from "../Pick.ui";
import type { Rarity } from "../rarity";
import { Row } from "../Row.ui";
import { Slot } from "../Slot.ui";
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
const ASIDE = "gap-4 lg:w-80 lg:shrink-0";

const NOTE = "flex flex-col gap-3";

// Fixed width so the figures line up in a column down the deal.
const ROW_TAG = "w-20 shrink-0";
const TAGS = "flex flex-wrap items-center gap-3";

const COMBO =
	"flex flex-wrap items-center gap-3 rounded-lg border border-celadon/30 bg-celadon/5 px-4 py-3";
const COMBO_BODY = "flex min-w-0 flex-1 flex-col gap-1";
const COMBO_HEAD = "flex flex-wrap items-center gap-2";
const COMBOS = "flex flex-col gap-2";
const KEY = "px-3 pt-4";
const SPARK = "text-celadon";

const GATE = "flex flex-col gap-1 px-3 py-2";
const GATE_NAME = "flex items-center gap-2 pb-2";
const GROW = "min-w-0 flex-1";
const FACT = "flex items-baseline justify-between gap-6 py-1";
const RULE = "my-2 border-t border-edge";
const SUBHEAD = "pb-1";

const FOOT = "px-3 pt-2";

export type DealtConfig = {
	id: string;
	label: string;
	family: ConfigFamily;
	rarity?: Rarity;
	summary: string;
	explainer: string;
	note?: ReactNode;
	locked?: boolean;
};

export type StartCombo = {
	id: string;
	name: string;
	ids: readonly string[];
	blurb: string;
	recommended?: boolean;
	onTake: () => void;
};

export type StartSlot = { id: string; gate?: number };

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
	removeOnMiss: number;
	reward: StartReward;
	onStart?: () => void;
	theme?: SwatchTheme;
};

const Combo = ({
	name,
	configs,
	blurb,
	recommended,
	onTake,
}: {
	name: string;
	configs: readonly DealtConfig[];
	blurb: string;
	recommended?: boolean;
	onTake: () => void;
}) => (
	<div className={COMBO}>
		<Glyph name="suggest" className={SPARK} />
		<span className={COMBO_BODY}>
			<span className={COMBO_HEAD}>
				<Text size="body">{name}</Text>
				{recommended ? <Chip tone="celadon">Recommended</Chip> : null}
				<Text size="meta" tone="muted">
					{blurb}
				</Text>
			</span>
			<Text size="meta" tone="muted">
				{configs.map((config) => config.label).join(" + ")}
			</Text>
			<span className={TAGS}>
				{configs.map((config) => (
					<Family key={config.id} family={config.family} />
				))}
			</span>
		</span>
		<Action label="take these" emphasis="loud" onUse={onTake} />
	</div>
);

const Fact = ({
	label,
	value,
	tone = "default",
}: {
	label: string;
	value: ReactNode;
	tone?: ModernTone;
}) => (
	<p className={FACT}>
		<Text size="meta" tone="muted">
			{label}
		</Text>
		<Text size="meta" tone={tone}>
			{value}
		</Text>
	</p>
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
	removeOnMiss,
	reward,
	onStart,
	theme,
}: StartScreenProps) => {
	const picked = pickedIds.length;
	const openSlots = slots.filter((slot) => slot.gate === undefined);
	const picksRequired = openSlots.length;
	const toGo = picksRequired - picked;
	const ready = toGo === 0;

	const configsIn = (ids: readonly string[]) =>
		ids
			.map((id) => dealt.find((config) => config.id === id))
			.filter((config) => config !== undefined);

	const pipeline = [
		...dealt
			.filter((config) => pickedIds.includes(config.id))
			.map((config) => ({
				id: config.id,
				content: (
					<Entry
						mark="idle"
						label={config.label}
						rarity={config.rarity}
						value={config.note}
					/>
				),
			})),
		...openSlots.slice(picked).map((slot) => ({
			id: slot.id,
			content: <Slot />,
		})),
		...slots
			.filter((slot) => slot.gate !== undefined)
			.map((slot) => ({ id: slot.id, content: <Slot gate={slot.gate} /> })),
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
												configs={configsIn(combo.ids)}
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
											<Family family={config.family} className={ROW_TAG} />
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
					<Fold
						title="What the families mean"
						defaultOpen={false}
						items={FAMILY_ORDER.map((family) => ({
							id: family,
							content: (
								<Row
									spacing="compact"
									leading={<Family family={family} className={ROW_TAG} />}
								>
									<Text size="meta" tone="muted">
										{FAMILY[family].gloss}
									</Text>
								</Row>
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
					<div className={GATE}>
						<div className={GATE_NAME}>
							<Swatch size="pip" />
							<Text size="label" className={GROW}>
								{gateName} gate
							</Text>
							<Text size="meta" tone="muted">
								{gateNumber} / {gateCount}
							</Text>
						</div>

						<Fact
							label={`coverage from ${plural(pollCount, "poll")}`}
							value={`${coverageDemand}%`}
						/>
						<Fact
							label="audits"
							value={auditCount === 0 ? "none" : String(auditCount)}
							tone={auditCount === 0 ? "muted" : "saffron"}
						/>
						<Fact
							label="Failing the gate"
							value={
								<Chip tone="cinnabar">
									remove {plural(removeOnMiss, "config")}
								</Chip>
							}
						/>

						<hr className={RULE} />

						<Text as="h3" size="label" className={SUBHEAD}>
							Clear rewards
						</Text>
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
					</div>

					<div className={FOOT}>{startButton}</div>
				</section>
			</div>
		</Screen>
	);
};
