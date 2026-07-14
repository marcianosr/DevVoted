import type { Config } from "~/modules/session-run/configs/config.model";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { Pipeline } from "./Pipeline.ui";

type LoadoutProps = {
	configs: readonly Config[];
	slots: number;
	newConfigIds?: readonly string[];
	onRemove?: (configId: string) => void;
};

export const Loadout = ({
	configs,
	slots,
	newConfigIds,
	onRemove,
}: LoadoutProps) => (
	<section className="flex flex-col gap-2">
		<header>
			<Title as="h2">Your load-out</Title>
			<Subtitle>Your configured pipeline requirements and perks</Subtitle>
		</header>
		<Pipeline
			configs={configs}
			slots={slots}
			newConfigIds={newConfigIds}
			onRemove={onRemove}
		/>
	</section>
);
