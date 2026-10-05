import { useState } from "react";

import { useDisclosure } from "~/shared/hooks/useDisclosure.hook";
import {
	INSTALLED_CARDS_OPEN,
	OFFERED_CARDS_OPEN,
} from "~/shared/lib/disclosure";

import { Advertisement } from "~/modules/account/profile/presentation/Advertisement.component";
import {
	EMPTY_WARM_BOOT_DRAFT,
	type NewRunScreenHandlers,
	newRunScreenPropsFor,
	type WarmBootDraft,
} from "~/modules/run/build/application/newRunScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { NewRunScreen } from "~/ui/kanto-theme/NewRunScreen.ui";

export type StartViewProps = NewRunScreenHandlers & {
	view: RunView;
	bootRefusal?: string;
	booting?: boolean;
};

export const StartView = ({
	view,
	bootRefusal,
	booting = false,
	...on
}: StartViewProps) => {
	const build = useDisclosure(
		view.configs.map((config) => config.label),
		INSTALLED_CARDS_OPEN
	);
	const offers = useDisclosure(
		view.available.map((config) => config.label),
		OFFERED_CARDS_OPEN
	);
	const [pickedGroup, setPickedGroup] = useState<string>();
	const [draft, setDraft] = useState<WarmBootDraft>(EMPTY_WARM_BOOT_DRAFT);

	return (
		<NewRunScreen
			{...newRunScreenPropsFor({
				view,
				bootRefusal,
				booting,
				on,
				ui: {
					build,
					offers,
					pickedGroup,
					onPickGroup: setPickedGroup,
					draft,
					onDraft: setDraft,
				},
			})}
			advertisement={<Advertisement placement="newRun" />}
		/>
	);
};
