import {
	useArchiveState,
	useEquipBorder,
	usePurchaseBorder,
} from "~/modules/account/profile/application/useArchiveState.hook";
import { borders } from "~/modules/account/profile/domain/border.model";
import { BorderShop as BorderShopUI } from "~/modules/account/profile/presentation/BorderShop.ui";

type BorderShopProps = {
	userId: string;
};

export const BorderShop = ({ userId }: BorderShopProps) => {
	const { data: archive } = useArchiveState(userId);
	const purchase = usePurchaseBorder(userId);
	const equip = useEquipBorder(userId);

	if (!archive) return null;

	const isMutating = purchase.isPending || equip.isPending;

	const cards = borders.map((border) => {
		const owned = archive.ownedBorderIds.includes(border.id);
		const equipped = archive.equippedBorderId === border.id;

		const press = () => {
			if (!owned) return purchase.mutate(border.id);
			return equip.mutate(equipped ? null : border.id);
		};

		return {
			id: border.id,
			image: border.image,
			cost: border.cost,
			owned,
			equipped,
			canAfford: archive.archivedStorage >= border.cost,
			isMutating,
			onPress: press,
		};
	});

	return (
		<BorderShopUI
			cards={cards}
			error={(purchase.error || equip.error)?.message}
		/>
	);
};
