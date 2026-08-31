import {
	baseSlotsOf,
	CONFIG_SIZES,
	DRAFT_COST_PER_SLOT_KB,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import { plural } from "~/ui/modern-theme/format";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

const SIZES_LARGEST_FIRST = [...CONFIG_SIZES].reverse();

const HEADER = "flex items-center gap-3";
const NAME = "text-xs font-bold uppercase tracking-wide text-zinc-200";
const FIGURES = "flex items-center gap-3 text-xs text-zinc-500";
const COUNT = "ml-auto text-xs tabular-nums text-zinc-500";

export const ConfigdexPanel = () => {
	const configs = Object.values(CONFIGS);
	const total = configs.length;

	return (
		<Stack gap="6">
			<Paragraph tone="muted">
				{total}/{total} collected
			</Paragraph>
			{SIZES_LARGEST_FIRST.map((size) => {
				const group = configs.filter((config) => baseSlotsOf(config) === size);
				if (group.length === 0) return null;

				return (
					<div key={size} className="flex flex-col gap-3">
						<header className={HEADER}>
							<p className={NAME}>{plural(size, "slot")}</p>
							<span className={FIGURES}>
								<span>{DRAFT_COST_PER_SLOT_KB * size} KB</span>
							</span>
							<p className={COUNT}>
								{group.length}/{group.length}
							</p>
						</header>
						<div className="flex flex-wrap gap-2">
							{group.map((config) => (
								<ConfigChip key={config.id} config={config} />
							))}
						</div>
					</div>
				);
			})}
		</Stack>
	);
};
