import { useState } from "react";
import {
	type Config,
	largestGradeFitting,
	rarityOf,
	spotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	stackMatching,
	type StarterStack,
} from "~/modules/run/config/domain/stack.model";
import { roleRows } from "~/modules/run/gate/domain/configRole.model";
import type { GateStake } from "~/modules/run/run/application/gateStake.viewmodel";
import {
	MAX_SPOTS,
	perAnswerPreviewFor,
	pipelineModifiersFor,
} from "~/modules/run/pipeline/domain/pipeline.model";
import { Button } from "~/ui/Button.component";
import { SpotTrack } from "~/ui/modern-theme/SpotTrack.ui";
import { Columns } from "~/ui/Columns.ui";
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
	spots: number;
	spotsUsed: number;
	spotsFree: number;
	overflowSpots: number;
	stake: GateStake;
	bench: readonly Config[];
	onSlot: (configId: string) => void;
	onUnslot: (configId: string) => void;
	stacks?: readonly StarterStack[];
	onPickStack?: (stackId: string) => void;
	startAction: ScreenAction;
};

const benchOrder = (bench: readonly Config[]): readonly Config[] => bench;

type PanelHeadingProps = {
	title: string;
	subtitle: string;
};

const trackBars = (configs: readonly Config[]) =>
	configs.map((config) => ({
		id: config.id,
		label: config.label,
		spots: spotsOf(config),
		minified: config.minified,
		rarity: rarityOf(config),
	}));

const PanelHeading = ({ title, subtitle }: PanelHeadingProps) => (
	<header>
		<Title>{title}</Title>
		<Subtitle>{subtitle}</Subtitle>
	</header>
);

export const ConfiguringScreen = ({
	configs,
	spots,
	spotsUsed,
	spotsFree,
	overflowSpots,
	stake,
	bench,
	onSlot,
	onUnslot,
	stacks,
	onPickStack,
	startAction,
}: ConfiguringScreenProps) => {
	const { gateNumber } = stake;
	const [previewId, setPreviewId] = useState<string | null>(null);
	const [customBuild, setCustomBuild] = useState(false);
	const full = spotsFree === 0;
	const rows = roleRows(configs);
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
					stake={stake}
					overflowSpots={overflowSpots}
					action={startAction}
				/>
			</div>
		);
	}

	const previewConfig = full
		? undefined
		: bench.find((config) => config.id === previewId);
	const next = previewConfig
		? pipelineModifiersFor([...configs, previewConfig], stake.gateNumber)
		: undefined;
	const nextPerAnswer = previewConfig
		? perAnswerPreviewFor([...configs, previewConfig], gateNumber)
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
							subtitle={`${spotsUsed} of ${spots} spots used`}
						/>
						<SpotTrack
							configs={trackBars(configs)}
							spots={spots}
							maxSpots={MAX_SPOTS}
							fits={largestGradeFitting(spotsFree)}
						/>
						<RoleList
							rows={rows}
							onRemove={onUnslot}
							freeSpots={spotsFree}
							preview={
								previewConfig
									? {
											config: previewConfig,
											onAdd: () => commit(previewConfig.id),
										}
									: undefined
							}
						/>
						{spots < MAX_SPOTS ? (
							<Paragraph size="xs" tone="muted">
								Clearing gates widens the pipeline, and the shop rents spots on
								top, up to {MAX_SPOTS} spots.
							</Paragraph>
						) : null}
						<GateStakeReceipt
							stake={stake}
							preview={next}
							previewPerAnswer={nextPerAnswer}
							action={startAction}
						/>
					</section>
				}
			/>
		</div>
	);
};
