import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { kantoStanding } from "~/test/kantoCommunity.factory";

import { COPY, ProfileClimbing } from "./ProfileClimbing.ui";

const STANDING = kantoStanding();

describe("ProfileClimbing", () => {
	it("names the panel and draws the open run's standing", () => {
		render(<ProfileClimbing standing={STANDING} meta="a run is open" />);

		expect(screen.getByRole("heading", { name: COPY.label })).toBeVisible();
		expect(screen.getByText("gate 3")).toBeVisible();
	});

	it("stays on the page when nothing is open, and says so", () => {
		render(<ProfileClimbing meta="nothing open" />);

		expect(screen.getByRole("heading", { name: COPY.label })).toBeVisible();
		expect(screen.getByText(COPY.resting)).toBeVisible();
	});
});
