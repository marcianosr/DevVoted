import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	createKantoShopScreenProps,
	kantoBuildSpace,
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

const ShopWithPanels = () => {
	const [open, setOpen] = useState<string | undefined>(undefined);
	const [uninstalling, setUninstalling] = useState<string | undefined>(
		undefined
	);
	const [held, setHeld] = useState(8);

	const toggle = (name: string) => setOpen(name === open ? undefined : name);
	const close = () => setUninstalling(undefined);

	const chips = kantoShopBuild.map((chip) => ({
		...chip,
		onUninstall: () => setUninstalling(chip.name),
	}));

	const space = kantoBuildSpace(held);

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
				buildSpace={{
					...space,
					rungs: space.rungs.map((rung) => ({
						...rung,
						onPick:
							rung.weight === held ? undefined : () => setHeld(rung.weight),
					})),
				}}
				registry={{ ...props.registry, openInfo: open, onToggleInfo: toggle }}
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
