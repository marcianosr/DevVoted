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

const WithOpenedCard = ({
	userId,
	...frame
}: CommunityScreenFrame & { userId: string }) => {
	const card = usePlayerCard(userId);
	const openedDetail = openedDetailOf(card.view);

	return (
		<CommunityScreen
			{...communityScreenPropsFor({
				...frame,
				...(openedDetail === undefined ? {} : { openedDetail }),
			})}
			advertisement={ADVERTISEMENT}
		/>
	);
};

export const CommunityView = (props: CommunityViewProps) => {
	const [openClimberId, setOpenClimberId] = useState<string>();
	const frame = {
		...props,
		openClimberId,
		onInspectClimber: (id: string) =>
			setOpenClimberId((current) => (current === id ? undefined : id)),
	};
	const openedUserId = openedUserIdOf(props.view.climb, openClimberId);

	if (openedUserId === undefined)
		return (
			<CommunityScreen
				{...communityScreenPropsFor(frame)}
				advertisement={ADVERTISEMENT}
			/>
		);

	return <WithOpenedCard key={openedUserId} userId={openedUserId} {...frame} />;
};
