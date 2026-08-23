import type { ReactNode } from "react";

import { Action } from "../Action.ui";
import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import { Entry } from "../Entry.ui";
import { FAMILY, FAMILY_ORDER, Family, type ConfigFamily } from "../Family.ui";
import { Fold } from "../Fold.ui";
import { Glyph } from "../Glyph.ui";
import { Lock } from "../Lock.ui";
import { Pick } from "../Pick.ui";
import { Row } from "../Row.ui";
import { Slot } from "../Slot.ui";
import { Swatch } from "../Swatch.ui";
import { Text } from "../Text.ui";
import type { ModernTone } from "../tones";
import { Tooltip } from "../Tooltip.ui";
import { plural } from "../format";

const SCREEN = "flex flex-col bg-theme-faint";

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
	/** Rarity and what it applies to — never a live counter, since no window has
	 * been played yet (ADR-026). */
	summary: string;
	explainer: string;
	note?: ReactNode;
	locked?: boolean;
};

/** Config ids, not labels: the combo can then never name something the deal is
 * not offering, and its family line is read off the same rows. */
export type StartCombo = {
	ids: readonly string[];
	blurb: string;
	onTake: () => void;
};

export type StartSlot = { id: string; gate?: number };

export type StartReward = {
	coveragePerCorrect: number;
	gateRewardKb: number;
	slotOpens?: number;
};

export type StartScreenProps = {
	seed: string;
	/** A formatted figure, not a meter: the archive has no cap to fill. */
	archive: string;
	dealt: readonly DealtConfig[];
	dealtFrom: number;
	pickedIds: readonly string[];
	onToggle: (id: string) => void;
	/** One object, so a lock handler can never arrive without its price. */
	lock?: { cost: string; onToggle: (id: string) => void };
	rebuild?: { cost: string; onUse: () => void };
	combo?: StartCombo;
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
	theme?: string;
};

const Combo = ({
	configs,
	blurb,
	onTake,
}: {
	configs: readonly DealtConfig[];
	blurb: string;
	onTake: () => void;
}) => (
	<div className={COMBO}>
		<Glyph name="suggest" className={SPARK} />
		<span className={COMBO_BODY}>
			<Text size="body">
				{configs.map((config) => config.label).join(" + ")}
			</Text>
			{/* The shape of the build, in the same words the deal is tagged with:
			    one glance says what kind of three these are. */}
			<span className={TAGS}>
				{configs.map((config) => (
					<Family key={config.id} family={config.family} />
				))}
			</span>
			<Text size="meta" tone="muted">
				{blurb}
			</Text>
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
	combo,
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
	// You pick as many configs as you have slots open, so the count comes off the
	// slots rather than sitting beside them as a number that could disagree.
	const openSlots = slots.filter((slot) => slot.gate === undefined);
	const picksRequired = openSlots.length;
	const toGo = picksRequired - picked;
	const ready = toGo === 0;

	const comboConfigs = combo
		? combo.ids
				.map((id) => dealt.find((config) => config.id === id))
				.filter((config) => config !== undefined)
		: [];

	const pipeline = [
		...dealt
			.filter((config) => pickedIds.includes(config.id))
			.map((config) => ({
				id: config.id,
				content: <Entry mark="idle" label={config.label} value={config.note} />,
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
		<article data-gate-theme={theme} className={SCREEN}>
			<header className={HEADER}>
				<div className={NAMING}>
					<Swatch size="badge" />
					<Text as="h2" size="title">
						New run
					</Text>
					<Text size="meta" tone="muted">
						seed {seed}
					</Text>
				</div>
				<p>
					<Text size="meta" tone="muted">
						archive{" "}
					</Text>
					<Text size="meta">{archive}</Text>
				</p>
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
								{combo ? (
									<Combo
										configs={comboConfigs}
										blurb={combo.blurb}
										onTake={combo.onTake}
									/>
								) : null}
							</div>
						}
						items={dealt.map((config) => ({
							id: config.id,
							content: (
								<Pick
									variant="draft"
									label={config.label}
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
					{/* Closed: a returning player already knows these, and the tags on
					    the rows are the reminder. */}
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
							label="a miss removes"
							value={plural(removeOnMiss, "config")}
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

					{/* No tooltip on the disabled state: the button's own label is
					    already the instruction. */}
					<div className={FOOT}>{startButton}</div>
				</section>
			</div>
		</article>
	);
};
