import { clsx } from "clsx";

import { borders } from "~/domains/economy/data/borders";
import {
	useArchiveState,
	useEquipBorder,
	usePurchaseBorder,
} from "~/domains/economy/hooks/useArchiveState";
import type {
	Border,
	BorderRarity,
} from "~/domains/economy/models/border.model";
import { formatStorage } from "~/lib/storage";

type BorderShopProps = {
	userId: string;
};

const rarityRingClass: Record<BorderRarity, string> = {
	common: "ring-gray-500",
	rare: "ring-cyan-400",
	epic: "ring-fuchsia-500",
	legendary: "ring-amber-300 animate-pulse",
};

const rarityLabelClass: Record<BorderRarity, string> = {
	common: "text-gray-400",
	rare: "text-cyan-300",
	epic: "text-fuchsia-300",
	legendary: "text-amber-200",
};

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
	return (
		<div
			className={clsx(
				"border border-gray-800 p-3 flex flex-col gap-2 ring-1 ring-inset",
				rarityRingClass[border.rarity]
			)}
		>
			<div className="aspect-square bg-black/40 flex items-center justify-center">
				<img
					src={border.image}
					alt={border.name}
					className="max-w-full max-h-full"
				/>
			</div>
			<div className="space-y-0.5">
				<p className="text-sm text-white">{border.name}</p>
				<p
					className={clsx(
						"text-xs uppercase tracking-wide",
						rarityLabelClass[border.rarity]
					)}
				>
					{border.rarity}
				</p>
				<p className="text-xs text-gray-400">{border.description}</p>
			</div>
			<div className="mt-auto pt-2">
				{owned ? (
					equipped ? (
						<button
							type="button"
							onClick={onUnequip}
							disabled={isMutating}
							className="w-full text-xs border border-amber-400 text-amber-200 px-2 py-1 disabled:opacity-50"
						>
							Equipped — unequip
						</button>
					) : (
						<button
							type="button"
							onClick={onEquip}
							disabled={isMutating}
							className="w-full text-xs border border-cyan-400 text-cyan-200 px-2 py-1 disabled:opacity-50"
						>
							Equip
						</button>
					)
				) : (
					<button
						type="button"
						onClick={onPurchase}
						disabled={isMutating || !canAfford}
						className={clsx(
							"w-full text-xs px-2 py-1 disabled:opacity-50 border",
							canAfford
								? "border-emerald-400 text-emerald-200"
								: "border-gray-700 text-gray-500"
						)}
					>
						{canAfford
							? `Buy · ${formatStorage(border.cost)}`
							: `Locked · ${formatStorage(border.cost)}`}
					</button>
				)}
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
		<section className="space-y-3">
			<header className="flex items-baseline justify-between">
				<h2 className="text-xl text-cyan-400">Border Shop</h2>
				<p className="text-sm text-gray-400">
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
