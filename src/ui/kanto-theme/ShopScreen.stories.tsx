import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	SHOP_BALANCE_KB,
	SHOP_PLAN_TIER,
	createKantoShopScreenProps,
	kantoClosedShopProps,
	kantoFirstShopProps,
	kantoLateShopProps,
	kantoLockedRegistryOffers,
	kantoShopBuild,
	SHOP_PLAN_PEAK_KB,
	kantoShopWeight,
	kantoShopUninstalls,
	kantoTagShopProps,
	planChangeFor,
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

	const weight = kantoShopWeight(SHOP_PLAN_TIER, SHOP_PLAN_PEAK_KB);
	const offers = (weight.offers ?? []).map((offer) =>
		offer.opensAt === undefined && offer.onPress !== undefined
			? { ...offer, onPress: () => setPlanTier(SHOP_PLAN_TIER + 1) }
			: offer
	);

	const uninstall =
		uninstalling === undefined ? undefined : kantoShopUninstalls[uninstalling];

	return (
		<>
			<ShopScreen
				{...props}
				build={{
					configs: chips,
					weight: { ...weight, offers },
					openInfo: open,
					onToggleInfo: toggle,
				}}
				registry={{ ...props.registry, openInfo: open, onToggleInfo: toggle }}
			/>

			{planTier === undefined ? null : (
				<Modal label="Free weight" onDismiss={close}>
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

export const WithFooter: Story = {
	render: () => (
		<ShopScreen
			{...props}
			footer={{
				action: {
					label: "To gate 10 prep",
					icon: "gate",
					onPress: () => {},
				},
			}}
		/>
	),
};

export const ExitLocked: Story = {
	render: () => (
		<ShopScreen
			{...props}
			footer={{
				action: { label: "To gate 10 prep" },
				refusal: "the build is over capacity by 1 slot",
			}}
		/>
	),
};

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
			}}
		/>
	),
};

export const ShopClosed: Story = {
	render: () => <ShopScreen {...kantoClosedShopProps()} />,
};
