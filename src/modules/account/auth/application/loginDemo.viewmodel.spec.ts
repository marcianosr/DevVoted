import { afterEach, describe, expect, it, vi } from "vitest";

import {
	DEMO_BEATS,
	DEMO_POLLS,
	FIRST_STEP,
	SETTLED_STEP,
	demoCardFor,
	heroFor,
	nextStep,
	randomLoginTheme,
	waitFor,
} from "~/modules/account/auth/application/loginDemo.viewmodel";

const pickedOf = (poll: number) => ({ poll, phase: "picked" }) as const;

describe("loginDemo viewmodel", () => {
	it("opens on the first poll with nothing picked and the counter at one of five", () => {
		const card = demoCardFor(FIRST_STEP);

		expect(card.category).toBe("JavaScript");
		expect(card.counter).toBe("1 of 5");
		expect(card.pickedIds).toEqual([]);
		expect(card.options.every((option) => option.state === undefined)).toBe(
			true
		);
		expect(card.leaving).toBe(false);
		expect(card.revealed).toBe(false);
	});

	it("lights the right option once picked and marks it right", () => {
		const card = demoCardFor(pickedOf(0));
		const right = card.options.find((option) => option.state === "right");

		expect(right?.letter).toBe("B");
		expect(card.pickedIds).toEqual([right?.id]);
		expect(card.revealed).toBe(true);
	});

	it("grows the coverage by one right answer per poll", () => {
		const opening = demoCardFor(FIRST_STEP).coverage.held;
		const afterOne = demoCardFor(pickedOf(0)).coverage.held;
		const afterTwo = demoCardFor(pickedOf(1)).coverage.held;

		expect(afterOne).toBeGreaterThan(opening);
		expect(afterTwo).toBeGreaterThan(afterOne);
		expect(demoCardFor(pickedOf(1)).coverage.band).toBeTypeOf("string");
	});

	it("steps enter, picked, leaving, then the next poll, and loops after the last", () => {
		const picked = nextStep(FIRST_STEP);
		const leaving = nextStep(picked);
		const second = nextStep(leaving);
		const last = { poll: DEMO_POLLS.length - 1, phase: "leaving" } as const;

		expect(picked).toEqual({ poll: 0, phase: "picked" });
		expect(leaving).toEqual({ poll: 0, phase: "leaving" });
		expect(second).toEqual({ poll: 1, phase: "enter" });
		expect(nextStep(last)).toEqual(FIRST_STEP);
	});

	it("waits the pick beat, then the hold, then the leave", () => {
		expect(waitFor(FIRST_STEP)).toBe(DEMO_BEATS.pickAt);
		expect(waitFor(pickedOf(0))).toBe(DEMO_BEATS.holdMs);
		expect(waitFor({ poll: 0, phase: "leaving" })).toBe(DEMO_BEATS.leaveMs);
	});

	it("settles on the first poll answered, for reduced motion", () => {
		expect(SETTLED_STEP).toEqual({ poll: 0, phase: "picked" });
	});

	it("states the pitch with the number of categories the game holds", () => {
		expect(heroFor().pitch).toBe(
			"Answer daily questions in 12 categories, ramp up your knowledge, keep your coverage score healthy, craft your build and push through the gates."
		);
	});

	it("states the game's figures from its rules", () => {
		expect(heroFor().figures).toEqual([
			{ value: "5", label: "polls a day" },
			{ value: "12", label: "gates" },
			{ value: "1", label: "Champion" },
		]);
	});
});

describe("randomLoginTheme", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("draws the first colour when the roll is lowest and the last when it is highest", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		expect(randomLoginTheme()).toBe("pallet");

		vi.spyOn(Math, "random").mockReturnValue(0.999);
		expect(randomLoginTheme()).toBe("seafoam");
	});
});
