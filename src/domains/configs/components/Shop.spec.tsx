import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";

import { Shop } from "./Shop";
import { createRun } from "~/domains/runs/models/run";
import { createConfig } from "~/domains/configs/factories/config";
describe(Shop, () => {
	const testConfigs = [
		createConfig({ id: "test-1", name: "Test Config 1" }),
		createConfig({ id: "test-2", name: "Test Config 2" }),
	];

	it("renders the shop", () => {
		const mockOnSubmit = vi.fn();

		render(
			<Shop
				onSubmit={mockOnSubmit}
				activeRun={createRun()}
				availableConfigs={testConfigs}
			/>
		);

		expect(screen.getByText("Config Shop")).toBeInTheDocument();
		expect(screen.getByText("Test Config 1")).toBeInTheDocument();
		expect(screen.getByText("Test Config 2")).toBeInTheDocument();
	});

	it("calls on close when clicking on cancel", async () => {
		const mockOnClose = vi.fn();

		render(
			<Shop
				onCancel={mockOnClose}
				onSubmit={vi.fn()}
				activeRun={createRun()}
				availableConfigs={testConfigs}
			/>
		);

		await userEvent.click(screen.getByText("Cancel"));

		expect(mockOnClose).toBeCalled();
	});

	it("selects a config when clicked", async () => {
		const mockOnSubmit = vi.fn();

		render(
			<Shop
				onSubmit={mockOnSubmit}
				activeRun={createRun()}
				availableConfigs={[
					createConfig({
						id: "eslint",
						name: "ESLint",
					}),
				]}
			/>
		);

		await userEvent.click(screen.getByText("Download to storage (0)"));

		await userEvent.click(screen.getByText("ESLint"));

		await userEvent.click(screen.getByText("Download to storage (1)"));
	});

	it("deselects a config when clicked again", async () => {
		const mockOnSubmit = vi.fn();

		render(
			<Shop
				onSubmit={mockOnSubmit}
				activeRun={createRun()}
				availableConfigs={[
					createConfig({
						id: "eslint",
						name: "ESLint",
					}),
				]}
			/>
		);

		await userEvent.click(screen.getByText("Download to storage (0)"));

		await userEvent.click(screen.getByText("ESLint"));

		await userEvent.click(screen.getByText("Download to storage (1)"));

		await userEvent.click(screen.getByText("ESLint"));

		await userEvent.click(screen.getByText("Download to storage (0)"));
	});
	it("calls on submit when clicking on Download to storage and updates the count in button", async () => {
		const mockOnSubmit = vi.fn();

		render(
			<Shop
				onSubmit={mockOnSubmit}
				activeRun={createRun()}
				availableConfigs={[
					createConfig({
						id: "eslint",
						name: "ESLint",
					}),
				]}
			/>
		);

		await userEvent.click(screen.getByText("Download to storage (0)"));

		await userEvent.click(screen.getByText("ESLint"));

		await userEvent.click(screen.getByText("Download to storage (1)"));

		expect(mockOnSubmit).toBeCalled();
	});

	it("disables the submit button when no selection is made", async () => {
		const mockOnSubmit = vi.fn();

		render(
			<Shop
				onSubmit={mockOnSubmit}
				activeRun={createRun()}
				availableConfigs={[
					createConfig({
						id: "eslint",
						name: "ESLint",
					}),
				]}
			/>
		);

		expect(screen.getByText("Download to storage (0)"));
		await userEvent.click(screen.getByText("Download to storage (0)"));

		expect(mockOnSubmit).not.toBeCalled();
	});
});
