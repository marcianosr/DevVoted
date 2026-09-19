import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";
import { SlotBox } from "./SlotBox.ui";
import { Typography } from "./Typography.ui";

const meta: Meta<typeof Panel> = {
	component: Panel,
	title: "Kanto/Panel",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof Panel>;

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
	<Panel.Row
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
	</Panel.Row>
);

const BuildCard = () => (
	<Panel>
		<Panel.Header label="build" meta="0 of 4 slots · 4 free" />
		<Panel.Body>
			<div className={SLOTS}>
				<SlotBox label="" />
				<SlotBox label="" />
				<SlotBox label="" />
				<SlotBox label="" />
			</div>
			<SlotBox label="nothing installed yet" />
		</Panel.Body>
		<Panel.Footer
			trailing={
				<>
					<Badge color="viridian">64 KB</Badge>
					<Typography variant="hint">from archive</Typography>
					<Button label="buy" size="sm" onPress={noop} />
				</>
			}
		>
			<Typography variant="accent">+ buy slot 5</Typography>
		</Panel.Footer>
	</Panel>
);

const RegistryCard = () => (
	<Panel>
		<Panel.Header label="registry" meta="5 offers · 2 suggested" />
		<Panel.Body>
			{OFFERS.map((offer) => (
				<Offer key={offer.name} {...offer} />
			))}
		</Panel.Body>
		<Panel.Footer>
			<Typography variant="hint">
				The hand costs no storage, only room. Nothing is required, and the
				smallest three always fit together.
			</Typography>
		</Panel.Footer>
	</Panel>
);

const RegistryCardInRows = () => (
	<Panel>
		<Panel.Header label="registry" meta="5 offers · 2 suggested" />
		<Panel.Rows>
			{OFFERS.map((offer) => (
				<RowOffer key={offer.name} {...offer} />
			))}
		</Panel.Rows>
		<Panel.Footer>
			<Typography variant="hint">
				The hand costs no storage, only room. Nothing is required, and the
				smallest three always fit together.
			</Typography>
		</Panel.Footer>
	</Panel>
);

export const BuildPanel: Story = {
	render: () => (
		<Screen theme="pallet">
			<BuildCard />
		</Screen>
	),
};

export const RegistryPanel: Story = {
	render: () => (
		<Screen theme="pallet">
			<RegistryCard />
		</Screen>
	),
};

export const RegistryPanelLined: Story = {
	render: () => (
		<Screen theme="pallet">
			<RegistryCardInRows />
		</Screen>
	),
};

export const SpacedBesideLined: Story = {
	render: () => (
		<Screen theme="pallet">
			<div className={COLUMNS}>
				<RegistryCard />
				<RegistryCardInRows />
			</div>
		</Screen>
	),
};

export const ABarWithNoHeader: Story = {
	render: () => (
		<Screen theme="pallet">
			<Panel>
				<Panel.Body>
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
				</Panel.Body>
			</Panel>
		</Screen>
	),
};

export const AHeadedPoll: Story = {
	render: () => (
		<Screen theme="pallet">
			<Panel>
				<Panel.Header
					label="Poll 4 out of 5"
					badge={{ label: "TypeScript", color: "cinnabar" }}
					meta="3 options · multiple answers"
				/>
				<Panel.Body>
					<Typography variant="headline">
						Which of these are TypeScript utility types?
					</Typography>
				</Panel.Body>
			</Panel>
		</Screen>
	),
};

export const SideBySide: Story = {
	render: () => (
		<Screen theme="pallet">
			<div className={COLUMNS}>
				<BuildCard />
				<RegistryCard />
			</div>
		</Screen>
	),
};

export const AtAFixedWidth: Story = {
	render: () => (
		<Screen theme="cerulean">
			<Panel className="w-80">
				<Panel.Header label="Storage plan" />
				<Panel.Body>
					<Typography variant="hint">
						Caps what you can hold. A clear that pays over the cap burns the
						rest.
					</Typography>
				</Panel.Body>
			</Panel>
		</Screen>
	),
};
