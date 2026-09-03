import { Redacted } from "../Redacted.ui";
import { kbLabel, RentText, type StorageRung } from "../StoragePlan.ui";
import { Text } from "../Text.ui";

const LIST = "flex flex-col divide-y divide-edge py-2";
const ROW = "flex min-h-9 items-center gap-3";
const CAP = "w-24 shrink-0 font-bold";

export type StoragePanelProps = {
	rungs: readonly StorageRung[];
	locked?: boolean;
};

const RungRow = ({ rung, locked }: { rung: StorageRung; locked: boolean }) => {
	if (locked) {
		return (
			<div className={ROW}>
				<Redacted />
			</div>
		);
	}

	return (
		<div className={ROW}>
			<Text className={CAP}>{kbLabel(rung.capKb)}</Text>
			<RentText rentKb={rung.rentKb} />
		</div>
	);
};

export const StoragePanel = ({ rungs, locked = false }: StoragePanelProps) => (
	<div className={LIST}>
		{rungs.map((rung) => (
			<RungRow key={rung.capKb} rung={rung} locked={locked} />
		))}
	</div>
);
