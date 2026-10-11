import { useState } from "react";

import {
	type CommunityScreenFrame,
	communityScreenPropsFor,
	openedDetailOf,
	openedUserIdOf,
} from "~/modules/run/community/application/communityScreen.viewmodel";
import { usePlayerCard } from "~/modules/run/community/application/usePlayerCard.hook";
import { CommunityScreen } from "~/ui/kanto-theme/CommunityScreen.ui";
import { Advertisement } from "~/modules/account/profile/presentation/Advertisement.component";

export type CommunityViewProps = CommunityScreenFrame;

const ADVERTISEMENT = <Advertisement placement="community" />;

export const CommunityView = (props: CommunityViewProps) => {
	const [openClimberId, setOpenClimberId] = useState<string>();
	const openedUserId = openedUserIdOf(props.view.climb, openClimberId);
	const card = usePlayerCard(openedUserId);
	const openedDetail = openedDetailOf(card.view);

	return (
		<CommunityScreen
			{...communityScreenPropsFor({
				...props,
				openClimberId,
				onInspectClimber: (id: string) =>
					setOpenClimberId((current) => (current === id ? undefined : id)),
				...(openedDetail === undefined ? {} : { openedDetail }),
			})}
			advertisement={ADVERTISEMENT}
		/>
	);
};
