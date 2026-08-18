import type { ReactNode } from "react";
import { clsx } from "clsx";
import {
	themeColorOf,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import type {
	PerAnswerPreview,
	PipelineModifiers,
} from "~/modules/run/pipeline/domain/pipeline.model";
import type {
	AuditView,
	GateStake,
} from "~/modules/run/run/application/runView.viewmodel";
import { Button } from "~/ui/Button.component";
import { Meter } from "~/ui/Meter.ui";
import { Popover } from "~/ui/Popover.component";
import type { ScreenAction } from "~/ui/Screen.ui";
import { SwatchMark, swatchNameTone } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { SwatchChip } from "~/modules/run/gate/presentation/SwatchChips.ui";

type GateStakeReceiptProps = {
	stake: GateStake;
	/**
	 * How this gate relates to the screen showing it — "Next up" after a clear,
	 * "Retry" after a miss. The screens that sit *on* the gate omit it: there the
	 * receipt needs no relationship, it is the gate you are about to climb.
	 */
	lead?: string;
	preview?: PipelineModifiers;
	previewPerAnswer?: PerAnswerPreview;
	configsToInstall?: number;
	action?: ScreenAction;
	shopAction?: ScreenAction;
};

/**
 * Why a removal is refused, for the two surfaces that offer one. The verb is
 * theirs — you uninstall in the shop and drop at the gate door — but the rule
 * behind it is `atMinimumWidth`, so the sentence is written once.
 */
export const widthRefusal = (verb: "uninstalling" | "dropping"): string =>
	`Your only config — ${verb} it would leave nothing to clear a gate with.`;

/**
 * The gate's name and badge, with an optional lead ("Next up", "Retry") naming
 * how it relates to the screen showing it. Shared by the full receipt and the
 * rewards-only preview, so a gate's identity always reads the same way.
 */
const GateTitle = ({
	gateNumber,
	lead,
}: {
	gateNumber: number;
	lead?: string;
}) => {
	const swatch = swatchForGate(gateNumber);
	const gateName = swatch?.gateName ?? `Gate ${gateNumber}`;
	return (
		<div
			{...swatchTheme(swatch && themeColorOf(swatch))}
			className="flex items-center gap-2"
		>
			{lead ? (
				<Paragraph as="span" tone="muted">
					{lead}
				</Paragraph>
			) : null}
			{swatch ? <SwatchMark finish={swatch.finish} size="sm" /> : null}
			<Title tone={swatch ? swatchNameTone(swatch.finish) : "default"}>
				{gateName} gate
			</Title>
		</div>
	);
};

/**
 * One thing the gate asks for or pays out, its own list item beside a bullet
 * mark — the one shell both "Clear the gate" and "Rewards" build their rows
 * from, so the two lists read as one visual language. `contentClassName` picks
 * the layout: a requirement stacks (a sentence, then its meter), a reward pays
 * in one row (label left, number right).
 */
const Requirement = ({
	children,
	contentClassName = "flex-col gap-1",
}: {
	children: ReactNode;
	contentClassName?: string;
}) => (
	<li className="flex gap-2">
		<Paragraph as="span" tone="muted" aria-hidden>
			·
		</Paragraph>
		<span className={clsx("flex min-w-0 flex-1", contentClassName)}>
			{children}
		</span>
	</li>
);

/**
 * The gate's own stake on the score (ADR-035): the target sentence, a rail, and
 * the numbers, all one line. The meter reads the attempt's own window — every
 * gate is a fresh score, never a running total. Kept narrow (w-24) so it reads
 * as a detail beside the sentence rather than a second headline competing with
 * it.
 */
const CoverageDemand = ({
	demand,
	held,
	gateNumber,
}: {
	demand: number;
	held: number;
	gateNumber: number;
}) => {
	const met = held >= demand;
	return (
		<Requirement>
			<span className="flex flex-wrap items-center gap-2">
				<Paragraph as="span" tone="muted">
					Earn <Paragraph as="span">{demand}% coverage this gate</Paragraph>
				</Paragraph>
				<span className="w-24 shrink-0">
					<Meter
						cap={demand}
						trackClassName="h-1 rounded-full"
						segments={[
							{
								value: held,
								className: met ? "bg-viridian" : "bg-cinnabar",
							},
						]}
						label={`coverage toward gate ${gateNumber}`}
					/>
				</span>
				<Paragraph
					as="span"
					tone={met ? "viridian" : "cinnabar"}
					className="whitespace-nowrap font-bold"
				>
					{held}% / {demand}%
				</Paragraph>
			</span>
		</Requirement>
	);
};

/**
 * What a miss costs (ADR-037), said before the player commits: the peel, the
 * loop it drops them into, and — when the peel would take the whole build — the
 * run ending. The fatal line is the only place the receipt shouts, because it is
 * the only line the player cannot undo afterwards.
 */
const MissCost = ({
	strips,
	fatal,
	pollsPerGate,
}: {
	strips: number;
	fatal: boolean;
	pollsPerGate: number;
}) => (
	<div className="flex flex-col gap-0.5">
		<Paragraph as="span" tone="muted">
			Miss the target: the gate peels{" "}
			<Paragraph as="span">
				{strips} config{strips === 1 ? "" : "s"}
			</Paragraph>
			, then you shop and run it again on {pollsPerGate} fresh polls
		</Paragraph>
		{fatal ? (
			<Paragraph as="span" tone="cinnabar" className="font-bold">
				That peel takes your whole pipeline — a miss here ends the run.
			</Paragraph>
		) : null}
	</div>
);

/**
 * The gate's personality (ADR-035), one row per audit: the name carries the
 * warning tone, the sentence the rule. A suppressed audit stays on the receipt
 * struck through with the device's verdict — the fraud is visible, never
 * silent (ADR-028's principle against the new rulebook).
 */
const AuditRows = ({ audits }: { audits: readonly AuditView[] }) => (
	<ul className="flex flex-col gap-2">
		{audits.map((audit) => (
			<Requirement key={audit.id}>
				{audit.suppressed ? (
					<Paragraph as="span" tone="muted">
						<span className="line-through">
							{audit.name} — {audit.description}
						</span>{" "}
						<Paragraph as="span" tone="viridian" className="font-bold">
							reported passing
						</Paragraph>
					</Paragraph>
				) : (
					<Paragraph as="span" tone="muted">
						<Paragraph as="span" tone="saffron" className="font-bold">
							{audit.name}
						</Paragraph>{" "}
						— {audit.description}
					</Paragraph>
				)}
			</Requirement>
		))}
	</ul>
);

/**
 * What multiplies a correct answer beyond its base: a Focus config when the poll
 * matches its category, and one step of streak — which every correct answer
 * takes, the first one included. Muted and inline, because they qualify the
 * number beside them rather than being figures of their own.
 */
const CoverageMultipliers = ({
	perAnswer,
}: {
	perAnswer: PerAnswerPreview;
}) => (
	<Paragraph as="span" size="xs" tone="muted" className="block">
		{perAnswer.matchingConfigMultiplier === undefined ? null : (
			<>×{perAnswer.matchingConfigMultiplier} on a matching poll · </>
		)}
		×{perAnswer.streakStepMultiplier} per streak step
	</Paragraph>
);

/** One payout: label left, number right, so the column of rewards reads as a ledger. */
const RewardRow = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => (
	<Requirement contentClassName="flex-wrap items-baseline justify-between gap-x-6">
		<Paragraph as="span" tone="muted">
			{label}
		</Paragraph>
		<Paragraph as="span">{children}</Paragraph>
	</Requirement>
);

const MetricValue = ({
	current,
	preview,
}: {
	current: string;
	preview?: string;
}) => {
	if (preview !== undefined && preview !== current)
		return (
			<>
				<span className="text-pewter">{current}</span>
				<span className="text-celadon"> → {preview}</span>
			</>
		);
	return <span className="text-gradient-green">{current}</span>;
};

/**
 * What clearing this gate pays — the same ledger the full receipt's "Rewards"
 * section builds, pulled out so a screen that only wants the payout (the
 * reward screen's "Next up" preview) can render it without also carrying the
 * demand and game-over sections that belong to a gate still ahead.
 */
const RewardsList = ({
	stake,
	preview,
	previewPerAnswer,
}: {
	stake: GateStake;
	preview?: PipelineModifiers;
	previewPerAnswer?: PerAnswerPreview;
}) => {
	const { gateNumber, billKb, modifiers, perAnswer } = stake;
	const swatch = swatchForGate(gateNumber);

	const showsStorageKbPerAnswer =
		perAnswer.storageKbPerCorrect > 0 ||
		(previewPerAnswer !== undefined &&
			previewPerAnswer.storageKbPerCorrect !== perAnswer.storageKbPerCorrect);

	return (
		<ul className="flex flex-col gap-2">
			<RewardRow label="Correct answer">
				<MetricValue
					current={`+${perAnswer.coveragePerCorrect}% coverage`}
					preview={
						previewPerAnswer &&
						`+${previewPerAnswer.coveragePerCorrect}% coverage`
					}
				/>
				{showsStorageKbPerAnswer ? (
					<>
						{" · "}
						<MetricValue
							current={`+${perAnswer.storageKbPerCorrect}KB`}
							preview={
								previewPerAnswer && `+${previewPerAnswer.storageKbPerCorrect}KB`
							}
						/>
					</>
				) : null}
				{/* The multipliers that ride on top of the base, named where the base
				    is: without them the row promises a number no correct answer ever
				    actually pays, since even the first one carries a streak. */}
				<CoverageMultipliers perAnswer={perAnswer} />
			</RewardRow>
			<RewardRow label="Gate cleared">
				<MetricValue
					current={`+${modifiers.gateReward}KB`}
					preview={preview && `+${preview.gateReward}KB`}
				/>
			</RewardRow>
			{/* Dashed, uncoloured: the badge is the gate's, and the gate has not
			    handed it over yet — the same locked chip the collection shows. */}
			{swatch ? (
				<RewardRow label="Swatch earned">
					<SwatchChip swatch={swatch} owned={false} />
				</RewardRow>
			) : null}
			{billKb > 0 ? (
				<RewardRow label="Storage bill">
					<Paragraph as="span" tone="cinnabar" className="font-bold">
						−{billKb}KB
					</Paragraph>
					<Paragraph as="span" tone="muted">
						{" "}
						pass or fail
					</Paragraph>
				</RewardRow>
			) : null}
		</ul>
	);
};

export const GateStakeReceipt = ({
	stake,
	lead,
	preview,
	previewPerAnswer,
	configsToInstall,
	action,
	shopAction,
}: GateStakeReceiptProps) => {
	const { gateNumber, pollsPerGate, coverageDemand, coverageHeld } = stake;
	const needsInstalls = configsToInstall !== undefined && configsToInstall > 0;
	return (
		<section className="rounded-lg border border-edge-strong p-4">
			<div data-testid="gate-stake-receipt" className="flex flex-col gap-3">
				<GateTitle gateNumber={gateNumber} lead={lead} />
				{needsInstalls || shopAction ? (
					<>
						<hr className="border-t border-edge" />
						<div className="flex flex-col gap-1">
							<div className="flex items-center justify-between">
								<Paragraph size="xs">To start</Paragraph>
								{shopAction ? (
									<Button
										variant="neutral"
										size="small"
										onClick={shopAction.onClick}
										disabled={shopAction.disabled}
									>
										{shopAction.label}
									</Button>
								) : null}
							</div>
							{needsInstalls ? (
								<Paragraph as="span" tone="muted">
									Needs at least{" "}
									<Paragraph as="span" className="font-bold">
										{configsToInstall} config
										{configsToInstall === 1 ? "" : "s"}
									</Paragraph>{" "}
									in your pipeline
								</Paragraph>
							) : null}
						</div>
					</>
				) : null}
				<hr className="border-t border-edge" />
				<div className="flex flex-col gap-1">
					<Paragraph size="xs">Clear the gate</Paragraph>
					<ul className="flex flex-col gap-2">
						{/* The window is a requirement, not a caption: the gate judges a
						    full window, so leaving it half-answered fails it. */}
						<Requirement>
							<Paragraph as="span" tone="muted">
								Answer all <Paragraph as="span">{pollsPerGate} polls</Paragraph>
							</Paragraph>
						</Requirement>
						<CoverageDemand
							demand={coverageDemand}
							held={coverageHeld}
							gateNumber={gateNumber}
						/>
					</ul>
					<MissCost
						strips={stake.stripsOnFailure}
						fatal={stake.missIsFatal}
						pollsPerGate={pollsPerGate}
					/>
				</div>
				{stake.audits.length > 0 ? (
					<>
						<hr className="border-t border-edge" />
						<div className="flex flex-col gap-1">
							<Paragraph size="xs">Audit</Paragraph>
							<AuditRows audits={stake.audits} />
						</div>
					</>
				) : null}
				<hr className="border-t border-edge" />
				<div className="flex flex-col gap-1">
					<Paragraph size="xs">Rewards</Paragraph>
					<RewardsList
						stake={stake}
						preview={preview}
						previewPerAnswer={previewPerAnswer}
					/>
				</div>
				{action ? (
					<div className="pt-1">
						{action.hint ? (
							<Popover
								triggerAs="span"
								className="w-full"
								ariaLabel={`Why "${action.label}" is unavailable`}
								content={<p className="max-w-xs text-sm">{action.hint}</p>}
							>
								<Button
									className="w-full"
									disabled={action.disabled}
									onClick={action.onClick}
								>
									{action.label}
								</Button>
							</Popover>
						) : (
							<Button
								className="w-full"
								disabled={action.disabled}
								onClick={action.onClick}
							>
								{action.label}
							</Button>
						)}
					</div>
				) : null}
			</div>
		</section>
	);
};

type GateStakeRewardsProps = {
	stake: GateStake;
	lead?: string;
};

/**
 * The next gate's payout, on its own — what the reward screen shows right
 * after a clear. The full receipt's "To start"/"Clear the gate"/"Game over"
 * sections describe a gate still ahead of the player; here the player just
 * cleared one, so only the rewards half is relevant.
 */
export const GateStakeRewards = ({ stake, lead }: GateStakeRewardsProps) => (
	<section className="rounded-lg border border-edge-strong p-4">
		<div className="flex flex-col gap-3">
			<GateTitle gateNumber={stake.gateNumber} lead={lead} />
			{stake.audits.length > 0 ? (
				<>
					<hr className="border-t border-edge" />
					<div className="flex flex-col gap-1">
						<Paragraph size="xs">Audit</Paragraph>
						<AuditRows audits={stake.audits} />
					</div>
				</>
			) : null}
			<hr className="border-t border-edge" />
			<div className="flex flex-col gap-1">
				<Paragraph size="xs">Rewards</Paragraph>
				<RewardsList stake={stake} />
			</div>
		</div>
	</section>
);
