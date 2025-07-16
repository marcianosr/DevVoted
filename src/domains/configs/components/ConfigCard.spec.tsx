import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";

import { ConfigCard } from "./ConfigCard";
import { createConfig } from "../factories/config";
describe(ConfigCard, () => {
	it("renders the config card", () => {
		const mockConfigCards = createConfig({ cooldown: 2 });
		render(
			<ConfigCard
				config={mockConfigCards}
				isSelected={false}
				onToggle={vi.fn()}
			/>
		);

		expect(screen.getByText(mockConfigCards.name)).toBeInTheDocument();
		expect(screen.getByText("Cost: 100 KB")).toBeInTheDocument();
		expect(screen.getByText(mockConfigCards.rarity)).toBeInTheDocument();
		expect(
			screen.getByText(mockConfigCards.description)
		).toBeInTheDocument();
		expect(screen.getByText("Cooldown: 2")).toBeInTheDocument();
	});

	it("can be selected", () => {
		const mockConfigCards = createConfig({ cooldown: 2 });
		render(
			<ConfigCard
				config={mockConfigCards}
				isSelected={true}
				onToggle={vi.fn()}
			/>
		);

		expect(screen.getByText("✓")).toBeInTheDocument();
	});
});
