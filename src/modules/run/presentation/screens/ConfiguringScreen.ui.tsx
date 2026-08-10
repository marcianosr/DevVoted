import { useState } from "react";
import { clsx } from "clsx";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import {
	stackMatching,
	type StarterStack,
} from "~/modules/run/configs/stack.model";
import { preRunRoleRows } from "~/modules/run/gate/configRole.model";
import {
	MAX_SLOTS,
	pipelineModifiersFor,
	type PipelineModifiers,
} from "~/modules/run/pipeline/pipeline.model";
import { Button } from "~/ui/Button.component";
import { Columns } from "~/ui/Columns.ui";
import { RARITY_COLORS, type Rarity } from "~/ui/rarityColors";
import { TerminalPanel } from "~/ui/TerminalPanel.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { StackPicker } from "../configs/StackPicker.ui";
import { StackPreviewList } from "../configs/StackPreviewList.ui";
import { GateStakeReceipt } from "../gate/GateStakeReceipt.ui";
import { RoleList } from "../gate/RoleList.ui";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
	gatesCleared: number;
	pollsPerGate: number;
	/** Configs a failed window would peel at this depth (`dropCount`). */
	stripsOnFailure: number;
	modifiers: PipelineModifiers;
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
	bench,
	checks,
	onSlot,
	onUnslot,
	stacks,
	onPickStack,
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
				<div className="md:col-span-2">
					<TerminalPanel title="Pick your stack">
						<Paragraph tone="muted">
							Choose a stack. You can rebuild it later.
						</Paragraph>
						<StackPicker
							stacks={stacks}
							selectedStackId={stackMatching(configs)?.id}
							onPick={onPickStack}
							onCustomBuild={() => setCustomBuild(true)}
							// The picked stack IS the pipeline, so its row expands into a
							// trimmed preview: demand + payoff, always visible; a linter's
							// fee waits behind its own "more details" tap (Marciano,
							// 2026-08-10 — "preset view = what matters for choosing").
							selectedDetail={<StackPreviewList rows={rows} />}
						/>
					</TerminalPanel>
				</div>
				<GateStakeReceipt
					gateNumber={gatesCleared}
					pollsPerGate={pollsPerGate}
					stripsOnFailure={stripsOnFailure}
					// The committed build always fills every slot (the start guard), so
					// the stake reads against the pipeline the stack is about to become —
					// an unpicked screen must not open on "Strip all — run over".
					configCount={slots}
					modifiers={modifiers}
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

	const commit = (configId: string) => {
		onSlot(configId);
		setPreviewId(null);
	};

	return (
		<div className="flex flex-col gap-6">
			<Columns
				aside={
					<TerminalPanel title="Starter configs">
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
					</TerminalPanel>
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
						/>
					</section>
				}
			/>
		</div>
	);
};
