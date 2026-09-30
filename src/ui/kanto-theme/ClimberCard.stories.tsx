import type { Meta, StoryObj } from "@storybook/react";

import { kantoClimberCard, kantoStanding } from "~/test/kantoCommunity.factory";

import { ClimberCard } from "./ClimberCard.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof ClimberCard> = {
	component: ClimberCard,
	title: "Kanto/ClimberCard",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof ClimberCard>;

const on = (children: React.ReactNode) => (
	<div className="[--screen-floor:8rem]">
		<Screen theme="lavender">
			<div className="w-full sm:w-112">{children}</div>
		</Screen>
	</div>
);

export const ARival: Story = {
	render: () => on(<ClimberCard {...kantoClimberCard()} onClose={() => {}} />),
};

export const ARivalYouCanFileAt: Story = {
	render: () =>
		on(
			<ClimberCard
				{...kantoClimberCard()}
				file={{ label: "File 409 Conflict", onPress: () => {} }}
			/>
		),
};

export const ARivalOutOfReach: Story = {
	render: () =>
		on(
			<ClimberCard
				{...kantoClimberCard()}
				file={{
					label: "File 409 Conflict",
					refusal: "409 Conflict cannot reach them",
				}}
			/>
		),
};

export const ClimbingBare: Story = {
	render: () =>
		on(
			<ClimberCard
				{...kantoClimberCard()}
				name="Oak"
				titles={[]}
				theme="pallet"
				standing={kantoStanding({
					build: [],
					freeSlots: 4,
					weight: "0 / 4",
				})}
			/>
		),
};

const fallen = () => {
	const standing = kantoStanding();

	return {
		...kantoClimberCard(),
		name: "Blaine",
		titles: ["Stack Overflow"],
		theme: "volcano" as const,
		rival: false,
		perfect: false,
		shaky: true,
		standing: {
			...standing,
			gate: {
				...standing.gate,
				coverage: { ...standing.gate.coverage, held: 18 },
			},
		},
	};
};

export const AFallenRun: Story = {
	render: () => on(<ClimberCard {...fallen()} />),
};

export const AFallenRunYouCanLoot: Story = {
	render: () =>
		on(
			<ClimberCard
				{...fallen()}
				loot={{ label: "Loot 138 KB", onPress: () => {} }}
			/>
		),
};

export const AFallenRunAlreadyLooted: Story = {
	render: () =>
		on(
			<ClimberCard {...fallen()} loot={{ label: "looted by Misty · 138 KB" }} />
		),
};

export const YourOwnCard: Story = {
	render: () =>
		on(
			<ClimberCard
				{...kantoClimberCard()}
				name="Marciano"
				titles={["Ship It"]}
				theme="pallet"
				onClose={() => {}}
				you
				rival={false}
				rescued
			/>
		),
};

export const NoRunOpen: Story = {
	render: () =>
		on(<ClimberCard {...kantoClimberCard()} name="Oak" standing={undefined} />),
};

export const AsAHoverCard: Story = {
	render: () =>
		on(<ClimberCard {...kantoClimberCard()} profileHref={undefined} />),
};

export const WearingThunder: Story = {
	render: () =>
		on(
			<ClimberCard
				{...kantoClimberCard()}
				theme="thunder"
				titles={["Box Model", "CSS Carrier", "Legacy Tester"]}
				onClose={() => {}}
			/>
		),
};
