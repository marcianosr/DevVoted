import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { Loadout } from "./Loadout.ui";

describe(Loadout, () => {
	it("renders the load-out heading and the equipped configs", () => {
		render(<Loadout configs={[CONFIGS.unitTests, CONFIGS.css]} slots={3} />);
		expect(
			screen.getByRole("heading", { name: "Your load-out" })
		).toBeInTheDocument();
		expect(screen.getByText("Unit Tests")).toBeInTheDocument();
		expect(screen.getByText(".css")).toBeInTheDocument();
	});
});
