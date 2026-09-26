import { Figures } from "./Figures.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";
import { upkeepLabelOf } from "./upkeep";

const WIDTH = "w-72";
const COLUMN = "flex flex-col gap-1";

const SCALE_LEAD = "Build space scales";
const ARROW = "→";
const UPKEEP_LEAD = "Upkeep becomes";

export type InstallScaleProps = {
	from: number;
	to: number;
	perGateKb: number;
};

export const scaleLineOf = ({ from, to }: InstallScaleProps): string =>
	`${SCALE_LEAD} ${from} ${ARROW} ${to}`;

export const upkeepLineOf = ({ perGateKb }: InstallScaleProps): string =>
	`${UPKEEP_LEAD} ${upkeepLabelOf(perGateKb)}`;

export const InstallScale = (props: InstallScaleProps) => (
	<Panel className={WIDTH}>
		<Panel.Body className={COLUMN}>
			{props.from === props.to ? null : (
				<Typography variant="hint">{scaleLineOf(props)}</Typography>
			)}
			<Typography variant="hint">
				<Figures text={upkeepLineOf(props)} />
			</Typography>
		</Panel.Body>
	</Panel>
);
