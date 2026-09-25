import { DexPanel } from "./DexPanel.ui";
import { Panel } from "./Panel.ui";
import {
	RegistryControl,
	type RegistryControlProps,
} from "./RegistryControl.ui";

/**
 * A service row states where it is bought and never a press: the Dex reveals
 * what is sold, and buying stays where the run pays for it (ADR-029).
 */
export type DexControlRow = RegistryControlProps & { id: string };

export type DexControlsProps = {
	rows: readonly DexControlRow[];
	count: string;
	meta: string;
	note: string;
};

export const DexControls = ({ rows, count, meta, note }: DexControlsProps) => (
	<DexPanel label="services" count={count} meta={meta} note={note}>
		<Panel.Rows>
			{rows.map(({ id, ...row }) => (
				<Panel.Row key={id}>
					<RegistryControl {...row} layout="row" />
				</Panel.Row>
			))}
		</Panel.Rows>
	</DexPanel>
);
