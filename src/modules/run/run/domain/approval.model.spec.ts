import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	approvalRefusalOf,
	approve,
	approvedPollOf,
	canApprove,
} from "~/modules/run/run/domain/approval.model";
import {
	answerWith,
	audited,
	clearGate,
	pool,
} from "~/modules/run/run/domain/run.factory";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";

const FIRST_SLOT = "kazooie-0";
const THIRD_SLOT = "kazooie-2";
const BEYOND_THE_GATE = "kazooie-7";

const approving = (): RunState => {
	const base = createRun(pool(20), [CONFIGS.lgtm]);
	return { ...base, build: { ...base.build, configs: [CONFIGS.lgtm] } };
};

const withoutTheConfig = (): RunState => {
	const base = createRun(pool(20), [CONFIGS.js]);
	return { ...base, build: { ...base.build, configs: [CONFIGS.js] } };
};

describe("approve", () => {
	it("records the slot the player named", () => {
		expect(approve(approving(), THIRD_SLOT).approvedPollId).toBe(THIRD_SLOT);
	});

	it("replaces the choice when a second slot is named", () => {
		const once = approve(approving(), FIRST_SLOT);
		expect(approve(once, THIRD_SLOT).approvedPollId).toBe(THIRD_SLOT);
	});

	it("refuses a poll beyond this gate's five slots", () => {
		const state = approving();
		expect(approve(state, BEYOND_THE_GATE)).toBe(state);
	});

	it("refuses when no config in the build submits the crowd's pick", () => {
		const state = withoutTheConfig();
		expect(approve(state, FIRST_SLOT)).toBe(state);
	});

	it("refuses under the mirror, which inverts what a majority means", () => {
		const state = audited(approving(), 0, "mirrored");
		expect(approve(state, FIRST_SLOT)).toBe(state);
	});

	it("refuses once the window is open, since approving is a prep decision", () => {
		const answering = runReducer(approving(), { type: "start" });
		expect(approve(answering, FIRST_SLOT)).toBe(answering);
	});
});

describe("approvalRefusalOf", () => {
	it("says nothing while the control is live", () => {
		expect(approvalRefusalOf(approving())).toBeUndefined();
	});

	it("reports offline when the build carries no approver", () => {
		expect(approvalRefusalOf(withoutTheConfig())).toBe("offline");
	});

	it("reports the mirror ahead of anything else", () => {
		expect(approvalRefusalOf(audited(approving(), 0, "mirrored"))).toBe(
			"mirrored"
		);
	});
});

describe("canApprove", () => {
	it("is open in prep with the config installed", () => {
		expect(canApprove(approving())).toBe(true);
	});

	it("is shut once the window is open", () => {
		expect(canApprove(runReducer(approving(), { type: "start" }))).toBe(false);
	});
});

describe("approvedPollOf", () => {
	it("names the poll on screen once it is the approved one", () => {
		const approved = approve(approving(), FIRST_SLOT);
		const answering = runReducer(approved, { type: "start" });
		expect(approvedPollOf(answering)?.id).toBe(FIRST_SLOT);
	});

	it("names nothing while the approved slot is still ahead", () => {
		const approved = approve(approving(), THIRD_SLOT);
		const answering = runReducer(approved, { type: "start" });
		expect(approvedPollOf(answering)).toBeUndefined();
	});

	it("names nothing when no slot was approved", () => {
		expect(
			approvedPollOf(runReducer(approving(), { type: "start" }))
		).toBeUndefined();
	});
});

describe("the approval's lifetime", () => {
	it("survives the shop exit, which is how every gate after the first opens", () => {
		const inShop: RunState = { ...approving(), status: "rewarding" };
		const approved = approve(inShop, THIRD_SLOT);

		expect(runReducer(approved, { type: "finish-reward" }).approvedPollId).toBe(
			THIRD_SLOT
		);
	});

	it("survives the polls standing between prep and the slot it named", () => {
		const approved = approve(approving(), THIRD_SLOT);
		const opened = runReducer(approved, { type: "start" });

		expect(answerWith(opened, true).approvedPollId).toBe(THIRD_SLOT);
	});

	it("is gone once the window closes, so it cannot spend twice", () => {
		const approved = approve(approving(), THIRD_SLOT);
		const opened = runReducer(approved, { type: "start" });

		expect(clearGate(opened).approvedPollId).toBeUndefined();
	});
});
