import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	CATEGORY_CHOICES,
	EMPTY_POLL_FORM,
	STATUS_CHOICES,
	answerRowsOf,
	previewCategoryOf,
	previewOf,
	questionCountOf,
	stepsDoneOf,
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
	steps: stepsDoneOf(state),
	preview: previewOf(state),
	previewCategory: previewCategoryOf(state),
	categories: CATEGORY_CHOICES,
	saving: false,
	onQuestion: vi.fn(),
	onInlineCode: vi.fn(),
	onCodeBlock: vi.fn(),
	onView: vi.fn(),
	revealed: false,
	onPreviewPick: vi.fn(),
	onAnswerType: vi.fn(),
	onAnswerChange: vi.fn(),
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
				"Write it, tap the right answer, see it the way players will."
			)
		).toBeInTheDocument();
	});

	it("wears pallet to suggest and cerulean to edit", () => {
		const { container, rerender, props } = renderForm();

		expect(container.firstElementChild).toHaveAttribute(
			"data-screen-theme",
			"pallet"
		);

		rerender(<PollForm {...props} mode="edit" />);
		expect(container.firstElementChild).toHaveAttribute(
			"data-screen-theme",
			"cerulean"
		);
	});

	it("states the archive reward when one is offered", () => {
		const { rerender, props } = renderForm({ reward: "+16 KB" });

		expect(screen.getByText("+16 KB when approved")).toBeInTheDocument();

		rerender(<PollForm {...props} reward={undefined} />);
		expect(screen.queryByText(/when approved/)).not.toBeInTheDocument();
	});

	it("numbers the four steps and lights the ones done", () => {
		renderForm({ steps: { ...stepsDoneOf(FILLED), explanation: false } });

		expect(screen.getByText("1")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("4")).not.toHaveAttribute("data-screen-theme");
		expect(
			screen.getByRole("heading", { name: "Explain it" })
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

	it("writes the question in a textarea and reports the count against its maximum", async () => {
		const { props } = renderForm();

		await userEvent.type(
			screen.getByRole("textbox", { name: "Question" }),
			"!"
		);

		expect(props.onQuestion).toHaveBeenLastCalledWith(`${FILLED.question}!`);
		expect(
			screen.getByText(`${FILLED.question.length} / 2000`)
		).toBeInTheDocument();
	});

	it("offers inline code and a js block as one-tap snippets", async () => {
		const { props } = renderForm();

		await userEvent.click(screen.getByRole("button", { name: "`code`" }));
		await userEvent.click(screen.getByRole("button", { name: "```js block" }));

		expect(props.onInlineCode).toHaveBeenCalledOnce();
		expect(props.onCodeBlock).toHaveBeenCalledOnce();
	});

	it("opens a full-page preview from the footer, the form set aside", async () => {
		const { props, rerender } = renderForm();

		await userEvent.click(screen.getByRole("button", { name: "Preview" }));
		expect(props.onView).toHaveBeenCalledWith("preview");

		rerender(<PollForm {...props} view="preview" />);
		expect(
			screen.queryByRole("textbox", { name: "Question" })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: "Answers" })
		).not.toBeInTheDocument();
		const heading = screen.getByRole("heading", {
			name: "What does flex: 1 expand to?",
		});
		expect(within(heading).getByText("flex: 1").tagName).toBe("CODE");
		expect(screen.getByText("CSS")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: "Edit" }));
		expect(props.onView).toHaveBeenLastCalledWith("write");
	});

	it("plays an answer in the preview and holds the explanation until revealed", async () => {
		const { props, rerender } = renderForm({
			view: "preview",
			state: { ...FILLED, explanation: "The basis drops to 0%." },
		});

		await userEvent.click(screen.getByRole("button", { name: /1 1 auto/ }));
		expect(props.onPreviewPick).toHaveBeenCalledWith("1");
		expect(
			screen.queryByText("The basis drops to 0%.")
		).not.toBeInTheDocument();

		rerender(<PollForm {...props} revealed />);
		expect(screen.getByText("The basis drops to 0%.")).toBeInTheDocument();
	});

	it("links the sandbox once revealed", () => {
		renderForm({
			view: "preview",
			revealed: true,
			state: { ...FILLED, codeSandboxExample: "https://codesandbox.io/s/x" },
		});

		expect(screen.getByRole("link", { name: /CodeSandbox/ })).toHaveAttribute(
			"href",
			"https://codesandbox.io/s/x"
		);
	});

	it("offers a lock-in press only when one is live", async () => {
		const onLockIn = vi.fn();
		const { rerender, props } = renderForm({ view: "preview" });

		expect(
			screen.queryByRole("button", { name: "Lock in" })
		).not.toBeInTheDocument();

		rerender(<PollForm {...props} onLockIn={onLockIn} />);
		await userEvent.click(screen.getByRole("button", { name: "Lock in" }));
		expect(onLockIn).toHaveBeenCalledOnce();
	});

	it("makes each answer's letter the press that marks it right", () => {
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
	});

	it("removes and adds answers when allowed", async () => {
		const onRemoveAnswer = vi.fn();
		const { props } = renderForm({ onRemoveAnswer });

		await userEvent.click(screen.getByRole("button", { name: "remove B" }));
		expect(onRemoveAnswer).toHaveBeenCalledWith(1);

		await userEvent.click(screen.getByRole("button", { name: "add answer" }));
		expect(props.onAddAnswer).toHaveBeenCalledOnce();
	});

	it("picks the category from a dropdown, asking for one on a fresh form", async () => {
		const { props, rerender } = renderForm();
		const category = screen.getByRole("combobox", { name: "Category" });

		expect(category).toHaveValue("css");

		await userEvent.selectOptions(category, "react");
		expect(props.onCategory).toHaveBeenCalledWith("react");

		rerender(
			<PollForm {...props} state={{ ...FILLED, categoryCode: undefined }} />
		);
		expect(category).toHaveValue("");
		expect(
			screen.getByRole("option", { name: "pick a category" })
		).toBeDisabled();
	});

	it("gives each answer a large input", () => {
		renderForm();

		expect(screen.getByRole("textbox", { name: "answer 1" })).toHaveClass(
			"text-sm"
		);
	});

	it("labels the optional explanation and sandbox for what they do", () => {
		renderForm();

		expect(
			screen.getByRole("textbox", {
				name: "explanation, shown after answering",
			})
		).toBeInTheDocument();
		expect(
			screen.getByRole("textbox", { name: "CodeSandbox link" })
		).toBeInTheDocument();
	});

	it("disables the press and names the first unmet rule on it", () => {
		renderForm({ onSubmit: undefined, refusal: "Mark the right answer" });

		const press = screen.getByRole("button", { name: "Mark the right answer" });
		expect(press).toBeDisabled();
		expect(
			screen.queryByRole("button", { name: /Suggest a poll/ })
		).not.toBeInTheDocument();
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

describe("PollForm walking a filtered list", () => {
	it("leads with save and next, keeping a plain save beside it", async () => {
		const onSubmit = vi.fn();
		const onSubmitAndNext = vi.fn();
		renderForm({ mode: "edit", onSubmit, onSubmitAndNext, nextAhead: true });

		await userEvent.click(screen.getByRole("button", { name: /Save & next/ }));
		await userEvent.click(screen.getByRole("button", { name: /Save poll/ }));

		expect(onSubmitAndNext).toHaveBeenCalledOnce();
		expect(onSubmit).toHaveBeenCalledOnce();
	});

	it("names the last poll's review as the end of the list", () => {
		renderForm({
			mode: "edit",
			onSubmitAndNext: vi.fn(),
			nextAhead: false,
		});

		expect(
			screen.getByRole("button", { name: /Save & back to list/ })
		).toBeInTheDocument();
	});

	it("steps to the polls either side of this one in the list", () => {
		renderForm({
			mode: "edit",
			listHref: "/polls?category=css",
			step: { position: 3, total: 9, nextHref: "/polls/12/edit?category=css" },
		});

		expect(screen.getByRole("link", { name: "next ›" })).toHaveAttribute(
			"href",
			"/polls/12/edit?category=css"
		);
		expect(screen.getByText("3 of 9")).toBeInTheDocument();
	});
});
