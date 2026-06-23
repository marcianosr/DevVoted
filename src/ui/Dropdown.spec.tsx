import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropdown, DropdownItem, DropdownDivider } from "./Dropdown.component";

const TestDropdown = () => (
	<Dropdown trigger={({ isOpen }) => <span>{isOpen ? "Close" : "Open"}</span>}>
		{({ close }) => (
			<>
				<DropdownItem onClick={close}>Banjo</DropdownItem>
				<DropdownDivider />
				<DropdownItem variant="danger" onClick={close}>
					Kazooie
				</DropdownItem>
			</>
		)}
	</Dropdown>
);

describe("Dropdown", () => {
	it("does not show menu initially", () => {
		render(<TestDropdown />);
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("opens menu on trigger click", async () => {
		render(<TestDropdown />);
		await userEvent.click(screen.getByRole("button"));
		expect(screen.getByRole("menu")).toBeInTheDocument();
		expect(screen.getByText("Banjo")).toBeInTheDocument();
	});

	it("closes menu when an item is clicked", async () => {
		render(<TestDropdown />);
		await userEvent.click(screen.getByRole("button"));
		await userEvent.click(screen.getByRole("menuitem", { name: "Banjo" }));
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("closes menu on Escape key", async () => {
		render(<TestDropdown />);
		await userEvent.click(screen.getByRole("button"));
		await userEvent.keyboard("{Escape}");
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});
});

describe("DropdownItem", () => {
	it("renders children", () => {
		render(<DropdownItem>Pikachu</DropdownItem>);
		expect(
			screen.getByRole("menuitem", { name: "Pikachu" })
		).toBeInTheDocument();
	});

	it("is disabled when disabled prop is set", () => {
		render(<DropdownItem disabled>Locked</DropdownItem>);
		expect(screen.getByRole("menuitem")).toBeDisabled();
	});
});
