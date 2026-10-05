import { describe, expect, it } from "vitest";

import { approvalNoticeViewFor } from "~/modules/polls/authoring/application/approvalNotice.viewmodel";
import { STORAGE_UNITS } from "~/shared/lib/storage";

const flex = { id: 74, question: "What does `flex: 1` expand to?" };
const grid = { id: 75, question: "What does `fr` stand for in grid?" };
const hoist = { id: 76, question: "Is a `const` hoisted?" };

const kb = (amount: number) => amount * STORAGE_UNITS.KB;

describe("approvalNoticeViewFor", () => {
	it("raises nothing when no poll is waiting to be announced", () => {
		expect(approvalNoticeViewFor([], kb(512))).toBeNull();
	});

	it("names one live poll and counts the archive up by 16 KB to the balance it holds now", () => {
		const view = approvalNoticeViewFor([flex], kb(512));

		expect(view).toMatchObject({
			heading: "Your poll is live",
			reward: "+16 KB",
			fromKb: 496,
			toKb: 512,
		});
	});

	it("sums the reward over every poll published since the last visit", () => {
		const view = approvalNoticeViewFor([flex, grid, hoist], kb(512));

		expect(view).toMatchObject({
			heading: "3 of your polls are live",
			reward: "+48 KB",
			fromKb: 464,
			toKb: 512,
		});
	});

	it("starts the count at zero when the archive was spent below the reward since", () => {
		const view = approvalNoticeViewFor([flex, grid], kb(20));

		expect(view).toMatchObject({ fromKb: 0, toKb: 20 });
	});

	it("splits each question into its code spans", () => {
		const view = approvalNoticeViewFor([flex], kb(512));

		expect(view?.questions).toEqual([
			{
				id: 74,
				segments: [
					{ kind: "text", text: "What does " },
					{ kind: "code", text: "flex: 1" },
					{ kind: "text", text: " expand to?" },
				],
			},
		]);
	});
});
