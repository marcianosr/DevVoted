import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

import { ConfigCard } from "./ConfigCard";
import { createConfig } from "../factories/config";
describe(ConfigCard, () => {
	it("renders the config card", () => {
		const mockConfigCards = createConfig();
		render(
			<ConfigCard
				config={mockConfigCards}
				isSelected={false}
				onToggle={vi.fn()}
			/>
		);

		expect(screen.getByText(mockConfigCards.name)).toBeInTheDocument();
		expect(screen.getByText(/Cost:/)).toBeInTheDocument();
		expect(screen.getByText(/100 KB/)).toBeInTheDocument();
		expect(screen.getByText(mockConfigCards.rarity)).toBeInTheDocument();
		expect(screen.getByText(mockConfigCards.description)).toBeInTheDocument();
	});

	it("can be selected", () => {
		const mockConfigCards = createConfig();
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
