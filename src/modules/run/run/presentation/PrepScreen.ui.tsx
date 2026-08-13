import { useState, type ReactNode } from "react";

import type { Config } from "~/modules/run/config/domain/config.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import type { GateStake } from "~/modules/run/run/application/runView.viewmodel";
import { Button } from "~/ui/Button.component";
import type { ScreenAction } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import {
	GateStakeReceipt,
	widthRefusal,
} from "~/modules/run/gate/presentation/GateStakeReceipt.ui";

type PrepScreenProps = {
	stake: GateStake;
	configs: readonly Config[];
	/** The build is on its width floor, so every drop is refused. */
	atMinimumWidth: boolean;
	startLock?: string;
	shopAction?: ScreenAction;
	onStartGate: () => void;
	onDropConfig: (configId: string) => void;
};

type PipelineChipsProps = Pick<
	PrepScreenProps,
	"configs" | "atMinimumWidth" | "onDropConfig"
> & {
	gateNumber: number;
	minConfigs: number;
	shopIsOpen: boolean;
};

const PipelineChips = ({
	configs,
	gateNumber,
	minConfigs,
	atMinimumWidth,
	shopIsOpen,
	onDropConfig,
}: PipelineChipsProps) => {
	const [pinnedId, setPinnedId] = useState<string | null>(null);

	const blockedReason = (
		<Paragraph as="span" size="sm">
			{widthRefusal(gateNumber, minConfigs, "dropping")}
		</Paragraph>
	);

	const dropPanel = (config: Config): ReactNode => (
		<span className="flex flex-col items-start gap-2">
			<Paragraph as="span" size="sm">
				{shopIsOpen
					? "Drops for nothing back. Uninstall it in the shop to bank the refund."
					: "Drops for nothing back — the shop is closed until the next gate."}
			</Paragraph>
			<Button
				variant="danger"
				size="small"
				onClick={() => {
					setPinnedId(null);
					onDropConfig(config.id);
				}}
			>
				Drop {config.label}
			</Button>
		</span>
	);

	const chipFor = (config: Config): ReactNode => {
		if (atMinimumWidth)
			return (
				<ConfigChip key={config.id} config={config} tooltip={blockedReason} />
			);
		const pinned = config.id === pinnedId;
		return (
			<ConfigChip
				key={config.id}
				config={config}
				tooltip={dropPanel(config)}
				interactiveTooltip
				tooltipHint="Click to drop"
				tooltipPinned={pinned}
				onTooltipDismiss={() => setPinnedId(null)}
				onClick={() => setPinnedId(pinned ? null : config.id)}
				ariaExpanded={pinned}
			/>
		);
	};

	return (
		<section className="flex flex-col gap-3 rounded border border-edge px-4 py-3">
			<Title as="h3">Your pipeline</Title>
			<div className="flex flex-wrap gap-2">{configs.map(chipFor)}</div>
		</section>
	);
};

export const PrepScreen = ({
	stake,
	configs,
	atMinimumWidth,
	startLock,
	shopAction,
	onStartGate,
	onDropConfig,
}: PrepScreenProps) => {
	const { gateNumber, minConfigs } = stake;
	const gateName = swatchForGate(gateNumber)?.gateName ?? `Gate ${gateNumber}`;
	return (
		<div className="flex flex-col gap-6">
			<PipelineChips
				configs={configs}
				gateNumber={gateNumber}
				minConfigs={minConfigs}
				atMinimumWidth={atMinimumWidth}
				shopIsOpen={shopAction !== undefined}
				onDropConfig={onDropConfig}
			/>
			<GateStakeReceipt
				stake={stake}
				configCount={configs.length}
				shopAction={shopAction}
			/>
			<div className="flex flex-col gap-3 sm:flex-row">
				<Button
					className="flex-1"
					onClick={onStartGate}
					disabled={startLock !== undefined}
				>
					{startLock ?? `Start ${gateName} gate →`}
				</Button>
			</div>
		</div>
	);
};
