import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	createKantoShopScreenProps,
	kantoClosedShopProps,
	kantoFirstShopProps,
	kantoLateShopProps,
	kantoLockedRegistryOffers,
	kantoShopBuild,
	kantoShopWeight,
	kantoShopUninstalls,
	kantoTagShopProps,
} from "~/test/kantoPoll.factory";

import { Modal } from "./Modal.ui";
import { ShopScreen } from "./ShopScreen.ui";
import { Uninstall } from "./Uninstall.ui";

const props = createKantoShopScreenProps();

/** What the first offer would do to the standing bill, for the arming story. */
const CROSSING = { from: 8, to: 12, perGateKb: 64 };

const ShopWithPanels = () => {
	const [open, setOpen] = useState<string | undefined>(undefined);
	const [uninstalling, setUninstalling] = useState<string | undefined>(
		undefined
	);
	const [armed, setArmed] = useState<string | undefined>(undefined);

	const toggle = (name: string) => setOpen(name === open ? undefined : name);
	const close = () => setUninstalling(undefined);

	const chips = kantoShopBuild.map((chip) => ({
		...chip,
		onUninstall: () => setUninstalling(chip.name),
	}));

	// The first offer is the one that crosses a rung, so the story shows both
	// halves of the press: a plain install, and one that has to arm first.
	const offers = props.registry.offers.map((offer, index) =>
		index !== 0 || offer.install === undefined
			? offer
			: {
					...offer,
					install: {
						...offer.install,
						scale: CROSSING,
						armed: armed === offer.name,
						onPress: () =>
							setArmed(armed === offer.name ? undefined : offer.name),
					},
				}
	);

	const uninstall =
		uninstalling === undefined ? undefined : kantoShopUninstalls[uninstalling];

	return (
		<>
			<ShopScreen
				{...props}
				build={{
					configs: chips,
					weight: kantoShopWeight(),
					openInfo: open,
					onToggleInfo: toggle,
				}}
				registry={{
					...props.registry,
					offers,
					openInfo: open,
					onToggleInfo: toggle,
				}}
			/>

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
