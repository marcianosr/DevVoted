import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChoiceList, type ChoiceListItem } from "./ChoiceList.ui";

const ANSWERS: readonly ChoiceListItem[] = [
	{ letter: "A", label: "at(−1)" },
	{ letter: "B", label: "pop()" },
	{ letter: "C", label: "last()" },
];

describe("answering by keyboard", () => {
	it("picks the answer the pressed letter carries, in any case", async () => {
		const onPick = vi.fn();
		render(<ChoiceList choices={ANSWERS} onPick={onPick} />);

		await userEvent.keyboard("b");

		expect(onPick).toHaveBeenCalledWith("B");
	});

	it("says so, since a key nobody presses is no affordance at all", () => {
		render(<ChoiceList choices={ANSWERS} onPick={() => {}} />);

		expect(
			screen.getByText("Tip: you can press keyboard letters to answer")
		).toBeInTheDocument();
	});

	it("submits on Enter, so a fast player never leaves the keyboard", async () => {
		const onSubmit = vi.fn();
		render(
			<ChoiceList choices={ANSWERS} onPick={() => {}} onSubmit={onSubmit} />
		);

		await userEvent.keyboard("{Enter}");

		expect(onSubmit).toHaveBeenCalledOnce();
	});

	it("says Enter submits, once Enter actually submits", () => {
		render(
			<ChoiceList choices={ANSWERS} onPick={() => {}} onSubmit={() => {}} />
		);

		expect(
			screen.getByText("Tip: press a letter to answer, Enter to submit")
		).toBeInTheDocument();
	});

	it("keeps quiet about Enter while the submit is locked", () => {
		render(<ChoiceList choices={ANSWERS} onPick={() => {}} />);

		expect(screen.queryByText(/Enter to submit/)).not.toBeInTheDocument();
	});

	it("leaves Enter to the browser when a button already has focus", async () => {
		const onSubmit = vi.fn();
		render(
			<>
				<button type="button">Submit answer</button>
				<ChoiceList choices={ANSWERS} onPick={() => {}} onSubmit={onSubmit} />
			</>
		);

		screen.getByRole("button", { name: "Submit answer" }).focus();
		await userEvent.keyboard("{Enter}");

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("leaves a letter the linter crossed out alone", async () => {
		const onPick = vi.fn();
		render(
			<ChoiceList
				choices={[
					{ letter: "A", label: "at(−1)" },
					{ letter: "B", label: "pop()", state: "crossedOut" },
				]}
				onPick={onPick}
			/>
		);

		await userEvent.keyboard("b");

		expect(onPick).not.toHaveBeenCalled();
	});

	it("ignores a letter typed into a field", async () => {
		const onPick = vi.fn();
		render(
			<>
				<input aria-label="say something" />
				<ChoiceList choices={ANSWERS} onPick={onPick} />
			</>
		);

		await userEvent.type(screen.getByLabelText("say something"), "b");

		expect(onPick).not.toHaveBeenCalled();
	});

	it("ignores a letter that arrives as part of a shortcut", async () => {
		const onPick = vi.fn();
		render(<ChoiceList choices={ANSWERS} onPick={onPick} />);

		await userEvent.keyboard("{Meta>}b{/Meta}");

		expect(onPick).not.toHaveBeenCalled();
	});

	it("takes no keys and offers no tip once the poll is settled", async () => {
		render(<ChoiceList choices={ANSWERS} />);

		await userEvent.keyboard("b");

		expect(
			screen.queryByText(/press keyboard letters/)
		).not.toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
