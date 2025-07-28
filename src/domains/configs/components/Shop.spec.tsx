import { render, screen, within } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";

import { Shop } from "./Shop";
import { createRun } from "~/domains/runs/models/run";
import { createConfig } from "~/domains/configs/factories/config";
import { ShopProvider } from "../contexts/ShopContext";

const renderWithShopProvider = (overrides?: {
	onAddConfig?: (configId: string) => void;
	onRemoveConfig?: (configId: string) => void;
	isShopOpen?: boolean;
}) => {
	const testConfigs = [
		createConfig({ id: "stylelint", name: "Style lint" }),
		createConfig({ id: "eslint", name: "ESLint" }),
	];
	return render(
		<ShopProvider
			onAddConfig={overrides?.onAddConfig ?? vi.fn()}
			onRemoveConfig={overrides?.onRemoveConfig ?? vi.fn()}
			initialShopOpen={overrides?.isShopOpen ?? false}
		>
			<Shop activeRun={createRun()} offeredConfigs={testConfigs} />
		</ShopProvider>
	);
};
describe(Shop, () => {
	it("renders the shop", () => {
		renderWithShopProvider();

		expect(screen.getByText("Config Shop")).toBeInTheDocument();
		expect(screen.getByText("Style lint")).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("enables adding configs when the shop is open", () => {
		renderWithShopProvider({ isShopOpen: true });

		const selectedConfig = screen.getByTestId("eslint");
		const button = within(selectedConfig).getByText("Add to storage");

		expect(button).toBeEnabled();
	});

	it.only("allows the config to be added with sufficient space in storage", async () => {
		const onAddConfig = vi.fn();
		renderWithShopProvider({ isShopOpen: true, onAddConfig });

		const selectedConfig = screen.getByTestId("eslint");
		const button = within(selectedConfig).getByText("Add to storage");
		await userEvent.click(button);

		expect(button).toBeEnabled();

		expect(onAddConfig).toBeCalled();
	});

	// TODO: Wonder if this belongs here, or secretly is an integration test since this is rendered in another component
	it.todo("allows the player to remove configs when the shop is open", () => {
		renderWithShopProvider({ isShopOpen: true });

		const selectedConfig = screen.getByTestId("eslint");
		const button = within(selectedConfig).getByText("Remove from storage");

		expect(button).toBeEnabled();
	});
});
