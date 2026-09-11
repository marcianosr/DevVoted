import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegistryControl } from "./RegistryControl.ui";

const props = {
	glyph: "↻",
	title: "Rebuild the registry",
	detail: "deals a fresh set of offers",
	price: "4 KB",
};

describe("RegistryControl", () => {
	it("names what it does and what it costs", () => {
		render(<RegistryControl {...props} />);

		expect(screen.getByText("Rebuild the registry")).toBeInTheDocument();
		expect(screen.getByText("deals a fresh set of offers")).toBeInTheDocument();
		expect(screen.getByText("4 KB")).toBeInTheDocument();
	});

	it("badges the price, so it never reads as part of the sentence", () => {
		render(<RegistryControl {...props} />);

		expect(screen.getByText("4 KB")).toHaveClass("badge-theme");
	});

	it("sets the title at the size of the offers above it", () => {
		render(<RegistryControl {...props} />);

		expect(screen.getByText("Rebuild the registry")).toHaveClass("text-sm");
	});

	it("keeps the glyph decorative, since the title carries the meaning", () => {
		render(<RegistryControl {...props} />);

		expect(screen.getByText("↻")).toHaveAttribute("aria-hidden");
	});

	it("stays a plain row until something can act on it", () => {
		render(<RegistryControl {...props} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("becomes one press across the whole row", async () => {
		const onPress = vi.fn();
		render(<RegistryControl {...props} onPress={onPress} />);

		await userEvent.click(
			screen.getByRole("button", { name: "Rebuild the registry · 4 KB" })
		);

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("refuses a control the player cannot afford", async () => {
		const onPress = vi.fn();
		render(<RegistryControl {...props} disabled onPress={onPress} />);

		const row = screen.getByRole("button");
		await userEvent.click(row);

		expect(onPress).not.toHaveBeenCalled();
		expect(row).toBeDisabled();
	});

	it("swaps the price for the shortfall when the balance cannot pay", () => {
		render(
			<RegistryControl {...props} refusal="352 KB short" onPress={vi.fn()} />
		);

		expect(screen.getByText("352 KB short")).toBeInTheDocument();
		expect(screen.queryByText("4 KB")).not.toBeInTheDocument();
	});

	it("paints the shortfall in the refusal's own red", () => {
		render(
			<RegistryControl {...props} refusal="352 KB short" onPress={vi.fn()} />
		);

		expect(screen.getByText("352 KB short")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("refuses the press and keeps price and shortfall in the row's name", async () => {
		const onPress = vi.fn();
		render(
			<RegistryControl {...props} refusal="352 KB short" onPress={onPress} />
		);

		const row = screen.getByRole("button", {
			name: "Rebuild the registry · 4 KB · 352 KB short",
		});
		await userEvent.click(row);

		expect(row).toBeDisabled();
		expect(onPress).not.toHaveBeenCalled();
	});
});
