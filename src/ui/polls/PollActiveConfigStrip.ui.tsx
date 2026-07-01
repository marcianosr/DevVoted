import { EmptyMessageLine } from "~/ui/EmptyMessageLine.component";
import { ConfigCard } from "~/ui/economy/ConfigCard.ui";
import { Popover } from "~/ui/Popover.component";
import type { Rarity } from "~/ui/rarityColors";

export type ActivePollConfig = {
	id: string;
	name: string;
	description: string;
	rarity: Rarity;
};

type PollActiveConfigStripProps = {
	configs: ActivePollConfig[];
};

export const PollActiveConfigStrip = ({
	configs,
}: PollActiveConfigStripProps) => (
	<div className="flex flex-col gap-2 bg-zinc-900 px-3 py-2.5">
		{configs.length === 0 ? (
			<EmptyMessageLine>No installed config affects this poll</EmptyMessageLine>
		) : (
			<>
				<span className="text-gray-300">Active configs for this poll</span>
				<div className="flex items-center gap-3 flex-wrap">
					{configs.map((config) => (
						<Popover
							key={config.id}
							ariaLabel={`${config.name} config details`}
							content={<p className="max-w-xs text-sm">{config.description}</p>}
						>
							<ConfigCard
								name={config.name}
								rarity={config.rarity}
								size="small"
							/>
						</Popover>
					))}
				</div>
			</>
		)}
	</div>
);
