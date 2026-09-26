import { clsx } from "clsx";

import { formatStorage } from "~/shared/lib/storage";
import { Button } from "~/ui/kanto-theme/Button.ui";

const COPY = {
	unequip: "Take off",
	equip: "Wear",
	buy: "Buy",
	locked: "Locked",
	worn: "worn",
} as const;

const CARD =
	"flex flex-col gap-2 rounded-lg border border-theme-faint bg-theme-raised p-3";
const CARD_WORN = "ring-2 ring-viridian";
const FRAME =
	"flex aspect-square items-center justify-center rounded-md bg-theme-faint";
const IMAGE = "max-h-full max-w-full";
const NAME = "truncate text-xs font-bold text-theme-soft";
const PRESS = "mt-auto flex";

export type BorderCardProps = {
	name: string;
	image: string;
	cost: number;
	owned: boolean;
	equipped: boolean;
	canAfford: boolean;
	isMutating: boolean;
	onPress: () => void;
};

export const labelFor = ({
	owned,
	equipped,
	canAfford,
	cost,
}: Pick<BorderCardProps, "owned" | "equipped" | "canAfford" | "cost">) => {
	if (owned) return equipped ? COPY.unequip : COPY.equip;
	return `${canAfford ? COPY.buy : COPY.locked} · ${formatStorage(cost)}`;
};

export const BorderCard = ({
	name,
	image,
	cost,
	owned,
	equipped,
	canAfford,
	isMutating,
	onPress,
}: BorderCardProps) => (
	<div className={clsx(CARD, equipped && CARD_WORN)}>
		<div className={FRAME}>
			<img src={image} alt="" className={IMAGE} />
		</div>
		<span className={NAME}>{name}</span>
		<span className={PRESS}>
			<Button
				size="sm"
				tone={equipped ? "ambient" : "action"}
				label={labelFor({ owned, equipped, canAfford, cost })}
				onPress={onPress}
				disabled={isMutating || (!owned && !canAfford)}
			/>
		</span>
	</div>
);
