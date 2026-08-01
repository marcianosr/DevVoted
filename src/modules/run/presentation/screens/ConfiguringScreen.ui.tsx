import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { Columns } from "~/ui/Columns.ui";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RoleList } from "../gate/RoleList.ui";
import { StatBadge } from "../run/StatBadge.ui";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
	bench: readonly Config[];
	checks: readonly CheckStatus[];
	gateReward: number;
	rewardMultiplier: number;
	coverageMultiplier: number;
	coverageAdd: number;
	onSlot: (configId: string) => void;
	onUnslot: (configId: string) => void;
};

// TODO(marciano): with the family headers gone, the bench needs an order.
// Chips color by rarity (not family), so the options read differently:
// roster order (stable), rarity-clustered (colors group), family-clustered
// (old grouping, minus headers). Implement your pick here.
const benchOrder = (bench: readonly Config[]): readonly Config[] => bench;

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

const coverageValue = (coverageMultiplier: number, coverageAdd: number) =>
	`×${coverageMultiplier}${coverageAdd > 0 ? ` +${coverageAdd}%` : ""}`;

export const ConfiguringScreen = ({
	configs,
	slots,
	bench,
	checks,
	gateReward,
	rewardMultiplier,
	coverageMultiplier,
	coverageAdd,
	onSlot,
	onUnslot,
}: ConfiguringScreenProps) => {
	const full = configs.length >= slots;
	const rows = roleRows(configs, checks);

	return (
		<Columns
			aside={
				<section className="space-y-2">
					<PanelHeading
						title="Available configs"
						subtitle="Click to add to your pipeline"
					/>
					<div className="flex flex-wrap gap-2">
						{benchOrder(bench).map((config) => (
							<ConfigChip
								key={config.id}
								config={config}
								action={full ? undefined : "＋"}
								onClick={full ? undefined : () => onSlot(config.id)}
							/>
						))}
					</div>
				</section>
			}
			main={
				<section>
					<PanelHeading
						title="Your pipeline"
						subtitle={`${configs.length} of ${slots} slots used`}
					/>
					<RoleList
						rows={rows}
						layout="stacked"
						onRemove={onUnslot}
						slots={slots}
					/>
					<div className="flex flex-wrap gap-8 border-t border-zinc-700 pt-4">
						<StatBadge
							label="Reward on gate clear"
							value={`+${gateReward}KB`}
							valueTone="gradient"
						/>
						<StatBadge
							label="Reward multiplier"
							value={`×${rewardMultiplier}`}
							valueTone="gradient"
						/>
						<StatBadge
							label="Coverage multiplier"
							value={coverageValue(coverageMultiplier, coverageAdd)}
							valueTone="gradient"
						/>
					</div>
				</section>
			}
		/>
	);
};
