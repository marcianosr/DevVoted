import { formatStorage } from "~/shared/lib/storage";
import { Button } from "~/ui/old-theme/Button.component";

const COPY = {
	unequip: "Unequip",
	equip: "Equip",
	buy: "Buy",
	locked: "Locked",
} as const;

export type BorderCardProps = {
	image: string;
	cost: number;
	owned: boolean;
	equipped: boolean;
	canAfford: boolean;
	isMutating: boolean;
	onPress: () => void;
};

const labelFor = ({
	owned,
	equipped,
	canAfford,
	cost,
}: Pick<BorderCardProps, "owned" | "equipped" | "canAfford" | "cost">) => {
	if (owned) return equipped ? COPY.unequip : COPY.equip;
	return `${canAfford ? COPY.buy : COPY.locked} · ${formatStorage(cost)}`;
};

export const BorderCard = ({
	image,
	cost,
	owned,
	equipped,
	canAfford,
	isMutating,
	onPress,
}: BorderCardProps) => (
	<div className="border border-gray-800 p-3 flex flex-col gap-2">
		<div className="aspect-square bg-black/40 flex items-center justify-center">
			<img src={image} alt="" className="max-w-full max-h-full" />
		</div>
		<div className="mt-auto pt-2">
			<Button
				size="small"
				onClick={onPress}
				disabled={isMutating || (!owned && !canAfford)}
				className="w-full"
			>
				{labelFor({ owned, equipped, canAfford, cost })}
			</Button>
		</div>
	</div>
);
