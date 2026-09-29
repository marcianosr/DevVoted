import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { kantoNewRunGroups } from "~/test/kantoPoll.factory";

import { Panel } from "./Panel.ui";
import { Registry } from "./Registry.ui";
import { RegistryHelp, type RegistryHelpChip } from "./RegistryHelp.ui";
import { Screen } from "./Screen.ui";

const noop = () => {};

const GROUPS = kantoNewRunGroups();

const CHIPS: readonly RegistryHelpChip[] = GROUPS.map(
	({ id, label, offers }) => ({ id, label, count: offers.length })
);

const meta: Meta<typeof RegistryHelp> = {
	component: RegistryHelp,
	title: "Kanto/RegistryHelp",
	args: { chips: CHIPS, onPick: noop, onHide: noop },
};

export default meta;

type Story = StoryObj<typeof RegistryHelp>;

export const Default: Story = {};

export const Picked: Story = {
	args: { pickedId: "coverage" },
};

const PickableRegistry = () => {
	const [picked, setPicked] = useState<string>();
	const showing =
		picked === undefined
			? GROUPS
			: GROUPS.filter((group) => group.id === picked);

	return (
		<Screen theme="pewter" ground="bare">
			<Panel>
				<Panel.Header label="Registry" />
				<Panel.Body>
					<RegistryHelp
						chips={CHIPS}
						pickedId={picked}
						onPick={(id) => setPicked(id === picked ? undefined : id)}
						onHide={noop}
					/>
					<Registry
						offers={showing.flatMap((group) => group.offers)}
						groups={showing}
						slotPrice="free"
						heading={false}
					/>
				</Panel.Body>
			</Panel>
		</Screen>
	);
};

export const InThePanel: Story = {
	render: () => <PickableRegistry />,
};
