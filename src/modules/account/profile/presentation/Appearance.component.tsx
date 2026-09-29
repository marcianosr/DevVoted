import { useState } from "react";

import {
	appearancePreviewFor,
	triedOnBorderOf,
	type ProfileIdentity,
} from "~/modules/account/profile/application/profileScreen.viewmodel";
import { Appearance as AppearanceUI } from "~/modules/account/profile/presentation/Appearance.ui";
import { AppearancePreview } from "~/modules/account/profile/presentation/AppearancePreview.ui";
import { BorderShop } from "~/modules/account/profile/presentation/BorderShop.component";
import { TitleShelf } from "~/modules/account/profile/presentation/TitleShelf.component";

type AppearanceProps = {
	userId: string;
	identity: ProfileIdentity;
	equippedBorderId: string | null;
};

export const Appearance = ({
	userId,
	identity,
	equippedBorderId,
}: AppearanceProps) => {
	const [tryingOnId, setTryingOnId] = useState<string | null>(null);
	const triedOn = triedOnBorderOf(tryingOnId, equippedBorderId);
	const shown =
		triedOn === undefined
			? identity
			: { ...identity, borderUrl: triedOn.image };

	return (
		<AppearanceUI
			preview={
				<AppearancePreview
					{...appearancePreviewFor(shown)}
					tryingOn={triedOn?.name}
				/>
			}
			borders={
				<BorderShop
					userId={userId}
					tryingOnId={tryingOnId}
					onTryOn={setTryingOnId}
				/>
			}
			titles={<TitleShelf userId={userId} />}
		/>
	);
};
