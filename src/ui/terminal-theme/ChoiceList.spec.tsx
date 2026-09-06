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
