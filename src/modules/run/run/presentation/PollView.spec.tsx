import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	createMockGateStake,
	createMockPollView,
	createMockRunView,
} from "~/test/runView.factory";

import { PollView } from "./PollView.component";

type FakeAnimation = { onfinish: (() => void) | null; cancel: () => void };

const poll = createMockPollView({
	id: "js-1",
	category: "js",
	question: "Which method returns the last element of an array?",
	answerType: "single",
	options: [
		{ id: "a", label: "at(-1)" },
		{ id: "b", label: "pop()" },
		{ id: "c", label: "last()" },
	],
});

const multiplePoll = createMockPollView({
	id: "ts-multi",
	category: "ts",
	question: "Which of these are TypeScript utility types?",
	answerType: "multiple",
	options: [
		{ id: "a", label: "Partial" },
		{ id: "b", label: "Pick" },
		{ id: "c", label: "Banjo" },
	],
});

const view = createMockRunView({
	status: "answering",
	poll,
	configs: [CONFIGS.js, CONFIGS.unitTests],
	storage: 512,
	pollsPerGate: 5,
	gateStake: createMockGateStake({
		gateNumber: 4,
		coverageLadder: { floor: 0, ok: 0, healthy: 60 },
	}),
});

const multipleView = createMockRunView({ ...view, poll: multiplePoll });

const props = {
	view,
	selectedOptionIds: [],
	onSelect: () => {},
	onAnswer: () => {},
	onNext: () => {},
};

const answered: AnsweredPoll = {
	id: "js-1",
	category: "js",
	question: "Which method returns the last element of an array?",
	outcome: "correct",
	picked: ["at(-1)"],
	correct: ["at(-1)"],
	options: ["at(-1)", "pop()", "last()"],
	coverageEarned: 12,
	explanation: "at(-1) reads from the end without copying the array.",
};

describe("the build under a poll", () => {
	const narrowScreen = () =>
		vi.stubGlobal(
			"matchMedia",
			(query: string) =>
				({
					matches: true,
					media: query,
					addEventListener: () => {},
					removeEventListener: () => {},
				}) satisfies Pick<
					MediaQueryList,
					"matches" | "media" | "addEventListener" | "removeEventListener"
				>
		);

	afterEach(() => vi.unstubAllGlobals());

	it("lies open on a wide screen", () => {
		const { container } = render(<PollView {...props} />);

		expect(container.querySelector("footer details")).toHaveAttribute("open");
	});

	it("folds shut on a phone", () => {
		narrowScreen();
		const { container } = render(<PollView {...props} />);

		expect(container.querySelector("footer details")).not.toHaveAttribute(
			"open"
		);
	});
});

describe("PollView", () => {
	it("asks the poll's question and offers its answers", () => {
		render(<PollView {...props} />);

		expect(
			screen.getByRole("heading", {
				name: "Which method returns the last element of an array?",
			})
		).toBeInTheDocument();
		expect(screen.getByText("at(-1)")).toBeInTheDocument();
	});

	it("names the category the poll is drawn from", () => {
		render(<PollView {...props} />);

		const named = screen
			.getAllByText("JavaScript", { ignore: "script, style, [inert] *" })
			.filter((element) => element.closest("[data-config]") === null);
		expect(named).toHaveLength(1);
	});

	it("answers a single-answer poll with the tapped option", async () => {
		const onSelect = vi.fn();
		const onAnswer = vi.fn();
		render(<PollView {...props} onSelect={onSelect} onAnswer={onAnswer} />);

		await userEvent.click(screen.getByText("at(-1)"));

		expect(onAnswer).toHaveBeenCalledWith(["a"]);
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("answers a single-answer poll with the letter pressed", () => {
		const onAnswer = vi.fn();
		render(<PollView {...props} onAnswer={onAnswer} />);

		act(() => {
			window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
		});

		expect(onAnswer).toHaveBeenCalledWith(["b"]);
	});

	it("offers no lock-in on a single-answer poll", () => {
		render(<PollView {...props} />);

		expect(
			screen.queryByRole("button", { name: /^Lock in/ })
		).not.toBeInTheDocument();
		expect(screen.getByText("press a letter to answer")).toBeInTheDocument();
	});

	it("reports the pick on a select-all poll rather than answering it", async () => {
		const onSelect = vi.fn();
		const onAnswer = vi.fn();
		render(
			<PollView
				{...props}
				view={multipleView}
				onSelect={onSelect}
				onAnswer={onAnswer}
			/>
		);

		await userEvent.click(screen.getByText("Partial"));

		expect(onSelect).toHaveBeenCalledWith("a");
		expect(onAnswer).not.toHaveBeenCalled();
	});

	it("asks a select-all poll for every answer that fits, then locks the picks in", async () => {
		const onAnswer = vi.fn();
		const { rerender } = render(
			<PollView {...props} view={multipleView} onAnswer={onAnswer} />
		);

		expect(screen.getByRole("button", { name: /^Lock in/ })).toBeDisabled();
		expect(screen.getByText("pick every answer that fits")).toBeInTheDocument();
		expect(screen.getByText("press letters, then Enter")).toBeInTheDocument();

		rerender(
			<PollView
				{...props}
				view={multipleView}
				selectedOptionIds={["a", "b"]}
				onAnswer={onAnswer}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: /^Lock in 2 answers/ })
		);
		expect(onAnswer).toHaveBeenCalledWith(["a", "b"]);
	});

	it("keeps the build in a footer under the poll", () => {
		render(<PollView {...props} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(screen.getAllByText(CONFIGS.js.label).length).toBeGreaterThan(0);
	});

	it("offers no upgrade press, since a version is bought in the registry", () => {
		render(<PollView {...props} />);

		expect(
			screen.queryByRole("button", { name: /Upgrade/ })
		).not.toBeInTheDocument();
	});

	it("rides the running bar on a marker, with no pin", () => {
		const { container } = render(<PollView {...props} />);

		expect(container.querySelector("header")).toBeInTheDocument();
		expect(container.querySelector(".coverage-bar-marker")).toBeInTheDocument();
		expect(container.querySelector(".coverage-bar-pin")).toBeNull();
	});
});

describe("PollView once the answer has landed", () => {
	const answeredView = createMockRunView({
		...view,
		answeredThisGate: [answered],
	});

	const settled = { ...props, view: answeredView, answered };

	it("holds the answered poll on screen without taking a new pick", () => {
		render(<PollView {...settled} />);

		expect(
			screen.getByRole("heading", {
				name: "Which method returns the last element of an array?",
			})
		).toBeInTheDocument();
		expect(
			screen.getByText("at(-1) reads from the end without copying the array.")
		).toBeInTheDocument();
	});

	describe("the hold before the next poll", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		const missed: AnsweredPoll = {
			...answered,
			outcome: "wrong",
			picked: ["pop()"],
		};

		it("moves on by itself 650ms after a right answer", () => {
			const onNext = vi.fn();
			render(<PollView {...settled} onNext={onNext} />);

			act(() => vi.advanceTimersByTime(649));
			expect(onNext).not.toHaveBeenCalled();

			act(() => vi.advanceTimersByTime(1));
			expect(onNext).toHaveBeenCalledTimes(1);
		});

		it("holds a wrong answer longer, 900ms, so the right one can be read", () => {
			const onNext = vi.fn();
			render(<PollView {...settled} answered={missed} onNext={onNext} />);

			act(() => vi.advanceTimersByTime(899));
			expect(onNext).not.toHaveBeenCalled();

			act(() => vi.advanceTimersByTime(1));
			expect(onNext).toHaveBeenCalledTimes(1);
		});

		it("moves on once per answer, however often the screen redraws", () => {
			const onNext = vi.fn();
			const { rerender } = render(<PollView {...settled} onNext={onNext} />);

			rerender(<PollView {...settled} onNext={onNext} />);
			act(() => vi.advanceTimersByTime(2000));

			expect(onNext).toHaveBeenCalledTimes(1);
		});

		it("offers no press to skip the hold", () => {
			render(<PollView {...settled} />);

			expect(
				screen.queryByRole("button", { name: /Next poll/ })
			).not.toBeInTheDocument();
		});

		it("takes no answer while the feedback plays", () => {
			const onSelect = vi.fn();
			const onAnswer = vi.fn();
			render(<PollView {...settled} onSelect={onSelect} onAnswer={onAnswer} />);

			act(() => {
				window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
				window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
			});

			expect(onSelect).not.toHaveBeenCalled();
			expect(onAnswer).not.toHaveBeenCalled();
			expect(
				screen.queryByRole("button", { name: /pop\(\)/ })
			).not.toBeInTheDocument();
		});

		it("shakes the card after a wrong answer", () => {
			render(<PollView {...settled} answered={missed} />);

			expect(document.querySelector(".answer-shake")).toBeInTheDocument();
		});
	});

	it("marks the right answer and the wrong pick once a miss lands", () => {
		render(
			<PollView
				{...settled}
				answered={{ ...answered, outcome: "wrong", picked: ["pop()"] }}
			/>
		);

		expect(screen.getByText("at(-1)").closest("[data-answer]")).toHaveAttribute(
			"data-answer",
			"right"
		);
		expect(screen.getByText("pop()").closest("[data-answer]")).toHaveAttribute(
			"data-answer",
			"wrong"
		);
	});

	it("still reads the gate that asked the poll, not the one it is about to open", () => {
		render(
			<PollView
				{...settled}
				view={createMockRunView({ ...view, gateComplete: true })}
			/>
		);

		expect(
			screen.getByRole("heading", { name: "Lavender Gate" })
		).toBeInTheDocument();
	});

	it("keeps the bar it was already drawing, so the fill travels rather than restarting", () => {
		const { container, rerender } = render(<PollView {...props} />);
		const bar = container.querySelector(".coverage-bar");

		rerender(<PollView {...settled} />);

		expect(bar).not.toBeNull();
		expect(container.querySelector(".coverage-bar")).toBe(bar);
	});
});

describe("PollView once a linter has crossed an answer off", () => {
	const linted = createMockRunView({ ...view, disabledOptionIds: ["b"] });

	it("rules out the option the linter paid to remove", () => {
		render(<PollView {...props} view={linted} />);

		expect(screen.getByRole("button", { name: /pop\(\)/ })).toBeDisabled();
	});

	it("leaves every other option pickable", () => {
		render(<PollView {...props} view={linted} />);

		expect(screen.getByRole("button", { name: /at\(-1\)/ })).toBeEnabled();
		expect(screen.getByRole("button", { name: /last\(\)/ })).toBeEnabled();
	});
});

describe("PollView while a right answer's gain flies", () => {
	const at = (coverageHeld: number) =>
		createMockRunView({
			...view,
			gateStake: createMockGateStake({
				...view.gateStake,
				coverageHeld,
			}),
		});

	const liveAt24 = { ...props, view: at(24) };
	const landedAt36 = {
		...props,
		view: createMockRunView({ ...at(36), answeredThisGate: [answered] }),
		answered,
	};

	const heldOf = (container: HTMLElement) =>
		container
			.querySelector(".coverage-bar")
			?.getAttribute("style")
			?.match(/--coverage-held:\s*([\d.]+)%/)?.[1];

	afterEach(() => {
		Reflect.deleteProperty(HTMLElement.prototype, "animate");
	});

	it("holds the bar where it stood until the chip lands, then moves it and lets the chip go once it has ridden", () => {
		const animation: FakeAnimation = { onfinish: null, cancel: vi.fn() };
		Object.defineProperty(HTMLElement.prototype, "animate", {
			value: () => animation,
			configurable: true,
		});
		const { container, rerender } = render(<PollView {...liveAt24} />);

		rerender(<PollView {...landedAt36} />);

		expect(screen.getByText("+12%")).toBeInTheDocument();
		expect(heldOf(container)).toBe("24");

		act(() => animation.onfinish?.());

		expect(heldOf(container)).toBe("36");
		expect(screen.getByText("+12%")).toBeInTheDocument();

		act(() => animation.onfinish?.());

		expect(screen.queryByText("+12%")).toBeNull();
	});

	it("moves the bar at once where no chip can fly", () => {
		const { container, rerender } = render(<PollView {...liveAt24} />);

		rerender(<PollView {...landedAt36} />);

		expect(heldOf(container)).toBe("36");
	});
});
