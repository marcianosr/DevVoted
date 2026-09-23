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

/**
 * What an install costs after the price on the press: the standing bill it
 * creates, which no other surface states in time to change the decision. Drawn
 * only when the install crosses a rung (ADR-098) — an install inside the rung
 * already rented has nothing to warn about and opens no panel at all.
 */
export const InstallScale = (props: InstallScaleProps) => (
	<Panel className={WIDTH}>
		<Panel.Body className={COLUMN}>
			<Typography variant="hint">{scaleLineOf(props)}</Typography>
			<Typography variant="hint">
				<Figures text={upkeepLineOf(props)} />
			</Typography>
		</Panel.Body>
	</Panel>
);
