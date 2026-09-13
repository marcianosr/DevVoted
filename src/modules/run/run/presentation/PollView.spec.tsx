import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	createMockGateStake,
	createMockPollView,
	createMockRunView,
} from "~/test/runView.factory";

import { PollView } from "./PollView.component";

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
	onSubmit: () => {},
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

		expect(screen.getByText("JavaScript")).toBeInTheDocument();
	});

	it("answers a single-answer poll on the pick itself", async () => {
		const onSelect = vi.fn();
		render(<PollView {...props} onSelect={onSelect} />);

		await userEvent.click(screen.getByText("at(-1)"));
		expect(onSelect).toHaveBeenCalledWith("a");
	});

	it("carries no submit press on a single-answer poll", () => {
		render(<PollView {...props} />);

		expect(
			screen.queryByRole("button", { name: /Submit answer/ })
		).not.toBeInTheDocument();
	});

	it("submits a multi-answer poll only once something is picked", async () => {
		const onSubmit = vi.fn();
		const { rerender } = render(
			<PollView {...props} view={multipleView} onSubmit={onSubmit} />
		);

		expect(
			screen.getByRole("button", { name: /Submit answer/ })
		).toBeDisabled();

		rerender(
			<PollView
				{...props}
				view={multipleView}
				selectedOptionIds={["a"]}
				onSubmit={onSubmit}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: /Submit answer/ })
		);
		expect(onSubmit).toHaveBeenCalled();
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

	it("keeps the coverage pin down while the answer is still open", () => {
		const { container } = render(<PollView {...props} />);

		expect(container.querySelector("header")).toBeInTheDocument();
		expect(container.querySelector(".coverage-bar-pin")).toHaveAttribute(
			"data-shown",
			"false"
		);
	});
});

describe("PollView once the answer has landed", () => {
	const answeredView = createMockRunView({
		...view,
		answeredThisGate: [answered],
	});

	const settled = { ...props, view: answeredView, answered };

	it("pins the coverage bar where the answer landed", () => {
		const { container } = render(<PollView {...settled} />);

		expect(container.querySelector(".coverage-bar-pin")).toHaveAttribute(
			"data-shown",
			"true"
		);
	});

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

	it("moves on from the footer", async () => {
		const onNext = vi.fn();
		render(<PollView {...settled} onNext={onNext} />);

		await userEvent.click(screen.getByRole("button", { name: /Next poll/ }));
		expect(onNext).toHaveBeenCalled();
	});

	it("names the gate on the footer once its last poll has been answered", () => {
		render(
			<PollView
				{...settled}
				view={createMockRunView({ ...view, gateComplete: true })}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Gate 4 . Lavender/ })
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Next poll/ })
		).not.toBeInTheDocument();
	});

	it("still reads the gate that asked the poll, not the one it is about to open", () => {
		render(
			<PollView
				{...settled}
				view={createMockRunView({ ...view, gateComplete: true })}
			/>
		);

		expect(screen.getByText("gate 4 / 12")).toBeInTheDocument();
	});

	it("keeps the bar it was already drawing, so the fill travels rather than restarting", () => {
		const { container, rerender } = render(<PollView {...props} />);
		const fill = container.querySelector(".coverage-bar-fill");

		rerender(<PollView {...settled} />);

		expect(container.querySelector(".coverage-bar-fill")).toBe(fill);
	});
});
