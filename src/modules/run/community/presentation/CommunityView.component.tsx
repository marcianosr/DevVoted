import { useState } from "react";

import {
	type CommunityScreenFrame,
	communityScreenPropsFor,
} from "~/modules/run/community/application/communityScreen.viewmodel";
import { CommunityScreen } from "~/ui/kanto-theme/CommunityScreen.ui";

export type CommunityViewProps = CommunityScreenFrame;

export const CommunityView = (props: CommunityViewProps) => {
	const [openClimberId, setOpenClimberId] = useState<string>();

	return (
		<CommunityScreen
			{...communityScreenPropsFor({
				...props,
				openClimberId,
				onInspectClimber: (id) =>
					setOpenClimberId((current) => (current === id ? undefined : id)),
			})}
		/>
	);
};
