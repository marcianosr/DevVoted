import {
	hasThemeColor,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import type {
	PerAnswerPreview,
	PipelineModifiers,
} from "~/modules/run/pipeline/domain/pipeline.model";
import { isStakeFatal } from "~/modules/run/run/domain/rules.model";
import { Button } from "~/ui/Button.component";
import { Popover } from "~/ui/Popover.component";
import type { ScreenAction } from "~/ui/Screen.ui";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { coverageValue } from "~/modules/run/gate/presentation/GateModifierStrip.ui";

type GateStakeReceiptProps = {
	gateNumber: number;
	pollsPerGate: number;
	stripsOnFailure: number;
	configCount: number;
	modifiers: PipelineModifiers;
	preview?: PipelineModifiers;
	perAnswer: PerAnswerPreview;
	previewPerAnswer?: PerAnswerPreview;
	billKb?: number;
	minConfigs?: number;
	configsToInstall?: number;
	action?: ScreenAction;
	shopAction?: ScreenAction;
};

const stripLabel = (strips: number, configCount: number): string =>
	isStakeFatal(strips, configCount)
		? "All configs disabled — run over"
		: `Remove ${strips} config${strips === 1 ? "" : "s"}`;

const WidthDemand = ({
	minConfigs,
	configCount,
}: {
	minConfigs: number;
	configCount: number;
}) => {
	if (minConfigs < 2) return null;
	if (configCount < minConfigs)
		return (
			<Paragraph as="span" tone="cinnabar" className="font-bold">
				Demands {minConfigs} configs — the build holds {configCount}. Install{" "}
				{minConfigs - configCount} more to climb on.
			</Paragraph>
		);
	return (
		<Paragraph as="span" tone="muted">
			Demands <Paragraph as="span">{minConfigs}+ configs</Paragraph> installed
		</Paragraph>
	);
};

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
				<span className="text-zinc-400">{current}</span>
				<span className="text-celadon"> → {preview}</span>
			</>
		);
	return <span className="text-gradient-green">{current}</span>;
};

export const GateStakeReceipt = ({
	gateNumber,
	pollsPerGate,
	stripsOnFailure,
	configCount,
	modifiers,
	preview,
	perAnswer,
	previewPerAnswer,
	billKb,
	minConfigs,
	configsToInstall,
	action,
	shopAction,
}: GateStakeReceiptProps) => {
	const swatch = swatchForGate(gateNumber);
	const gateName = swatch?.gateName ?? `Gate ${gateNumber}`;
	const hasStartRequirement =
		(configsToInstall !== undefined && configsToInstall > 0) ||
		(minConfigs !== undefined && minConfigs >= 2);
	const showsCoverage =
		modifiers.coverageMultiplier !== 1 ||
		modifiers.coverageAdd > 0 ||
		(preview !== undefined &&
			coverageValue(preview) !== coverageValue(modifiers));
	const showsStorageKbPerAnswer =
		perAnswer.storageKbPerCorrect > 0 ||
		(previewPerAnswer !== undefined &&
			previewPerAnswer.storageKbPerCorrect !== perAnswer.storageKbPerCorrect);
	const matchingConfigMultiplier =
		previewPerAnswer?.matchingConfigMultiplier ??
		perAnswer.matchingConfigMultiplier;
	return (
		<section className="rounded-lg border border-zinc-600 p-4">
			<div data-testid="gate-stake-receipt" className="flex flex-col gap-3">
				<div
					{...(swatch && hasThemeColor(swatch)
						? swatchTheme(swatch.theme)
						: {})}
					className="flex items-center gap-2"
				>
					{swatch ? <SwatchMark finish={swatch.finish} size="sm" /> : null}
					<Title
						className={swatch ? swatchNameClass(swatch.finish) : undefined}
					>
						{gateName} gate
					</Title>
					<Paragraph as="span" tone="muted">
						· {pollsPerGate} polls
					</Paragraph>
				</div>
				{hasStartRequirement ? (
					<>
						<hr className="border-t border-zinc-800" />
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
							{configsToInstall !== undefined && configsToInstall > 0 ? (
								<Paragraph as="span" tone="muted">
									Needs at least{" "}
									<Paragraph as="span" className="font-bold">
										{configsToInstall} config
										{configsToInstall === 1 ? "" : "s"}
									</Paragraph>{" "}
									in your pipeline
								</Paragraph>
							) : null}
							{minConfigs !== undefined && minConfigs >= 2 ? (
								<WidthDemand
									minConfigs={minConfigs}
									configCount={configCount}
								/>
							) : null}
						</div>
					</>
				) : null}
				<hr className="border-t border-zinc-800" />
				<div className="flex flex-col gap-1">
					<Paragraph size="xs">Per answer</Paragraph>
					<Paragraph as="span">
						<Paragraph as="span" className="font-bold" tone="pewter">
							Correct:
						</Paragraph>{" "}
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
										previewPerAnswer &&
										`+${previewPerAnswer.storageKbPerCorrect}KB`
									}
								/>
							</>
						) : null}
						{matchingConfigMultiplier !== undefined ? (
							<Paragraph as="span" tone="muted">
								{" "}
								(×{matchingConfigMultiplier} with a matching config)
							</Paragraph>
						) : null}
					</Paragraph>
				</div>
				<hr className="border-t border-zinc-800" />
				<div className="flex flex-col gap-1">
					<Paragraph size="xs">Outcomes</Paragraph>
					<Paragraph as="span">
						<Paragraph as="span" className="font-bold" tone="pewter">
							Succeed your build:
						</Paragraph>{" "}
						<MetricValue
							current={`+${modifiers.gateReward}KB`}
							preview={preview && `+${preview.gateReward}KB`}
						/>
						{showsCoverage ? (
							<>
								{" · "}
								<MetricValue
									current={`${coverageValue(modifiers)} coverage this gate`}
									preview={
										preview && `${coverageValue(preview)} coverage this gate`
									}
								/>
							</>
						) : null}
					</Paragraph>
					<Paragraph as="span">
						<Paragraph as="span" className="font-bold" tone="pewter">
							Fail your build:
						</Paragraph>{" "}
						<Paragraph as="span" tone="cinnabar" className="font-bold">
							{stripLabel(stripsOnFailure, configCount)}
						</Paragraph>
					</Paragraph>
					{billKb !== undefined && billKb > 0 ? (
						<Paragraph as="span" tone="muted">
							<Paragraph as="span" tone="cinnabar" className="font-bold">
								−{billKb}KB
							</Paragraph>{" "}
							storage bill — pass or fail
						</Paragraph>
					) : null}
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
