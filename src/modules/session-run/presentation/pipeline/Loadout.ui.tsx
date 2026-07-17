import type { ReactNode } from "react";
import type { Config } from "~/modules/session-run/configs/config.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import type { ChipAction } from "../configs/ConfigActions.ui";
import { Pipeline } from "./Pipeline.ui";

type LoadoutProps = {
	configs: readonly Config[];
	slots: number;
	/** When set, the heading names the gate this load-out is heading into. */
	gateNumber?: number;
	gateReward?: number;
	newConfigIds?: readonly string[];
	onRemove?: (configId: string) => void;
	actionsFor?: (config: Config) => readonly ChipAction[];
	trailing?: ReactNode;
};

export const Loadout = ({
	configs,
	slots,
	gateNumber,
	gateReward,
	newConfigIds,
	onRemove,
	actionsFor,
	trailing,
}: LoadoutProps) => (
	<section className="flex flex-col gap-2">
		<header>
			<Title as="h2" size="md">
				Your load-out{gateNumber !== undefined ? ` for gate ${gateNumber}` : ""}
			</Title>
			{gateReward !== undefined ? (
				<Subtitle>
					Clears for{" "}
					<Paragraph as="span" size="sm" tone="gradient">
						{gateReward}KB
					</Paragraph>{" "}
					— heavier requirements pay more, easier builds pay less
				</Subtitle>
			) : (
				<Subtitle>Your configured pipeline requirements and perks</Subtitle>
			)}
			{actionsFor ? (
				<Subtitle>Click a config to sell or upgrade it.</Subtitle>
			) : null}
		</header>
		<Pipeline
			configs={configs}
			slots={slots}
			newConfigIds={newConfigIds}
			onRemove={onRemove}
			actionsFor={actionsFor}
			trailing={trailing}
		/>
	</section>
);
