import { CARD_FLOW, ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { DexPanel } from "./DexPanel.ui";
import { discloseAllFor } from "./DiscloseAll.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";
import { Weight } from "./Weight.ui";

const SECTION = "flex w-full flex-col gap-3";
const HEADING = "flex items-center gap-2";
const RULE = "min-w-8 flex-1 border-t border-theme-faint";
const LIST = `grid w-full gap-3 ${CARD_FLOW}`;

export type DexConfigCard = ConfigChipProps & { id: string };

export type DexWeightGroup = {
	weight: number;
	label: string;
	held: string;
	chips: readonly DexConfigCard[];
};

export type DexConfigsData = {
	groups: readonly DexWeightGroup[];
	count: string;
	meta: string;
	note: string;
};

export type DexConfigsProps = DexConfigsData & {
	openInfo?: ReadonlySet<string>;
	onToggleInfo?: (id: string) => void;
	onToggleAll?: () => void;
};

const cardCountOf = (groups: readonly DexWeightGroup[]) =>
	groups.reduce((total, group) => total + group.chips.length, 0);

export const DexConfigs = ({
	groups,
	count,
	meta,
	note,
	openInfo,
	onToggleInfo,
	onToggleAll,
}: DexConfigsProps) => (
	<DexPanel
		label="configs"
		count={count}
		meta={meta}
		note={note}
		trailing={discloseAllFor({ openInfo, onToggleAll }, cardCountOf(groups))}
	>
		<Panel.Body>
			{groups.map((group) => (
				<div key={group.weight} className={SECTION}>
					<div className={HEADING}>
						<Weight slots={group.weight} />
						<Typography variant="subtitle" as="span">
							{group.label}
						</Typography>
						<Typography variant="hint" as="span">
							{group.held}
						</Typography>
						<span aria-hidden className={RULE} />
					</div>

					<div className={LIST}>
						{group.chips.map(({ id, ...card }) => (
							<ConfigChip
								key={id}
								{...card}
								infoOpen={openInfo?.has(id) ?? false}
								onToggleInfo={
									onToggleInfo === undefined
										? undefined
										: () => onToggleInfo(id)
								}
							/>
						))}
					</div>
				</div>
			))}
		</Panel.Body>
	</DexPanel>
);
