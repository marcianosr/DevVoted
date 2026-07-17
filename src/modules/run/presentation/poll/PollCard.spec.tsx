import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { PollCard } from "./PollCard.ui";

const options = [
	{ id: "a", label: "Alpha" },
	{ id: "b", label: "Beta" },
	{ id: "c", label: "Gamma" },
];

describe(PollCard, () => {
	it("renders the category name, question, and options", () => {
		render(
			<PollCard
				category="react"
				question="Which key?"
				options={options}
				onSelect={() => {}}
			/>
		);
		expect(screen.getByRole("heading", { name: "React" })).toBeInTheDocument();
		expect(screen.getByText("Which key?")).toBeInTheDocument();
		expect(screen.getByText("Alpha")).toBeInTheDocument();
	});

	it("reports a clicked option through onSelect without any submit button", () => {
		const onSelect = vi.fn();
		render(
			<PollCard
				category="js"
				question="Q"
				options={options}
				onSelect={onSelect}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /Alpha/ }));
		expect(onSelect).toHaveBeenCalledWith("a");
		// Submitting is now the Screen's footer action — the card never renders one.
		expect(
			screen.queryByRole("button", { name: /Submit/ })
		).not.toBeInTheDocument();
	});

	it("does not answer a disabled (linted) option", () => {
		render(
			<PollCard
				category="js"
				question="Q"
				options={options}
				disabledOptionIds={["c"]}
				onSelect={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /Gamma/ })).toBeDisabled();
	});

	it("locks the options once the result is revealed", () => {
		render(
			<PollCard
				category="js"
				question="Q"
				options={options}
				onSelect={() => {}}
				correctOptionIds={["a"]}
				chosenOptionIds={["b"]}
			/>
		);
		expect(screen.getByRole("button", { name: /Alpha/ })).toBeDisabled();
	});
});
