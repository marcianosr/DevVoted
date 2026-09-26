import type { Meta, StoryObj } from "@storybook/react";

import { kantoClimberCard } from "~/test/kantoCommunity.factory";

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

export const ClimbingBare: Story = {
	render: () =>
		on(
			<ClimberCard
				{...kantoClimberCard()}
				name="Oak"
				handle={undefined}
				title={undefined}
				build={[]}
				storage={undefined}
				weight="0 of 4 weight"
			/>
		),
};

export const AFallenRun: Story = {
	render: () =>
		on(
			<ClimberCard
				{...kantoClimberCard()}
				name="Blaine"
				handle="blaine"
				title={undefined}
				rival={false}
				perfect={false}
				shaky
				band="danger"
				coveragePercent={18}
				gate="gate 3 · Thunder"
			/>
		),
};

export const YourOwnCard: Story = {
	render: () =>
		on(
			<ClimberCard
				{...kantoClimberCard()}
				name="Marciano"
				handle="marciano"
				you
				rival={false}
				rescued
			/>
		),
};
