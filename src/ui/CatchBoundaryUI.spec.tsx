import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatchBoundaryUI } from "./CatchBoundaryUI.component";

describe("CatchBoundaryUI", () => {
	it("renders the error display slot", () => {
		render(
			<CatchBoundaryUI
				errorDisplay={<p>Banjo broke something.</p>}
				onRetry={() => {}}
				navigationLink={<a href="/">Home</a>}
			/>
		);
		expect(screen.getByText("Banjo broke something.")).toBeInTheDocument();
	});

	it("calls onRetry when Try Again is clicked", async () => {
		const onRetry = vi.fn();
		render(
			<CatchBoundaryUI
				errorDisplay={<p>Error</p>}
				onRetry={onRetry}
				navigationLink={<a href="/">Home</a>}
			/>
		);
		await userEvent.click(screen.getByRole("button", { name: "Try Again" }));
		expect(onRetry).toHaveBeenCalledOnce();
	});

	it("renders the navigation link slot", () => {
		render(
			<CatchBoundaryUI
				errorDisplay={<p>Error</p>}
				onRetry={() => {}}
				navigationLink={<a href="/">Go Back</a>}
			/>
		);
		expect(screen.getByRole("link", { name: "Go Back" })).toBeInTheDocument();
	});
});
