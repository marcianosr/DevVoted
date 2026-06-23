import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotFoundUI } from "./NotFoundUI.component";

describe("NotFoundUI", () => {
	it("renders default message when no children provided", () => {
		render(<NotFoundUI onGoBack={() => {}} homeLink={<a href="/">Home</a>} />);
		expect(
			screen.getByText("The page you are looking for does not exist.")
		).toBeInTheDocument();
	});

	it("renders custom children instead of default message", () => {
		render(
			<NotFoundUI onGoBack={() => {}} homeLink={<a href="/">Home</a>}>
				<p>This run is gone.</p>
			</NotFoundUI>
		);
		expect(screen.getByText("This run is gone.")).toBeInTheDocument();
		expect(
			screen.queryByText("The page you are looking for does not exist.")
		).not.toBeInTheDocument();
	});

	it("calls onGoBack when Go back button is clicked", async () => {
		const onGoBack = vi.fn();
		render(<NotFoundUI onGoBack={onGoBack} homeLink={<a href="/">Home</a>} />);
		await userEvent.click(screen.getByRole("button", { name: "Go back" }));
		expect(onGoBack).toHaveBeenCalledOnce();
	});

	it("renders the home link slot", () => {
		render(
			<NotFoundUI onGoBack={() => {}} homeLink={<a href="/">Start Over</a>} />
		);
		expect(
			screen.getByRole("link", { name: "Start Over" })
		).toBeInTheDocument();
	});
});
