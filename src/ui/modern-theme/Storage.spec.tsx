import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Storage } from "./Storage.ui";

describe("Storage", () => {
	it("names the plan the cap comes from", () => {
		render(<Storage plan="Free tier" used={0} cap={512} />);

		expect(screen.getByText("Free tier")).toBeInTheDocument();
	});

	it("states what is stored against what the plan allows", () => {
		render(<Storage plan="Free tier" used={184} cap={768} />);

		expect(screen.getByText("184 / 768 KB")).toBeInTheDocument();
	});

	it("meters the fill against the cap, not against a fixed hundred", () => {
		render(<Storage plan="Pro" used={184} cap={768} />);

		const meter = screen.getByRole("progressbar");
		expect(meter).toHaveAttribute("aria-valuenow", "184");
		expect(meter).toHaveAttribute("aria-valuemax", "768");
	});

	it("reads empty at nothing stored", () => {
		render(<Storage plan="Free tier" used={0} cap={512} />);

		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"aria-valuenow",
			"0"
		);
	});
});
