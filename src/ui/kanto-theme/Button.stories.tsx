import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button.ui";
import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";

const noop = () => {};

const ROW = "flex flex-wrap items-center gap-3";

const meta: Meta<typeof Button> = {
	component: Button,
	title: "Kanto/Button",
	argTypes: {
		tone: { control: "inline-radio", options: ["ambient", "action", "danger"] },
		disabled: { control: "boolean" },
		pressed: { control: "boolean" },
		expanded: { control: "boolean" },
	},
	args: { label: "↑ v3", tone: "action", onPress: noop },
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<Button {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Upgrade: Story = {};

export const UpgradeUnaffordable: Story = { args: { disabled: true } };

export const Info: Story = {
	args: { glyph: "i", label: "About Cache", tone: "ambient" },
};

export const InfoPinned: Story = {
	args: { glyph: "i", label: "About Cache", tone: "ambient", expanded: true },
};

export const Uninstall: Story = {
	args: { glyph: "×", label: "Uninstall Cache", tone: "danger" },
};

export const ChipControls: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={ROW}>
				<Button label="↑ v3" tone="action" onPress={noop} />
				<Button label="↑ v3" tone="action" disabled onPress={noop} />
				<Button glyph="i" label="About Cache" tone="ambient" onPress={noop} />
				<Button
					glyph="i"
					label="About Cache"
					tone="ambient"
					expanded
					onPress={noop}
				/>
				<Button
					glyph="×"
					label="Uninstall Cache"
					tone="danger"
					onPress={noop}
				/>
			</div>
		</Screen>
	),
};

export const EveryTone: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={ROW}>
				<Button label="ambient" tone="ambient" onPress={noop} />
				<Button label="action" tone="action" onPress={noop} />
				<Button label="danger" tone="danger" onPress={noop} />
			</div>
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:7rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<div className={ROW}>
						<Button glyph="i" label="About Cache" onPress={noop} />
						<Button label="↑ v3" tone="action" onPress={noop} />
						<Button
							glyph="×"
							label="Uninstall Cache"
							tone="danger"
							onPress={noop}
						/>
					</div>
				</Screen>
			))}
		</div>
	),
};

export const UpgradeCapped: Story = {
	args: { cap: "↑", label: "v3", detail: "32 KB", tone: "action" },
};

export const UpgradeCappedPriced: Story = {
	args: {
		cap: "↑",
		label: "v3",
		detail: "32 KB",
		detailOn: "always",
		tone: "action",
	},
};

export const UpgradeCappedUnaffordable: Story = {
	args: {
		cap: "↑",
		label: "v3",
		detail: "32 KB",
		tone: "action",
		disabled: true,
	},
};

export const DialogActions: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="lavender" width="narrow">
			<div className={ROW}>
				<Button label="uninstall" size="md" onPress={noop} />
				<Button label="cancel" size="md" onPress={noop} />
			</div>
		</Screen>
	),
};

export const EverySize: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={ROW}>
				<Button label="small" onPress={noop} />
				<Button label="medium" size="md" onPress={noop} />
				<Button cap="↑" label="v3" onPress={noop} tone="action" />
				<Button cap="↑" label="v3" size="md" onPress={noop} tone="action" />
				<Button glyph="i" label="About" onPress={noop} />
				<Button glyph="i" label="About" size="md" onPress={noop} />
			</div>
		</Screen>
	),
};
