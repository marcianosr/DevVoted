import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Answer, Verdict, type AnswerOption } from "./Verdict.ui";

const single: readonly AnswerOption[] = [
	{ id: "slice-negative", label: "arr.slice(-2)", expected: true },
	{ id: "splice", label: "arr.splice(-2)", received: true },
	{ id: "slice-positive", label: "arr.slice(2)" },
	{ id: "at", label: "arr.at(-2)" },
];

const multi: readonly AnswerOption[] = [
	{ id: "opacity", label: "opacity < 1", expected: true, received: true },
	{ id: "static", label: "position: static", received: true },
	{ id: "transform", label: "transform", expected: true, received: true },
	{ id: "float", label: "float: left" },
	{ id: "isolation", label: "isolation: isolate", expected: true },
	{ id: "overflow", label: "overflow: hidden" },
];

const props = {
	outcome: "wrong",
	question: "Which array method returns a shallow copy?",
	score: -1.4,
	options: single,
} as const;

describe("Answer", () => {
	it("pairs the letter with the answer it stands for", () => {
		render(<Answer letter="B" label="arr.splice(-2)" tone="cinnabar" />);

		expect(screen.getByText("B")).toHaveClass("text-cinnabar");
		expect(screen.getByText("arr.splice(-2)")).toHaveClass("text-cinnabar");
	});

	it("takes a border only as a pill, where several sit side by side", () => {
		const { container: plain } = render(<Answer letter="A" label="one" />);
		const { container: pill } = render(
			<Answer letter="A" label="one" shape="pill" tone="celadon" />
		);

		expect(plain.firstChild).not.toHaveClass("border");
		expect(pill.firstChild).toHaveClass("border", "border-celadon/40");
	});
});

describe("Verdict", () => {
	it("badges the outcome in the words a build uses", () => {
		render(<Verdict {...props} outcome="partial" options={multi} />);

		expect(screen.getByText("PART")).toBeInTheDocument();
	});

	// jsdom applies no UA stylesheet, so a shut <details> still hands its children
	// to RTL. Whether a row is folded is only readable off the `open` attribute.
	it("folds a passed poll away, since the misses are what the player came back for", () => {
		const { container } = render(
			<Verdict {...props} outcome="correct" score={2.6} />
		);

		expect(screen.getByText("PASS")).toBeInTheDocument();
		expect(container.querySelector("details")).not.toHaveAttribute("open");
		expect(
			screen.getByText("Which array method returns a shallow copy?")
		).toHaveClass("text-zinc-400");
	});

	it("opens a failed poll on arrival, so the reason needs no click", () => {
		const { container } = render(<Verdict {...props} outcome="wrong" />);

		expect(container.querySelector("details")).toHaveAttribute("open");
	});

	// A right answer for the wrong reason still wants reading, so PASS is folded
	// rather than gone.
	it("opens a passed poll on click, revealing the same detail a miss shows", async () => {
		const { container } = render(
			<Verdict {...props} outcome="correct" score={2.6} />
		);

		await userEvent.click(screen.getByText("PASS"));

		expect(container.querySelector("details")).toHaveAttribute("open");
	});

	it("badges the score, signed and coloured by direction", () => {
		render(<Verdict {...props} />);

		expect(screen.getByText("−1.4").parentElement).toHaveClass(
			"bg-cinnabar/15"
		);
	});

	it("badges a score the poll earned in celadon", () => {
		render(<Verdict {...props} outcome="correct" score={2.6} />);

		expect(screen.getByText("+2.6").parentElement).toHaveClass("bg-celadon/15");
	});

	it("names the expected answer by the letter the player saw", () => {
		render(<Verdict {...props} />);

		const expected = screen.getByText("arr.slice(-2)").parentElement;

		expect(within(expected as HTMLElement).getByText("A")).toBeInTheDocument();
		expect(screen.getByText("arr.slice(-2)")).toHaveClass("text-celadon");
	});

	it("reddens a pick that was not part of the answer", () => {
		render(<Verdict {...props} />);

		expect(screen.getByText("arr.splice(-2)")).toHaveClass("text-cinnabar");
	});

	it("greens a pick that was, so a partial reads at a glance", () => {
		render(
			<Verdict {...props} outcome="partial" options={multi} score={0.7} />
		);

		expect(screen.getAllByText("transform")).toHaveLength(2);
		screen
			.getAllByText("transform")
			.forEach((node) => expect(node).toHaveClass("text-celadon"));
	});

	it("marks a poll as multi off the count of expected answers, not a flag", () => {
		render(
			<Verdict {...props} outcome="partial" options={multi} score={0.7} />
		);

		expect(screen.getByText("multi")).toBeInTheDocument();
	});

	it("keeps the multi marker off a single-answer poll", () => {
		render(<Verdict {...props} />);

		expect(screen.queryByText("multi")).not.toBeInTheDocument();
	});

	it("counts what was caught, missed and picked wrongly", () => {
		render(
			<Verdict {...props} outcome="partial" options={multi} score={0.7} />
		);

		expect(screen.getByText("2 caught")).toHaveClass("text-celadon");
		expect(screen.getByText("1 missed")).toHaveClass("text-saffron");
		expect(screen.getByText("1 wrong pick")).toHaveClass("text-cinnabar");
	});

	it("drops a count of nothing rather than reporting a zero", () => {
		const clean: readonly AnswerOption[] = [
			{ id: "a", label: "a", expected: true, received: true },
			{ id: "b", label: "b", expected: true, received: true },
			{ id: "c", label: "c" },
		];
		render(<Verdict {...props} outcome="partial" options={clean} score={1} />);

		expect(screen.getByText("2 caught")).toBeInTheDocument();
		expect(screen.queryByText("0 missed")).not.toBeInTheDocument();
		expect(screen.queryByText("0 wrong picks")).not.toBeInTheDocument();
	});

	// The verdict row is itself a <details> now, so the "other options" fold is the
	// nested one. Querying for the first `details` would answer for the row.
	const otherOptions = (container: HTMLElement) =>
		container.querySelector("details details");

	it("holds the untouched options behind a closed fold", () => {
		const { container } = render(<Verdict {...props} />);

		expect(screen.getByText("2 other options")).toBeInTheDocument();
		expect(otherOptions(container)).not.toHaveAttribute("open");
	});

	it("letters the untouched options by their place in the poll, not in the fold", () => {
		const { container } = render(<Verdict {...props} />);
		const fold = otherOptions(container);

		expect(within(fold as HTMLElement).getByText("C")).toBeInTheDocument();
		expect(within(fold as HTMLElement).getByText("D")).toBeInTheDocument();
	});

	it("offers no fold when every option was expected or picked", () => {
		const { container } = render(
			<Verdict
				{...props}
				options={[
					{ id: "a", label: "a", expected: true },
					{ id: "b", label: "b", received: true },
				]}
			/>
		);

		expect(otherOptions(container)).toBeNull();
	});

	it("says nothing was picked rather than leaving the row blank", () => {
		render(
			<Verdict
				{...props}
				options={single.map((option) => ({ ...option, received: false }))}
			/>
		);

		expect(screen.getByText("— nothing picked")).toBeInTheDocument();
	});

	it("shows the snippet the poll was asked about and the reason it resolves", () => {
		render(
			<Verdict
				{...props}
				code={["const arr = [] as const;"]}
				explainer="slice returns a new array and leaves the source untouched."
			/>
		);

		expect(screen.getByText("const arr = [] as const;")).toBeInTheDocument();
		expect(
			screen.getByText(
				"slice returns a new array and leaves the source untouched."
			)
		).toBeInTheDocument();
	});
});
