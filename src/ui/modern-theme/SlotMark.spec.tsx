import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SlotMark } from "./SlotMark.ui";

describe("SlotMark", () => {
	it("writes a one-slot config in the singular", () => {
		render(<SlotMark slots={1} />);

		expect(screen.getByText("1 slot")).toBeInTheDocument();
	});

	it("writes every larger size in the plural", () => {
		render(<SlotMark slots={12} />);

		expect(screen.getByText("12 slots")).toBeInTheDocument();
	});

	it("names what the size costs against the build when given a hint", () => {
		render(<SlotMark slots={8} hint="takes 8 of your 12 slots" />);

		expect(screen.getByText("takes 8 of your 12 slots")).toBeInTheDocument();
	});
});
