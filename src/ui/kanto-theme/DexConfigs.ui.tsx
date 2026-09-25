import { DexConfigChip, type DexConfigChipProps } from "./DexConfigChip.ui";
import { DexPanel } from "./DexPanel.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const SECTION = "flex w-full flex-col gap-2";
const ROW = "flex flex-wrap items-center gap-3";

/** One row of chips per weight, headed "2 weight · 4 of 14". */
export type DexWeightGroup = {
	weight: number;
	heading: string;
	chips: readonly DexConfigChipProps[];
};

/** What the presenter derives from the domain, with no wiring in it. */
export type DexConfigsData = {
	groups: readonly DexWeightGroup[];
	count: string;
	meta: string;
	note: string;
};

export type DexConfigsProps = DexConfigsData & {
	/** The one chip whose hint is pinned open, by config id. */
	openInfo?: string;
	onToggleInfo?: (id: string) => void;
};

export const DexConfigs = ({
	groups,
	count,
	meta,
	note,
	openInfo,
	onToggleInfo,
}: DexConfigsProps) => (
	<DexPanel label="configs" count={count} meta={meta} note={note}>
		<Panel.Body>
			{groups.map((group) => (
				<div key={group.weight} className={SECTION}>
					<Typography variant="hint">{group.heading}</Typography>
					<div className={ROW}>
						{group.chips.map((chip) => (
							<DexConfigChip
								key={chip.id}
								{...chip}
								infoOpen={chip.id === openInfo}
								onToggleInfo={
									onToggleInfo === undefined
										? undefined
										: () => onToggleInfo(chip.id)
								}
							/>
						))}
					</div>
				</div>
			))}
		</Panel.Body>
	</DexPanel>
);
