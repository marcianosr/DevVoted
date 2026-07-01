import { clsx } from "clsx";

import { RARITY_COLORS } from "~/domains/economy/components/Cards/ConfigCard.component";
import type { Config } from "~/domains/economy/models/config.model";
import { Popover } from "~/ui/Popover.component";

export type ActivePollConfig = {
	id: string;
	name: string;
	description: string;
	rarity: Config["rarity"];
};

type PollActiveConfigStripProps = {
	configs: ActivePollConfig[];
};

/**
 * Shows which installed configs affect the current poll as small Balatro-Joker
 * style cards, tinted by rarity, under a heading. When nothing applies, the
 * heading is replaced by an "on your own" message.
 */
export const PollActiveConfigStrip = ({
	configs,
}: PollActiveConfigStripProps) =>
	configs.length === 0 ? (
		<div className="bg-zinc-900 px-3 py-2.5">
			<span className="text-gray-300">
				No installed config affects this poll
			</span>
		</div>
	) : (
		<div className="flex flex-col gap-2 bg-zinc-900 px-3 py-2.5">
			<span className="text-gray-300">Active configs for this poll</span>
			<div className="flex items-center gap-3 flex-wrap">
				{configs.map((config) => {
					const rarity = RARITY_COLORS[config.rarity];
					return (
						<Popover
							key={config.id}
							ariaLabel={`${config.name} config details`}
							content={<p className="max-w-xs text-sm">{config.description}</p>}
						>
							<div
								className={clsx(
									"shrink-0 border px-3 py-1.5 min-w-28 transition-transform hover:scale-105 hover:-rotate-1",
									rarity.border,
									rarity.bg
								)}
							>
								<div
									className={clsx(
										"font-mono text-[10px] lowercase",
										rarity.text
									)}
								>
									({config.rarity})
								</div>
								<div className={clsx("text-sm", rarity.text)}>
									{config.name}
								</div>
							</div>
						</Popover>
					);
				})}
			</div>
		</div>
	);
