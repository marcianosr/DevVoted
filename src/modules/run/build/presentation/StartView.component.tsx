import { useState } from "react";

import {
	handCardFor,
	NEW_RUN_BUILD_NOTE,
	newRunBuildFor,
	newRunDealsFor,
	newRunFooterFor,
	newRunHeaderFor,
} from "~/modules/run/build/application/newRunScreen.viewmodel";
import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { NewRunScreen } from "~/ui/kanto-theme/NewRunScreen.ui";

export type StartViewProps = {
	view: RunView;
	onToggle: (configId: string) => void;
	onBuySlot: () => void;
	onRefundSlot: () => void;
	onStart: () => void;
};

const HAND_NOTE =
	"The hand costs no storage, only room. Nothing is required, and the smallest three always fit together.";

export const StartView = ({
	view,
	onToggle,
	onBuySlot,
	onRefundSlot,
	onStart,
}: StartViewProps) => {
	const [openInfo, setOpenInfo] = useState<string | undefined>(undefined);

	const toggleInfo = (name: string) =>
		setOpenInfo(name === openInfo ? undefined : name);

	const held = new Set(view.configs.map((config) => config.id));
	const free = view.slots - occupiedSlots(view.configs);
	const suggested = new Set(view.recommendedConfigIds);

	const cards = view.available.map((config) =>
		handCardFor({
			config,
			held: held.has(config.id),
			suggested: !held.has(config.id) && suggested.has(config.id),
			fits: slotsOf(config) <= free,
			onPress: () => onToggle(config.id),
		})
	);

	return (
		<NewRunScreen
			header={newRunHeaderFor(view.startSlotDeals.archiveKb)}
			build={newRunBuildFor(
				view.configs,
				view.slots,
				onToggle,
				newRunDealsFor(
					{ capacity: view.slots, ...view.startSlotDeals },
					onBuySlot,
					onRefundSlot
				),
				{ openInfo, onToggleInfo: toggleInfo }
			)}
			hand={{
				cards,
				left: cards.filter((card) => card.install?.disabled === false).length,
				note: HAND_NOTE,
				openInfo,
				onToggleInfo: toggleInfo,
			}}
			buildNote={NEW_RUN_BUILD_NOTE}
			footer={newRunFooterFor(view.canStart ? onStart : undefined)}
		/>
	);
};
