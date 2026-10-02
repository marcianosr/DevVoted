import { useState } from "react";

import { useDisclosure } from "~/shared/hooks/useDisclosure.hook";
import {
	INSTALLED_CARDS_OPEN,
	OFFERED_CARDS_OPEN,
} from "~/shared/lib/disclosure";

import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	type PointedPrice,
	type ShopScreenHandlers,
	shopScreenPropsFor,
} from "~/modules/run/shop/application/shopScreen.viewmodel";
import { ShopScreen } from "~/ui/kanto-theme/ShopScreen.ui";

export type ShopViewProps = ShopScreenHandlers & {
	view: RunView;
	runNumber?: number | null;
	rivalsInReach?: number | null;
};

export const ShopView = ({
	view,
	runNumber = null,
	rivalsInReach = null,
	...on
}: ShopViewProps) => {
	const build = useDisclosure(
		view.configs.map((config) => config.label),
		INSTALLED_CARDS_OPEN
	);
	const offers = useDisclosure(
		view.offers.map((offer) => offer.config.label),
		OFFERED_CARDS_OPEN
	);
	const [abandonArmed, setAbandonArmed] = useState(false);
	const [openUpgrades, setOpenUpgrades] = useState<string>();
	const [armedId, setArmedId] = useState<string>();
	const [pointed, setPointed] = useState<PointedPrice>();

	return (
		<ShopScreen
			{...shopScreenPropsFor({
				view,
				runNumber,
				rivalsInReach,
				on,
				ui: {
					build,
					offers,
					openUpgrades,
					onToggleUpgrades: (name) =>
						setOpenUpgrades(name === openUpgrades ? undefined : name),
					armedId,
					onArm: setArmedId,
					pointed,
					onPoint: setPointed,
					abandonArmed,
					onArmAbandon: () => setAbandonArmed(true),
					onDisarm: () => setAbandonArmed(false),
				},
			})}
		/>
	);
};
