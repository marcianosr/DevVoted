import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Figures } from "./Figures.ui";
import type { IconName } from "./Icon.ui";
import { Meter, type MeterProps } from "./Meter.ui";
import { PanelV2 } from "./PanelV2.ui";
import { Typography } from "./Typography.ui";

const CHOICE = "flex w-full flex-col gap-3";
const ARMS = "flex w-full flex-col gap-4";
const ARM_ACTION = "flex w-full justify-end";
const DROP_HEAD = "flex w-full flex-wrap items-baseline gap-3";
const DROP_NOTE = "shrink-0 sm:ml-auto";
const DROP_ROWS = "flex w-full flex-col gap-2";

const OWED_COLOR: KantoColor = "cinnabar";
const BRIBE_DETAIL_ON = "always";
const REFUSAL_TONE = "danger";
const ACTION_SIZE = "sm";

export type GatePeelBribe = {
	label: string;
	balance: string;
	shortfall?: string;
	onPress?: () => void;
};

export type GateDrop = {
	title: string;
	note: string;
	configs: readonly ConfigChipProps[];
};

export type GatePeelArm = {
	title: string;
	owed: string;
	meter: MeterProps;
	note: string;
	bribe: GatePeelBribe;
	drop: GateDrop;
};

export type GateRefusalAction = {
	label: string;
	icon?: IconName;
	onPress?: () => void;
};

export type GateRefusalArm = {
	title: string;
	price: string;
	note: string;
	action: GateRefusalAction;
};

export type GateChoiceProps = {
	title: string;
	peel: GatePeelArm;
	refusal: GateRefusalArm;
};

const PeelArm = ({ title, owed, meter, note, bribe, drop }: GatePeelArm) => (
	<PanelV2>
		<PanelV2.Header label={title} badge={{ label: owed, color: OWED_COLOR }} />

		<PanelV2.Body>
			<Meter {...meter} />
			<Typography variant="hint">{note}</Typography>

			<Button
				size={ACTION_SIZE}
				label={bribe.label}
				cap={bribe.balance}
				detail={bribe.shortfall}
				detailOn={BRIBE_DETAIL_ON}
				disabled={bribe.onPress === undefined}
				onPress={bribe.onPress}
			/>

			<div className={DROP_HEAD}>
				<Typography variant="label" as="h3">
					{drop.title}
				</Typography>
				<span className={DROP_NOTE}>
					<Typography variant="hint" as="span">
						{drop.note}
					</Typography>
				</span>
			</div>

			<div className={DROP_ROWS}>
				{drop.configs.map((config, index) => (
					<ConfigChip key={index} {...config} />
				))}
			</div>
		</PanelV2.Body>
	</PanelV2>
);

const RefusalArm = ({ title, price, note, action }: GateRefusalArm) => (
	<PanelV2>
		<PanelV2.Header label={title} meta={<Figures text={price} />} />

		<PanelV2.Body>
			<Typography variant="hint">{note}</Typography>

			<div className={ARM_ACTION}>
				<Button
					size={ACTION_SIZE}
					tone={REFUSAL_TONE}
					label={action.label}
					icon={action.icon}
					disabled={action.onPress === undefined}
					onPress={action.onPress}
				/>
			</div>
		</PanelV2.Body>
	</PanelV2>
);

export const GateChoice = ({ title, peel, refusal }: GateChoiceProps) => (
	<section className={CHOICE}>
		<Typography variant="title" as="h2">
			{title}
		</Typography>
		<div className={ARMS}>
			<PeelArm {...peel} />
			<RefusalArm {...refusal} />
		</div>
	</section>
);
