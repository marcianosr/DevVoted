import { DexBrowser, DexDetail } from "./DexBrowser.ui";
import { Panel } from "./Panel.ui";
import {
	RegistryControl,
	type RegistryControlProps,
} from "./RegistryControl.ui";
import { Typography } from "./Typography.ui";

const FACTS = "flex flex-col gap-2";

const NOTHING_YET = "—";
const NOTHING_HERE = "No service yet.";

export type DexControlRow = RegistryControlProps & { id: string };

export type DexControlDetail = {
	label: string;
	control: RegistryControlProps;
	availability: string;
};

export type DexControlsData = {
	rows: readonly DexControlRow[];
	selectedId: string | null;
	detail: DexControlDetail | null;
	count: string;
	meta: string;
	note: string;
};

export type DexControlsProps = DexControlsData & {
	onSelect?: (id: string) => void;
};

const Detail = ({ detail }: { detail: DexControlDetail | null }) => {
	if (detail === null)
		return <DexDetail label={NOTHING_YET}>{NOTHING_HERE}</DexDetail>;

	return (
		<DexDetail label={detail.label}>
			<div className={FACTS}>
				<RegistryControl {...detail.control} />
				<Typography variant="hint">{detail.availability}</Typography>
			</div>
		</DexDetail>
	);
};

export const DexControls = ({
	rows,
	selectedId,
	detail,
	count,
	meta,
	note,
	onSelect,
}: DexControlsProps) => (
	<DexBrowser
		label="services"
		count={count}
		meta={meta}
		note={note}
		rows={rows.map(({ id, ...row }) => (
			<Panel.Row
				key={id}
				picked={id === selectedId}
				onPress={onSelect === undefined ? undefined : () => onSelect(id)}
			>
				<RegistryControl {...row} layout="row" />
			</Panel.Row>
		))}
		detail={<Detail detail={detail} />}
	/>
);
