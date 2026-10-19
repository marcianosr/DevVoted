import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	approvingSlots,
	asPoll,
	asPrep,
	dispatching,
	JS_GATE,
	MIXED_GATE,
	runWith,
	underAudit,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/LGTM",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const intoPrep = () =>
	afterAnswers(runWith([CONFIGS.lgtm], [...MIXED_GATE, ...JS_GATE]), ALL_RIGHT);

export const TheFiveOnOffer: Story = {
	render: () => {
		const state = intoPrep();
		return asPrep(state, approvingSlots(state));
	},
};

export const OneSlotIsStillUntested: Story = {
	render: () => {
		const state = intoPrep();
		return asPrep(state, approvingSlots(state, { ready: [0, 1, 3, 4] }));
	},
};

export const ApprovedAndWaiting: Story = {
	render: () => {
		const state = intoPrep();
		const slots = approvingSlots(state);
		return asPrep(
			dispatching(state, {
				type: "approve-slot",
				pollId: slots.slots[2].pollId,
			}),
			slots
		);
	},
};

export const TheMirrorRefusesTheWholeGate: Story = {
	render: () => {
		const state = underAudit(intoPrep(), "mirrored");
		return asPrep(state, approvingSlots(state, { refusal: "mirrored" }));
	},
};

export const TheApprovedPollOffersOnlyTheLgtm: Story = {
	render: () => {
		const state = intoPrep();
		const approved = dispatching(state, {
			type: "approve-slot",
			pollId: approvingSlots(state).slots[0].pollId,
		});
		return asPoll(dispatching(approved, { type: "finish-reward" }));
	},
};

export const WaitsInPrepOnEveryOtherPoll: Story = {
	render: () => asPoll(runWith([CONFIGS.lgtm], JS_GATE)),
};
