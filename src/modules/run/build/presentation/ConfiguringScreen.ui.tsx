import { useState } from "react";
import {
	type Config,
	largestSizeFitting,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { roleRows } from "~/modules/run/gate/domain/configRole.model";
import type { GateStake } from "~/modules/run/run/application/gateStake.viewmodel";
import {
	perAnswerPreviewFor,
	buildModifiersFor,
} from "~/modules/run/build/domain/build.model";
import { SlotTrack } from "~/ui/modern-theme/SlotTrack.ui";
import { Columns } from "~/ui/Columns.ui";
import type { ScreenAction } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { Badge } from "~/ui/Badge.component";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import { GateStakeReceipt } from "~/modules/run/gate/presentation/GateStakeReceipt.ui";
import { RoleList } from "~/modules/run/gate/presentation/RoleList.ui";
import { MAX_SLOTS } from "~/modules/run/run/domain/rules.model";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
	slotsUsed: number;
	slotsFree: number;
	stake: GateStake;
	bench: readonly Config[];
	recommended: readonly string[];
	onInstall: (configId: string) => void;
	onUninstall: (configId: string) => void;
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
		slots: slotsOf(config),
		minified: config.minified,
	}));

const PanelHeading = ({ title, subtitle }: PanelHeadingProps) => (
	<header>
		<Title>{title}</Title>
		<Subtitle>{subtitle}</Subtitle>
	</header>
);

export const ConfiguringScreen = ({
	configs,
	slots,
	slotsUsed,
	slotsFree,
	stake,
	bench,
	recommended,
	onInstall,
	onUninstall,
	startAction,
}: ConfiguringScreenProps) => {
	const { gateNumber } = stake;
	const [previewId, setPreviewId] = useState<string | null>(null);
	const full = slotsFree === 0;
	const rows = roleRows(configs);

	const previewConfig = full
		? undefined
		: bench.find((config) => config.id === previewId);
	const next = previewConfig
		? buildModifiersFor([...configs, previewConfig], stake.gateNumber)
		: undefined;
	const nextPerAnswer = previewConfig
		? perAnswerPreviewFor([...configs, previewConfig], gateNumber)
		: undefined;

	const commit = (configId: string) => {
		onInstall(configId);
		setPreviewId(null);
	};

	return (
		<div className="flex flex-col gap-6">
			<Columns
				aside={
					<>
						<Paragraph tone="muted">
							Click a config to add it to your build. One is enough to start;
							two are marked as a suggested opening.
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
										badge={
											recommended.includes(config.id) ? (
												<Badge tone="positive" size="corner">
													suggested
												</Badge>
											) : undefined
										}
									/>
								</span>
							))}
						</div>
					</>
				}
				main={
					<section className="flex flex-col gap-4">
						<PanelHeading
							title="Your build"
							subtitle={`${slotsUsed} of ${slots} slots used`}
						/>
						<SlotTrack
							configs={trackBars(configs)}
							slots={slots}
							maxSlots={MAX_SLOTS}
							fits={largestSizeFitting(slotsFree)}
						/>
						<RoleList
							rows={rows}
							onRemove={onUninstall}
							freeSlots={slotsFree}
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
							<Paragraph size="xs" tone="muted">
								Buy slots in the shop to widen the build, up to {MAX_SLOTS}{" "}
								slots.
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
