import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { kantoClimbMap } from "~/test/kantoCommunity.factory";

import { ClimbMap } from "./ClimbMap.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof ClimbMap> = {
	component: ClimbMap,
	title: "Kanto/ClimbMap",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof ClimbMap>;

export const TheLadder: Story = {
	render: () => (
		<div className="[--screen-floor:16rem]">
			<Screen theme="lavender">
				<ClimbMap {...kantoClimbMap()} />
			</Screen>
		</div>
	),
};

const PressableMap = () => {
	const [openId, setOpenId] = useState<string | undefined>("marciano");

	return (
		<div className="[--screen-floor:16rem]">
			<Screen theme="lavender">
				<ClimbMap
					{...kantoClimbMap()}
					openId={openId}
					onInspect={(id) =>
						setOpenId((current) => (current === id ? undefined : id))
					}
				/>
			</Screen>
		</div>
	);
};

export const OpeningAClimber: Story = { render: () => <PressableMap /> };

export const OnAPhone: Story = {
	parameters: { viewport: { defaultViewport: "mobile1" } },
	render: () => (
		<div className="w-[390px] [--screen-floor:24rem]">
			<Screen theme="lavender">
				<ClimbMap {...kantoClimbMap()} openId="misty" onInspect={() => {}} />
			</Screen>
		</div>
	),
};
