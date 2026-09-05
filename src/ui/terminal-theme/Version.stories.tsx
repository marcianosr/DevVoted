import type { Meta, StoryObj } from "@storybook/react";

import { Row } from "./Row.ui";
import { Slots } from "./Slots.ui";
import { Text } from "./Text.ui";
import { Version } from "./Version.ui";

const meta: Meta<typeof Version> = {
	component: Version,
	title: "Terminal/Version",
	decorators: [
		(Story) => (
			<div className="bg-zinc-950 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Version>;

export const First: Story = { args: { label: "v1" } };

export const Upgraded: Story = { args: { label: "v2" } };

export const Third: Story = { args: { label: "v3" } };

export const Fourth: Story = { args: { label: "v4" } };

export const Maxed: Story = { args: { label: "v5" } };

/** The whole point of the component: two ladders in one badge. Value climbs
 * zinc-800 to zinc-100, and the silhouette mills off one more corner per rung —
 * square at v1, a full octagon at v5. */
export const TheWholeLadder: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			{["v1", "v2", "v3", "v4", "v5"].map((label) => (
				<Version key={label} label={label} />
			))}
		</div>
	),
};

/** v1 and v2 are the pair most at risk of collapsing into each other, since
 * both sit a step off the page's own zinc. The single milled corner is what
 * keeps them apart. */
export const TheDarkEnd: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			{["v1", "v2", "v3"].map((label) => (
				<Version key={label} label={label} />
			))}
		</div>
	),
};

/** A colour wash is the one ground where every cut is visible at once: against
 * plain zinc the dark rungs hide their own silhouette, which is exactly when
 * the value ramp has to carry the reading instead. */
export const OnAGateWash: Story = {
	render: () => (
		<div className="flex items-center gap-4 rounded-xl bg-cerulean/20 p-4">
			{["v1", "v2", "v3", "v4", "v5"].map((label) => (
				<Version key={label} label={label} />
			))}
		</div>
	),
};

/** Shape alone, with the fills stripped out of the reading: the ladder still
 * counts 0-1-2-3-4 corners even with your eyes half shut. */
export const TheShapeLadder: Story = {
	render: () => (
		<div className="flex items-center gap-4 rounded-xl bg-cinnabar p-4">
			{["v1", "v2", "v3", "v4", "v5"].map((label) => (
				<Version key={label} label={label} />
			))}
		</div>
	),
};

const BUILD = [
	{ name: ".js", version: "v5", slots: 1 },
	{ name: "ESLint", version: "v3", slots: 1 },
	{ name: "IndexedDB", version: "v2", slots: 2 },
	{ name: "Overclock", version: "v4", slots: 4 },
	{ name: "Telemetry", version: "v1", slots: 2 },
] as const;

/** Where it actually lands: beside a config name and its slot mark, which is
 * the only place the badge competes with a size colour. */
export const BesideAConfig: Story = {
	render: () => (
		<div className="w-full max-w-md divide-y divide-edge">
			{BUILD.map((config) => (
				<Row
					key={config.name}
					name={config.name}
					tag={
						<>
							<Version label={config.version} />
							<Slots slots={config.slots} />
						</>
					}
					detail="what the config does"
				/>
			))}
		</div>
	),
};

export const InARow: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{[
				{ name: ".js", label: "v5" },
				{ name: "ESLint", label: "v3" },
				{ name: "Telemetry", label: "v1" },
			].map((config) => (
				<span key={config.name} className="flex items-center gap-1.5">
					<Text className="w-24 font-bold">{config.name}</Text>
					<Version label={config.label} />
				</span>
			))}
		</div>
	),
};
