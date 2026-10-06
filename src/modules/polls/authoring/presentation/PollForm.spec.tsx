import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	CATEGORY_CHOICES,
	EMPTY_POLL_FORM,
	STATUS_CHOICES,
	answerRowsOf,
	answersCountOf,
	gridGroupRowsOf,
	previewOf,
	questionCountOf,
	withAnswerType,
	type PollFormState,
} from "~/modules/polls/authoring/application/pollForm.viewmodel";
import {
	PollForm,
	type PollFormProps,
} from "~/modules/polls/authoring/presentation/PollForm.ui";

const FILLED: PollFormState = {
	...EMPTY_POLL_FORM,
	question: "What does `flex: 1` expand to?",
	categoryCode: "css",
	answers: [
		{ key: 0, text: "1 1 0%", right: true },
		{ key: 1, text: "1 1 auto", right: false },
		{ key: 2, text: "1 0 0%", right: false },
	],
};

const propsFor = (state: PollFormState): PollFormProps => ({
	mode: "suggest",
	state,
	view: "write",
	rows: answerRowsOf(state),
	questionCount: questionCountOf(state.question),
	answersCount: answersCountOf(state.answers),
	preview: previewOf(state),
	categories: CATEGORY_CHOICES,
	saving: false,
	onQuestion: vi.fn(),
	onView: vi.fn(),
	onAnswerType: vi.fn(),
	onAnswerChange: vi.fn(),
	onGroupLabel: vi.fn(),
	onMarkRight: vi.fn(),
	onAddAnswer: vi.fn(),
	onCategory: vi.fn(),
	onStatus: vi.fn(),
	onSandbox: vi.fn(),
	onExplanation: vi.fn(),
	onSubmit: vi.fn(),
});

const renderForm = (overrides: Partial<PollFormProps> = {}) => {
	const props = { ...propsFor(FILLED), ...overrides };
	return { ...render(<PollForm {...props} />), props };
};

describe("PollForm", () => {
	it("heads the page as a suggestion, with its one-line promise", () => {
		renderForm();

		expect(
			screen.getByRole("heading", { level: 1, name: "Suggest a poll" })
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"Write it, mark what's right, and see it the way players will."
			)
		).toBeInTheDocument();
	});

	it("names an edit by the poll's number and saves rather than suggests", () => {
		renderForm({ mode: "edit", pollNumber: 9, statuses: STATUS_CHOICES });

		expect(
			screen.getByRole("heading", { level: 1, name: "Edit poll #9" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Save poll/ })
		).toBeInTheDocument();
		expect(screen.getByRole("combobox", { name: "status" })).toHaveValue(
			"draft"
		);
	});

	it("offers no status to a suggester", () => {
		renderForm();

		expect(
			screen.queryByRole("combobox", { name: "status" })
		).not.toBeInTheDocument();
	});

	it("writes the question in a textarea and reports the count against its limits", async () => {
		const { props } = renderForm();

		await userEvent.type(
			screen.getByRole("textbox", { name: "Question" }),
			"!"
		);

		expect(props.onQuestion).toHaveBeenLastCalledWith(`${FILLED.question}!`);
		expect(
			screen.getByText(`${FILLED.question.length} / 2000 · min 10`)
		).toBeInTheDocument();
	});

	it("switches to a preview that renders the poll as the run does, code and all", async () => {
		const { props, rerender } = renderForm();

		await userEvent.click(screen.getByRole("radio", { name: "preview" }));
		expect(props.onView).toHaveBeenCalledWith("preview");

		rerender(<PollForm {...props} view="preview" />);
		expect(
			screen.queryByRole("textbox", { name: "Question" })
		).not.toBeInTheDocument();
		const heading = screen.getByRole("heading", {
			name: "What does flex: 1 expand to?",
		});
		expect(within(heading).getByText("flex: 1").tagName).toBe("CODE");
		expect(screen.getByText("1 1 auto")).toBeInTheDocument();
	});

	it("lists every answer with its letter, text and a mark-right press", () => {
		renderForm();

		expect(screen.getByRole("textbox", { name: "answer 2" })).toHaveValue(
			"1 1 auto"
		);
		expect(screen.getByText("B")).toHaveClass("rounded-full");
		expect(
			screen.getByRole("button", { name: "mark A right" })
		).toHaveAttribute("aria-pressed", "true");
		expect(
			screen.getByRole("button", { name: "mark B right" })
		).toHaveAttribute("aria-pressed", "false");
	});

	it("squares the keycaps when several answers may be right", async () => {
		const { props } = renderForm();

		await userEvent.click(screen.getByRole("radio", { name: "several right" }));
		expect(props.onAnswerType).toHaveBeenCalledWith("multiple");

		render(
			<PollForm {...props} state={{ ...FILLED, answerType: "multiple" }} />
		);
		expect(screen.getAllByText("A").at(-1)).toHaveClass("rounded-md");
	});

	it("reports an answer's text and a press to mark it right by key", async () => {
		const { props } = renderForm();

		await userEvent.type(
			screen.getByRole("textbox", { name: "answer 3" }),
			"!"
		);
		expect(props.onAnswerChange).toHaveBeenLastCalledWith(2, "1 0 0%!");

		await userEvent.click(screen.getByRole("button", { name: "mark C right" }));
		expect(props.onMarkRight).toHaveBeenCalledWith(2);
	});

	it("cannot remove an answer at the minimum, and cannot add one at the maximum", () => {
		renderForm({ onRemoveAnswer: undefined, onAddAnswer: undefined });

		expect(screen.getByRole("button", { name: "remove A" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "add answer" })).toBeDisabled();
		expect(
			screen.getByText("3 of 20 answers · at least 3")
		).toBeInTheDocument();
	});

	it("removes and adds answers when allowed", async () => {
		const onRemoveAnswer = vi.fn();
		const { props } = renderForm({ onRemoveAnswer });

		await userEvent.click(screen.getByRole("button", { name: "remove B" }));
		expect(onRemoveAnswer).toHaveBeenCalledWith(1);

		await userEvent.click(screen.getByRole("button", { name: "add answer" }));
		expect(props.onAddAnswer).toHaveBeenCalledOnce();
	});

	it("captions the details, with optional fields described rather than renamed", () => {
		renderForm();

		expect(screen.getByRole("combobox", { name: "category" })).toHaveValue(
			"css"
		);
		expect(
			screen.getByRole("textbox", { name: "CodeSandbox" })
		).toHaveAccessibleDescription("optional");
		expect(
			screen.getByRole("textbox", { name: "explanation" })
		).toHaveAccessibleDescription("shown after answering · optional");
	});

	it("refuses the press and names the first unmet rule", () => {
		renderForm({ onSubmit: undefined, refusal: "mark one answer right" });

		const press = screen.getByRole("button", { name: /Suggest a poll/ });
		expect(press).toBeDisabled();
		expect(press).toHaveTextContent("mark one answer right");
	});

	it("submits on a live press", async () => {
		const { props } = renderForm();

		await userEvent.click(
			screen.getByRole("button", { name: /Suggest a poll/ })
		);

		expect(props.onSubmit).toHaveBeenCalledOnce();
	});

	it("holds the press while saving and shows a failure in red", () => {
		const { rerender, props } = renderForm({ saving: true });

		expect(
			screen.getByRole("button", { name: /Suggest a poll/ })
		).toBeDisabled();

		rerender(
			<PollForm {...props} saving={false} error="The database is asleep." />
		);
		expect(
			screen.getByText("The database is asleep.").closest("[data-screen-theme]")
		).toHaveAttribute("data-screen-theme", "cinnabar");
	});
});

describe("PollForm on a dependency grid", () => {
	const grid = withAnswerType(FILLED, "grid");
	const renderGrid = () =>
		renderForm({
			...propsFor(grid),
			groups: gridGroupRowsOf(grid),
		});

	it("asks for three group names and twelve tiles instead of answers to mark", () => {
		renderGrid();

		expect(
			screen.getAllByRole("textbox", { name: /^group \d name$/ })
		).toHaveLength(3);
		expect(
			screen.getAllByRole("textbox", { name: /^tile [A-L]$/ })
		).toHaveLength(12);
		expect(
			screen.queryByRole("button", { name: /mark A right/ })
		).not.toBeInTheDocument();
	});

	it("names a group as the author types", async () => {
		const { props } = renderGrid();

		await userEvent.type(
			screen.getByRole("textbox", { name: "group 2 name" }),
			"B"
		);

		expect(props.onGroupLabel).toHaveBeenCalledWith(1, "B");
	});
});
