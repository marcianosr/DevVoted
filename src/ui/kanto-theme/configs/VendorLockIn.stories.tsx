import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asShop,
	dispatching,
	funded,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/vendor lock-in",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const inShop = () =>
	afterAnswers(
		funded(runWith([CONFIGS.vendorLockIn, CONFIGS.agentsMd], MIXED_GATE), 512),
		ALL_RIGHT
	);

export const OffersTheLock: Story = {
	render: () => asShop(inShop()),
};

export const CarriesTheLockedConfigFree: Story = {
	render: () =>
		asShop(
			dispatching(inShop(), { type: "vendor-lock", configId: "agents-md" })
		),
};
