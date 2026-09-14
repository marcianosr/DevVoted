import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { PanelV2 } from "./PanelV2.ui";
import { Screen } from "./Screen.ui";
import { SlotBox } from "./SlotBox.ui";
import { Typography } from "./Typography.ui";

const meta: Meta<typeof PanelV2> = {
	component: PanelV2,
	title: "Kanto/PanelV2",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof PanelV2>;

const noop = () => {};

const SLOTS = "grid w-full grid-cols-4 gap-2";
const OFFER = "flex w-full items-center gap-3";
const OFFER_NAME = "text-sm text-theme-faint";
const OFFER_ACTIONS = "ml-auto flex shrink-0 items-center gap-2";
const COLUMNS = "grid w-full gap-8 md:grid-cols-2";

const OFFERS = [
	{ name: "Unit Tests", weight: 1, suggested: false },
	{ name: "IndexedDB", weight: 2, suggested: false },
	{ name: "Code Coverage", weight: 2, suggested: true },
	{ name: "Cold Start", weight: 2, suggested: false },
	{ name: ".ts", weight: 1, suggested: true },
];

const Offer = ({ name, weight, suggested }: (typeof OFFERS)[number]) => (
	<div className={OFFER}>
		<Badge color="pewter">{weight}</Badge>
		<span className={OFFER_NAME}>{name}</span>
		<span className={OFFER_ACTIONS}>
			{suggested ? <Badge color="cerulean">suggested</Badge> : null}
			<Button label="install" size="sm" onPress={noop} />
			<Button label="i" size="sm" onPress={noop} />
		</span>
	</div>
);

const RowOffer = ({ name, weight, suggested }: (typeof OFFERS)[number]) => (
	<PanelV2.Row
		trailing={
			<>
				{suggested ? <Badge color="cerulean">suggested</Badge> : null}
				<Button label="install" size="sm" onPress={noop} />
				<Button label="i" size="sm" onPress={noop} />
			</>
		}
	>
		<Badge color="pewter">{weight}</Badge>
		<span className={OFFER_NAME}>{name}</span>
	</PanelV2.Row>
);

const BuildPanelV2 = () => (
	<PanelV2>
		<PanelV2.Header label="build" meta="0 of 4 slots · 4 free" />
		<PanelV2.Body>
			<div className={SLOTS}>
				<SlotBox label="" />
				<SlotBox label="" />
				<SlotBox label="" />
				<SlotBox label="" />
			</div>
			<SlotBox label="nothing installed yet" />
		</PanelV2.Body>
		<PanelV2.Footer
			trailing={
				<>
					<Badge color="viridian">64 KB</Badge>
					<Typography variant="hint">from archive</Typography>
					<Button label="buy" size="sm" onPress={noop} />
				</>
			}
		>
			<Typography variant="accent">+ buy slot 5</Typography>
		</PanelV2.Footer>
	</PanelV2>
);

const RegistryPanelV2 = () => (
	<PanelV2>
		<PanelV2.Header label="registry" meta="5 offers · 2 suggested" />
		<PanelV2.Body>
			{OFFERS.map((offer) => (
				<Offer key={offer.name} {...offer} />
			))}
		</PanelV2.Body>
		<PanelV2.Footer>
			<Typography variant="hint">
				The hand costs no storage, only room. Nothing is required, and the
				smallest three always fit together.
			</Typography>
		</PanelV2.Footer>
	</PanelV2>
);

const RegistryPanelInRows = () => (
	<PanelV2>
		<PanelV2.Header label="registry" meta="5 offers · 2 suggested" />
		<PanelV2.Rows>
			{OFFERS.map((offer) => (
				<RowOffer key={offer.name} {...offer} />
			))}
		</PanelV2.Rows>
		<PanelV2.Footer>
			<Typography variant="hint">
				The hand costs no storage, only room. Nothing is required, and the
				smallest three always fit together.
			</Typography>
		</PanelV2.Footer>
	</PanelV2>
);

export const BuildPanel: Story = {
	render: () => (
		<Screen theme="pallet">
			<BuildPanelV2 />
		</Screen>
	),
};

export const RegistryPanel: Story = {
	render: () => (
		<Screen theme="pallet">
			<RegistryPanelV2 />
		</Screen>
	),
};

export const RegistryPanelLined: Story = {
	render: () => (
		<Screen theme="pallet">
			<RegistryPanelInRows />
		</Screen>
	),
};

export const SpacedBesideLined: Story = {
	render: () => (
		<Screen theme="pallet">
			<div className={COLUMNS}>
				<RegistryPanelV2 />
				<RegistryPanelInRows />
			</div>
		</Screen>
	),
};

export const ABarWithNoHeader: Story = {
	render: () => (
		<Screen theme="pallet">
			<PanelV2>
				<PanelV2.Body>
					<div className={OFFER}>
						<Typography variant="hint">
							A bare build never clears, so the run will not start until one
							config is installed.
						</Typography>
						<span className={OFFER_ACTIONS}>
							<Button
								label="Pallet gate prep"
								icon="chevron"
								iconAt="trail"
								disabled
								onPress={noop}
							/>
						</span>
					</div>
				</PanelV2.Body>
			</PanelV2>
		</Screen>
	),
};

export const AHeadedPoll: Story = {
	render: () => (
		<Screen theme="pallet">
			<PanelV2>
				<PanelV2.Header
					label="Poll 4 out of 5"
					badge={{ label: "TypeScript", color: "cinnabar" }}
					meta="3 options · multiple answers"
				/>
				<PanelV2.Body>
					<Typography variant="headline">
						Which of these are TypeScript utility types?
					</Typography>
				</PanelV2.Body>
			</PanelV2>
		</Screen>
	),
};

export const SideBySide: Story = {
	render: () => (
		<Screen theme="pallet">
			<div className={COLUMNS}>
				<BuildPanelV2 />
				<RegistryPanelV2 />
			</div>
		</Screen>
	),
};
