import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DevPollNavigatorUI } from "./DevPollNavigatorUI.component";

const defaultProps = {
	currentDate: "2025-05-13",
	hasCustomDate: false,
	onRandomPoll: vi.fn(),
	onResetToToday: vi.fn(),
};

describe("DevPollNavigatorUI", () => {
	it("renders the current date", () => {
		render(<DevPollNavigatorUI {...defaultProps} />);
		expect(screen.getByText("Viewing: 2025-05-13")).toBeInTheDocument();
	});

	it("always renders the Random Poll button", () => {
		render(<DevPollNavigatorUI {...defaultProps} />);
		expect(
			screen.getByRole("button", { name: "Random Poll" })
		).toBeInTheDocument();
	});

	it("hides Today button when hasCustomDate is false", () => {
		render(<DevPollNavigatorUI {...defaultProps} hasCustomDate={false} />);
		expect(
			screen.queryByRole("button", { name: "Today" })
		).not.toBeInTheDocument();
	});

	it("shows Today button when hasCustomDate is true", () => {
		render(<DevPollNavigatorUI {...defaultProps} hasCustomDate />);
		expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
	});

	it("calls onRandomPoll when Random Poll is clicked", async () => {
		const onRandomPoll = vi.fn();
		render(
			<DevPollNavigatorUI {...defaultProps} onRandomPoll={onRandomPoll} />
		);
		await userEvent.click(screen.getByRole("button", { name: "Random Poll" }));
		expect(onRandomPoll).toHaveBeenCalledOnce();
	});

	it("calls onResetToToday when Today is clicked", async () => {
		const onResetToToday = vi.fn();
		render(
			<DevPollNavigatorUI
				{...defaultProps}
				hasCustomDate
				onResetToToday={onResetToToday}
			/>
		);
		await userEvent.click(screen.getByRole("button", { name: "Today" }));
		expect(onResetToToday).toHaveBeenCalledOnce();
	});
});
