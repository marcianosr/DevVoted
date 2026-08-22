import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Caret } from "./Caret.ui";

describe("Caret", () => {
	it("is hidden from assistive tech, since the details element announces itself", () => {
		render(<Caret />);

		expect(screen.getByText("›")).toHaveAttribute("aria-hidden");
	});

	it("rotates when the fold it lives in is open", () => {
		render(<Caret />);

		expect(screen.getByText("›")).toHaveClass("group-open/fold:rotate-90");
	});
});
