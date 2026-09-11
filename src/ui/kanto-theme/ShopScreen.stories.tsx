import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	SHOP_BALANCE_KB,
	SHOP_CAPACITY_SLOTS,
	SHOP_PLAN_TIER,
	createKantoShopScreenProps,
	kantoClosedShopProps,
	kantoFirstShopProps,
	kantoLateShopProps,
	kantoLockedRegistryOffers,
	kantoShopBuild,
	kantoShopPlan,
	kantoShopUninstalls,
	kantoTagShopProps,
	planChangeFor,
	slotDealsAt,
	usedSlotsOf,
} from "~/test/kantoPoll.factory";

import { Modal } from "./Modal.ui";
import { PlanChange } from "./PlanChange.ui";
import { ShopScreen } from "./ShopScreen.ui";
import { Uninstall } from "./Uninstall.ui";

const props = createKantoShopScreenProps();

const ShopWithPanels = () => {
	const [open, setOpen] = useState<string | undefined>(undefined);
	const [uninstalling, setUninstalling] = useState<string | undefined>(
		undefined
	);
	const [planTier, setPlanTier] = useState<number | undefined>(undefined);

	const toggle = (name: string) => setOpen(name === open ? undefined : name);
	const close = () => {
		setUninstalling(undefined);
		setPlanTier(undefined);
	};

	const chips = kantoShopBuild.map((chip) => ({
		...chip,
		onUninstall: () => setUninstalling(chip.name),
	}));

	const plan = kantoShopPlan();
	const rungs = plan.rungs.map((rung, tier) => ({
		...rung,
		onPress: rung.onPress === undefined ? undefined : () => setPlanTier(tier),
	}));

	const uninstall =
		uninstalling === undefined ? undefined : kantoShopUninstalls[uninstalling];

	return (
		<>
			<ShopScreen
				{...props}
				build={{
					configs: chips,
					slots: {
						used: usedSlotsOf(kantoShopBuild),
						capacity: SHOP_CAPACITY_SLOTS,
					},
					...slotDealsAt(),
					openInfo: open,
					onToggleInfo: toggle,
				}}
				registry={{ ...props.registry, openInfo: open, onToggleInfo: toggle }}
				plan={{ ...plan, rungs }}
			/>

			{planTier === undefined ? null : (
				<Modal label="Storage plan" onDismiss={close}>
					<PlanChange
						{...planChangeFor(SHOP_PLAN_TIER, planTier, SHOP_BALANCE_KB)}
						onConfirm={close}
						onCancel={close}
					/>
				</Modal>
			)}

			{uninstall === undefined ? null : (
				<Modal label="Uninstall" onDismiss={close}>
					<Uninstall {...uninstall} onConfirm={close} onCancel={close} />
				</Modal>
			)}
		</>
	);
};

const meta: Meta<typeof ShopScreen> = {
	component: ShopScreen,
	title: "Kanto/Screens/ShopScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof ShopScreen>;

export const UnderAGate: Story = { render: () => <ShopScreen {...props} /> };

export const WithPanels: Story = { render: () => <ShopWithPanels /> };

export const FirstShop: Story = {
	render: () => <ShopScreen {...kantoFirstShopProps()} />,
};

export const TagOnSale: Story = {
	render: () => <ShopScreen {...kantoTagShopProps()} />,
};

export const LateShop: Story = {
	render: () => <ShopScreen {...kantoLateShopProps()} />,
};

export const LockedOffers: Story = {
	render: () => (
		<ShopScreen
			{...props}
			registry={{
				...props.registry,
				offers: kantoLockedRegistryOffers,
				note: undefined,
			}}
		/>
	),
};

export const ShopClosed: Story = {
	render: () => <ShopScreen {...kantoClosedShopProps()} />,
};
