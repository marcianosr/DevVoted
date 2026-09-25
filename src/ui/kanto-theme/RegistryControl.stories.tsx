import type { Meta, StoryObj } from "@storybook/react";

import { kantoRegistryControls } from "~/test/kantoPoll.factory";

import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { RegistryControl } from "./RegistryControl.ui";

const noop = () => {};

const COLUMN = "flex w-full flex-col gap-3";

const REBUILD = kantoRegistryControls[0];
const EXTEND = kantoRegistryControls[1];

const meta: Meta<typeof RegistryControl> = {
	component: RegistryControl,
	title: "Kanto/RegistryControl",
	argTypes: { disabled: { control: "boolean" } },
	args: { ...REBUILD, onPress: noop },
	render: (args) => (
		<Screen theme="pewter" width="narrow">
			<RegistryControl {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof RegistryControl>;

export const Rebuild: Story = {};

export const Extend: Story = { args: { ...EXTEND, onPress: noop } };

export const Unaffordable: Story = { args: { disabled: true } };

export const Inert: Story = { args: { onPress: undefined } };

export const Locked: Story = {
	args: {
		glyph: "+",
		title: "Extend the registry",
		detail: "one more offer, now and every shop after",
		locked: true,
		unlock: "Reach Cascade",
		onPress: undefined,
	},
};

export const BothControls: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter" width="narrow">
			<div className={COLUMN}>
				{kantoRegistryControls.map((control) => (
					<RegistryControl key={control.title} {...control} />
				))}
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
					<RegistryControl {...REBUILD} onPress={noop} />
				</Screen>
			))}
		</div>
	),
};
