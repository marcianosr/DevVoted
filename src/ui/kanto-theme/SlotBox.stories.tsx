import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { baseSlots, slotDealsAt } from "~/test/kantoPoll.factory";

import { KANTO_COLORS } from "./colors";
import { ConfigChip } from "./ConfigChip.ui";
import { Screen } from "./Screen.ui";
import { SlotBox } from "./SlotBox.ui";

const noop = () => {};
const COLUMN = "flex w-full flex-col gap-3";

const CASH = { refund: "+96 KB" } as const;

const ArmingBox = () => {
	const [armed, setArmed] = useState(false);

	return <SlotBox cash={{ ...CASH, armed, onPress: () => setArmed(!armed) }} />;
};

const meta: Meta<typeof SlotBox> = {
	component: SlotBox,
	title: "Kanto/SlotBox",
	render: (args) => (
		<Screen theme="pewter" width="narrow">
			<SlotBox {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof SlotBox>;

export const Empty: Story = {};

export const Cashable: Story = {
	args: { cash: slotDealsAt().cash },
};

export const Armed: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter" width="narrow">
			<ArmingBox />
		</Screen>
	),
};

export const Refused: Story = {
	args: { cash: CASH },
};

export const AtTheFreeFour: Story = {
	args: { cash: slotDealsAt(baseSlots).cash },
};

export const BesideAChip: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={COLUMN}>
				<ConfigChip
					name="Unit Tests"
					slots={1}
					width="full"
					badges={[{ label: "+96 KB", color: "viridian" }]}
					onUninstall={noop}
				/>
				<SlotBox />
				<SlotBox cash={{ ...CASH, onPress: noop }} />
			</div>
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:9rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<div className={COLUMN}>
						<SlotBox />
						<SlotBox cash={{ ...CASH, onPress: noop }} />
					</div>
				</Screen>
			))}
		</div>
	),
};
