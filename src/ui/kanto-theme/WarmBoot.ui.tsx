import { Panel } from "./Panel.ui";
import { Pick, type PickProps } from "./Pick.ui";
import {
	RegistryControl,
	type RegistryControlLayout,
	type RegistryControlProps,
} from "./RegistryControl.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	title: "Warm boot",
} as const;

const ROW_LAYOUT: RegistryControlLayout = "row";

export type WarmBootRow = RegistryControlProps & {
	id: string;
	pick?: PickProps;
};

export type WarmBootProps = {
	rows: readonly WarmBootRow[];
	meta: string;
	note?: string;
};

export const WarmBoot = ({ rows, meta, note }: WarmBootProps) => (
	<Panel>
		<Panel.Header label={COPY.title} meta={meta} />
		<Panel.Rows>
			{rows.map(({ id, pick, ...control }) => (
				<Panel.Row
					key={id}
					trailing={pick === undefined ? undefined : <Pick {...pick} />}
				>
					<RegistryControl {...control} layout={ROW_LAYOUT} />
				</Panel.Row>
			))}
		</Panel.Rows>
		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{note}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
