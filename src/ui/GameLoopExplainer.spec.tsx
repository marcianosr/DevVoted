import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameLoopExplainer } from "./GameLoopExplainer.component";

describe("GameLoopExplainer", () => {
	it("renders the first step by default", () => {
		render(<GameLoopExplainer />);
		expect(screen.getByText("Answer Polls")).toBeInTheDocument();
	});

	it("Previous button is disabled on the first step", () => {
		render(<GameLoopExplainer />);
		expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
	});

	it("advances to the next step on Next click", async () => {
		render(<GameLoopExplainer />);
		await userEvent.click(screen.getByRole("button", { name: "Next" }));
		expect(screen.getByText("Build Coverage")).toBeInTheDocument();
	});

	it("Previous button is enabled after advancing", async () => {
		render(<GameLoopExplainer />);
		await userEvent.click(screen.getByRole("button", { name: "Next" }));
		expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();
	});

	it("Next button is disabled on the last step", async () => {
		render(<GameLoopExplainer />);
		for (let i = 0; i < 4; i++) {
			await userEvent.click(screen.getByRole("button", { name: "Next" }));
		}
		expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
	});

	it("dot navigation jumps to a specific step", async () => {
		render(<GameLoopExplainer />);
		await userEvent.click(screen.getByRole("button", { name: "Go to step 4" }));
		expect(screen.getByText("Upgrade Your Build")).toBeInTheDocument();
	});
});
