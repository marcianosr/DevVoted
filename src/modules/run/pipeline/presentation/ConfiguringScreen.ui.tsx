import { useState } from "react";
import { clsx } from "clsx";
import type { Config } from "~/modules/run/config/domain/config.model";
import type { CheckStatus } from "~/modules/run/config/domain/effect.model";
import {
	stackMatching,
	type StarterStack,
} from "~/modules/run/config/domain/stack.model";
import { preRunRoleRows } from "~/modules/run/gate/domain/configRole.model";
import {
	MAX_SLOTS,
	perAnswerPreviewFor,
	pipelineModifiersFor,
	type PerAnswerPreview,
	type PipelineModifiers,
} from "~/modules/run/pipeline/domain/pipeline.model";
import { Button } from "~/ui/Button.component";
import { Columns } from "~/ui/Columns.ui";
import { RARITY_COLORS, type Rarity } from "~/ui/rarityColors";
import type { ScreenAction } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import { StackPicker } from "~/modules/run/config/presentation/StackPicker.ui";
import { StackPreviewList } from "~/modules/run/config/presentation/StackPreviewList.ui";
import { GateStakeReceipt } from "~/modules/run/gate/presentation/GateStakeReceipt.ui";
import { RoleList } from "~/modules/run/gate/presentation/RoleList.ui";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
	gatesCleared: number;
	pollsPerGate: number;
	/** Configs a failed window would peel at this depth (`dropCount`). */
	stripsOnFailure: number;
	modifiers: PipelineModifiers;
	perAnswer: PerAnswerPreview;
	bench: readonly Config[];
	checks: readonly CheckStatus[];
	onSlot: (configId: string) => void;
	onUnslot: (configId: string) => void;
	/**
	 * Stack mode (ADR-026): when stacks are offered, the free bench is replaced by
	 * one flavor decision and the receipt trims to its intro variant. Omit both
	 * to get the classic bench-and-pipeline drafting screen.
	 */
	stacks?: readonly StarterStack[];
	onPickStack?: (stackId: string) => void;
	/** The receipt carries its own CTA now, rather than the screen footer. */
	startAction: ScreenAction;
};

// TODO(marciano): with the family headers gone, the bench needs an order.
// Chips color by rarity (not family), so the options read differently:
// roster order (stable), rarity-clustered (colors group), family-clustered
// (old grouping, minus headers). Implement your pick here.
const benchOrder = (bench: readonly Config[]): readonly Config[] => bench;

const RARITY_LEGEND: readonly Rarity[] = [
	"common",
	"uncommon",
	"rare",
	"legendary",
];

type PanelHeadingProps = {
	title: string;
	subtitle: string;
};

const PanelHeading = ({ title, subtitle }: PanelHeadingProps) => (
	<header>
		<Title>{title}</Title>
		<Subtitle>{subtitle}</Subtitle>
	</header>
);

export const ConfiguringScreen = ({
	configs,
	slots,
	gatesCleared,
	pollsPerGate,
	stripsOnFailure,
	modifiers,
	perAnswer,
	bench,
	checks,
	onSlot,
	onUnslot,
	stacks,
	onPickStack,
	startAction,
}: ConfiguringScreenProps) => {
	const [previewId, setPreviewId] = useState<string | null>(null);
	const [customBuild, setCustomBuild] = useState(false);
	const full = configs.length >= slots;
	// No window has been played yet on this screen — the counter these rows would
	// otherwise show ("0/1") is truthful but meaningless before there's a run to
	// judge (Marciano, 2026-08-10). Only Answering/Shop/gate reports show it live.
	const rows = preRunRoleRows(configs, checks);
	const stackMode = stacks !== undefined && onPickStack !== undefined;

	if (stackMode && !customBuild) {
		return (
			<div className="grid grid-cols-1 items-start gap-8 md:grid-cols-3">
				<section className="flex flex-col gap-4 md:col-span-2">
					<Title>Pick your build</Title>
					<Paragraph tone="muted">
						Choose a stack. You can rebuild it later.
					</Paragraph>
					<StackPicker
						stacks={stacks}
						selectedStackId={stackMatching(configs)?.id}
						onPick={onPickStack}
						onCustomBuild={() => setCustomBuild(true)}
						selectedDetail={<StackPreviewList rows={rows} />}
					/>
				</section>
				<GateStakeReceipt
					gateNumber={gatesCleared}
					pollsPerGate={pollsPerGate}
					stripsOnFailure={stripsOnFailure}
					configCount={slots}
					modifiers={modifiers}
					perAnswer={perAnswer}
					configsToInstall={slots - configs.length}
					action={startAction}
				/>
			</div>
		);
	}

	const previewConfig = full
		? undefined
		: bench.find((config) => config.id === previewId);
	const next = previewConfig
		? pipelineModifiersFor([...configs, previewConfig])
		: undefined;
	const nextPerAnswer = previewConfig
		? perAnswerPreviewFor([...configs, previewConfig], gatesCleared)
		: undefined;

	const commit = (configId: string) => {
		onSlot(configId);
		setPreviewId(null);
	};

	return (
		<div className="flex flex-col gap-6">
			<Columns
				aside={
					<>
						<Paragraph tone="muted">
							Click a config to add it to your pipeline
						</Paragraph>
						<div className="flex flex-wrap gap-2">
							{benchOrder(bench).map((config) => (
								<span
									key={config.id}
									onMouseEnter={
										full ? undefined : () => setPreviewId(config.id)
									}
									onFocus={full ? undefined : () => setPreviewId(config.id)}
								>
									<ConfigChip
										config={config}
										noTooltip
										disabled={full}
										onClick={() => commit(config.id)}
									/>
								</span>
							))}
						</div>
						<div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
							{RARITY_LEGEND.map((rarity) => (
								<span
									key={rarity}
									className={clsx("text-xs", RARITY_COLORS[rarity].text)}
								>
									{rarity}
								</span>
							))}
						</div>
						{stackMode ? (
							<Button
								variant="neutral"
								size="small"
								className="self-start"
								onClick={() => setCustomBuild(false)}
							>
								← Back to stacks
							</Button>
						) : null}
					</>
				}
				main={
					<section className="flex flex-col gap-4">
						<PanelHeading
							title="Your pipeline"
							subtitle={`${configs.length} of ${slots} slots used`}
						/>
						<RoleList
							rows={rows}
							onRemove={onUnslot}
							slots={slots}
							preview={
								previewConfig
									? {
											config: previewConfig,
											onAdd: () => commit(previewConfig.id),
										}
									: undefined
							}
						/>
						{slots < MAX_SLOTS ? (
							<Paragraph size="xs" tone="faint">
								More slots will unlock when you gain coverage!
							</Paragraph>
						) : null}
						<GateStakeReceipt
							gateNumber={gatesCleared}
							pollsPerGate={pollsPerGate}
							stripsOnFailure={stripsOnFailure}
							configCount={configs.length}
							modifiers={modifiers}
							preview={next}
							perAnswer={perAnswer}
							previewPerAnswer={nextPerAnswer}
							action={startAction}
						/>
					</section>
				}
			/>
		</div>
	);
};
