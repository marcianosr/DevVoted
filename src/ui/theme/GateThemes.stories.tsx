import type { Meta, StoryObj } from "@storybook/react";

import {
	ALL_SWATCHES,
	type GateSwatch,
} from "~/modules/run/gate/domain/swatch.model";

/**
 * The ambient run theme per gate (ADR-020): every `[data-gate-theme]` value
 * with text/fill/border samples on the app's dark background. Doubles as the
 * contrast checklist — pallet (near-white), boulder (gray), elite (lightened
 * indigo) and champion (fuchsia solid) are the ones to eyeball.
 */
const GateThemeRow = ({ swatch }: { swatch: GateSwatch }) => (
	<div
		data-gate-theme={swatch.theme}
		className="flex items-center gap-4 border-b border-edge px-4 py-3"
	>
		<span className="w-16 text-sm text-zinc-500">gate {swatch.gate}</span>
		<span className="h-4 w-4 rounded bg-theme" />
		<span className="w-44 font-bold text-theme">{swatch.name}</span>
		<span className="rounded border border-theme px-2 py-0.5 text-sm">
			border
		</span>
		<span className="rounded bg-theme-soft px-2 py-0.5 text-sm text-theme">
			soft fill
		</span>
		<span className="text-sm text-zinc-400">
			body text stays zinc for contrast
		</span>
	</div>
);

const GateThemes = () => (
	<div className="bg-black">
		{ALL_SWATCHES.map((swatch) => (
			<GateThemeRow key={swatch.id} swatch={swatch} />
		))}
	</div>
);

const meta: Meta<typeof GateThemes> = {
	component: GateThemes,
	title: "Design System/Gate Themes",
};
export default meta;

type Story = StoryObj<typeof GateThemes>;

export const AllGates: Story = {};
