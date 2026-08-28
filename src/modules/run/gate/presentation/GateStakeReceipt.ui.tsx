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
import type { BillLedger } from "~/modules/run/config/domain/subscription.model";
import type {
	AuditView,
	GateStake,
	UpcomingAuditView,
} from "~/modules/run/run/application/gateStake.viewmodel";
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
	lead?: string;
	preview?: PipelineModifiers;
	previewPerAnswer?: PerAnswerPreview;
	overflowSpots?: number;
	action?: ScreenAction;
	shopAction?: ScreenAction;
};

export const widthRefusal = (verb: "uninstalling" | "dropping"): string =>
	`Your only config — ${verb} it would leave nothing to clear a gate with.`;

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

const UpcomingAuditNote = ({ upcoming }: { upcoming: UpcomingAuditView }) => (
	<ul className="flex flex-col gap-2">
		<Requirement>
			<Paragraph as="span" tone="muted">
				None scheduled. The first audit waits at gate{" "}
				<Paragraph as="span">{upcoming.gateNumber}</Paragraph>:{" "}
				<Paragraph as="span" className="font-bold">
					{upcoming.name}
				</Paragraph>{" "}
				— {upcoming.description}
			</Paragraph>
		</Requirement>
	</ul>
);

const AuditSection = ({
	audits,
	upcoming,
}: {
	audits: readonly AuditView[];
	upcoming?: UpcomingAuditView;
}) => {
	if (audits.length === 0 && upcoming === undefined) return null;
	return (
		<>
			<hr className="border-t border-edge" />
			<div className="flex flex-col gap-1">
				<Paragraph size="xs">Audit</Paragraph>
				{audits.length > 0 ? <AuditRows audits={audits} /> : null}
				{audits.length === 0 && upcoming !== undefined ? (
					<UpcomingAuditNote upcoming={upcoming} />
				) : null}
			</div>
		</>
	);
};

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

const RewardsList = ({
	stake,
	preview,
	previewPerAnswer,
}: {
	stake: GateStake;
	preview?: PipelineModifiers;
	previewPerAnswer?: PerAnswerPreview;
}) => {
	const { gateNumber, modifiers, perAnswer } = stake;
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
				<CoverageMultipliers perAnswer={perAnswer} />
			</RewardRow>
			<RewardRow label="Gate cleared">
				<MetricValue
					current={`+${modifiers.gateReward}KB`}
					preview={preview && `+${preview.gateReward}KB`}
				/>
			</RewardRow>
			{swatch ? (
				<RewardRow label="Swatch earned">
					<SwatchChip swatch={swatch} owned={false} />
				</RewardRow>
			) : null}
		</ul>
	);
};

const SubscriptionRows = ({ ledger }: { ledger: BillLedger }) => (
	<ul className="flex flex-col gap-2">
		{ledger.lines.map((line) => (
			<RewardRow key={line.id} label={line.label}>
				<Paragraph as="span" tone="cinnabar" className="font-bold">
					−{line.kb}KB
				</Paragraph>
				<Paragraph as="span" tone="muted">
					{" "}
					{line.billedOnMiss ? "pass or fail" : "on clear"}
				</Paragraph>
			</RewardRow>
		))}
		{ledger.lines.length > 1 ? (
			<RewardRow label="Total this gate">
				<Paragraph as="span" tone="cinnabar" className="font-bold">
					−{ledger.totalKb}KB
				</Paragraph>
				{ledger.onMissKb > 0 ? (
					<Paragraph as="span" tone="muted">
						{" "}
						· −{ledger.onMissKb}KB on a miss
					</Paragraph>
				) : null}
			</RewardRow>
		) : null}
		{ledger.shortfallKb > 0 ? (
			<Requirement>
				<Paragraph as="span" tone="cinnabar" className="font-bold">
					{ledger.shortfallKb}KB short — what you cannot pay lapses.
				</Paragraph>
			</Requirement>
		) : null}
	</ul>
);

export const GateStakeReceipt = ({
	stake,
	lead,
	preview,
	previewPerAnswer,
	overflowSpots,
	action,
	shopAction,
}: GateStakeReceiptProps) => {
	const { gateNumber, pollsPerGate, coverageDemand, coverageHeld } = stake;
	const isOverCapacity = overflowSpots !== undefined && overflowSpots > 0;
	return (
		<section className="rounded-lg border border-edge-strong p-4">
			<div data-testid="gate-stake-receipt" className="flex flex-col gap-3">
				<GateTitle gateNumber={gateNumber} lead={lead} />
				{isOverCapacity || shopAction ? (
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
							{isOverCapacity ? (
								<Paragraph as="span" tone="muted">
									Over capacity by{" "}
									<Paragraph as="span" className="font-bold">
										{overflowSpots} spot{overflowSpots === 1 ? "" : "s"}
									</Paragraph>{" "}
									— minify, uninstall, or rent more room
								</Paragraph>
							) : null}
						</div>
					</>
				) : null}
				<hr className="border-t border-edge" />
				<div className="flex flex-col gap-1">
					<Paragraph size="xs">Clear the gate</Paragraph>
					<ul className="flex flex-col gap-2">
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
						strips={stake.peelSpotsOnFailure}
						fatal={stake.missIsFatal}
						pollsPerGate={pollsPerGate}
					/>
				</div>
				<AuditSection audits={stake.audits} upcoming={stake.upcomingAudit} />
				<hr className="border-t border-edge" />
				<div className="flex flex-col gap-1">
					<Paragraph size="xs">Rewards</Paragraph>
					<RewardsList
						stake={stake}
						preview={preview}
						previewPerAnswer={previewPerAnswer}
					/>
				</div>
				{stake.subscriptions.lines.length > 0 ? (
					<>
						<hr className="border-t border-edge" />
						<div className="flex flex-col gap-1">
							<Paragraph size="xs">Subscriptions</Paragraph>
							<SubscriptionRows ledger={stake.subscriptions} />
						</div>
					</>
				) : null}
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

export const GateStakeRewards = ({ stake, lead }: GateStakeRewardsProps) => (
	<section className="rounded-lg border border-edge-strong p-4">
		<div className="flex flex-col gap-3">
			<GateTitle gateNumber={stake.gateNumber} lead={lead} />
			<AuditSection audits={stake.audits} upcoming={stake.upcomingAudit} />
			<hr className="border-t border-edge" />
			<div className="flex flex-col gap-1">
				<Paragraph size="xs">Rewards</Paragraph>
				<RewardsList stake={stake} />
			</div>
			{stake.subscriptions.lines.length > 0 ? (
				<>
					<hr className="border-t border-edge" />
					<div className="flex flex-col gap-1">
						<Paragraph size="xs">Subscriptions</Paragraph>
						<SubscriptionRows ledger={stake.subscriptions} />
					</div>
				</>
			) : null}
		</div>
	</section>
);
