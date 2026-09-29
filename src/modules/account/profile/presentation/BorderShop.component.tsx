import {
	useArchiveState,
	useEquipBorder,
	usePurchaseBorder,
} from "~/modules/account/profile/application/useArchiveState.hook";
import { borders } from "~/modules/account/profile/domain/border.model";
import { BorderShop as BorderShopUI } from "~/modules/account/profile/presentation/BorderShop.ui";

type BorderShopProps = {
	userId: string;
	tryingOnId: string | null;
	onTryOn: (borderId: string | null) => void;
};

export const BorderShop = ({
	userId,
	tryingOnId,
	onTryOn,
}: BorderShopProps) => {
	const { data: archive } = useArchiveState(userId);
	const purchase = usePurchaseBorder(userId);
	const equip = useEquipBorder(userId);

	if (!archive) return null;

	const isMutating = purchase.isPending || equip.isPending;

	const cards = borders.map((border) => {
		const owned = archive.ownedBorderIds.includes(border.id);
		const equipped = archive.equippedBorderId === border.id;

		const tryingOn = tryingOnId === border.id;
		const settled = { onSuccess: () => onTryOn(null) };

		const press = () => {
			if (!owned) return purchase.mutate(border.id, settled);
			return equip.mutate(equipped ? null : border.id, settled);
		};

		return {
			id: border.id,
			name: border.name,
			image: border.image,
			cost: border.cost,
			owned,
			equipped,
			canAfford: archive.archivedStorage >= border.cost,
			isMutating,
			tryingOn,
			onPress: press,
			onTryOn: () => onTryOn(tryingOn ? null : border.id),
		};
	});

	return (
		<BorderShopUI
			cards={cards}
			held={`${archive.ownedBorderIds.length} of ${borders.length}`}
			error={(purchase.error || equip.error)?.message}
		/>
	);
};
