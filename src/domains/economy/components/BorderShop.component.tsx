import { borders } from "~/domains/economy/data/borders";
import {
	useArchiveState,
	useEquipBorder,
	usePurchaseBorder,
} from "~/domains/economy/hooks/useArchiveState";
import type { Border } from "~/domains/economy/models/border.model";
import { formatStorage } from "~/lib/storage";
import { Button } from "~/ui/Button.component";

type BorderShopProps = {
	userId: string;
};

// Rarity styling parked until shop visual design is locked. Reinstate by
// mapping border.rarity → ring-<color> classes on the card wrapper.
// const rarityRingClass: Record<BorderRarity, string> = {
// 	common: "ring-gray-500",
// 	rare: "ring-cyan-400",
// 	epic: "ring-fuchsia-500",
// 	legendary: "ring-amber-300 animate-pulse",
// };

type BorderCardProps = {
	border: Border;
	owned: boolean;
	equipped: boolean;
	canAfford: boolean;
	onPurchase: () => void;
	onEquip: () => void;
	onUnequip: () => void;
	isMutating: boolean;
};

const BorderCard = ({
	border,
	owned,
	equipped,
	canAfford,
	onPurchase,
	onEquip,
	onUnequip,
	isMutating,
}: BorderCardProps) => {
	const handleClick = () => {
		if (!owned) return onPurchase();
		if (equipped) return onUnequip();
		return onEquip();
	};

	const label = owned
		? equipped
			? "Unequip"
			: "Equip"
		: canAfford
			? `Buy · ${formatStorage(border.cost)}`
			: `Locked · ${formatStorage(border.cost)}`;

	return (
		<div className="border border-gray-800 p-3 flex flex-col gap-2">
			<div className="aspect-square bg-black/40 flex items-center justify-center">
				<img src={border.image} alt="" className="max-w-full max-h-full" />
			</div>
			<div className="mt-auto pt-2">
				<Button
					size="small"
					onClick={handleClick}
					disabled={isMutating || (!owned && !canAfford)}
					className="w-full"
				>
					{label}
				</Button>
			</div>
		</div>
	);
};

export const BorderShop = ({ userId }: BorderShopProps) => {
	const { data: archive } = useArchiveState(userId);
	const purchase = usePurchaseBorder(userId);
	const equip = useEquipBorder(userId);

	if (!archive) return null;

	const isMutating = purchase.isPending || equip.isPending;

	return (
		<section id="border-shop" className="space-y-3 scroll-mt-8">
			<header className="space-y-2">
				<h2 className="text-4xl">Border Shop</h2>
				<p className="text-lg">
					Buy with archived storage. Equip to display on your profile.
				</p>
			</header>

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
				{borders.map((border) => (
					<BorderCard
						key={border.id}
						border={border}
						owned={archive.ownedBorderIds.includes(border.id)}
						equipped={archive.equippedBorderId === border.id}
						canAfford={archive.archivedStorage >= border.cost}
						onPurchase={() => purchase.mutate(border.id)}
						onEquip={() => equip.mutate(border.id)}
						onUnequip={() => equip.mutate(null)}
						isMutating={isMutating}
					/>
				))}
			</div>

			{(purchase.error || equip.error) && (
				<p className="text-red-400 text-sm">
					{(purchase.error || equip.error)?.message}
				</p>
			)}
		</section>
	);
};
