import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegistryHelp, type RegistryHelpChip } from "./RegistryHelp.ui";

const CHIPS: readonly RegistryHelpChip[] = [
	{ id: "coverage", label: "Coverage", count: 3 },
	{ id: "storage", label: "Storage", count: 1 },
];

const props = {
	chips: CHIPS,
	onPick: () => {},
	onHide: () => {},
};

describe("RegistryHelp", () => {
	it("states how many cards each group holds", () => {
		render(<RegistryHelp {...props} />);

		expect(
			screen.getByRole("button", { name: "Coverage · 3" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Storage · 1" })
		).toBeInTheDocument();
	});

	it("reports which group is picked, and that the others are not", () => {
		render(<RegistryHelp {...props} pickedId="storage" />);

		expect(screen.getByRole("button", { name: "Storage · 1" })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		expect(
			screen.getByRole("button", { name: "Coverage · 3" })
		).toHaveAttribute("aria-pressed", "false");
	});

	it("names the group it was pressed for", async () => {
		const onPick = vi.fn();
		render(<RegistryHelp {...props} onPick={onPick} />);

		await userEvent.click(screen.getByRole("button", { name: "Coverage · 3" }));

		expect(onPick).toHaveBeenCalledWith("coverage");
	});

	it("takes itself away on the press that asks", async () => {
		const onHide = vi.fn();
		render(<RegistryHelp {...props} onHide={onHide} />);

		await userEvent.click(screen.getByRole("button", { name: "hide" }));

		expect(onHide).toHaveBeenCalled();
	});
});
