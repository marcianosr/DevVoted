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

	it("watches its own scope, so a nested caret ignores the outer fold", () => {
		render(<Caret scope="row" />);

		expect(screen.getByText("›")).toHaveClass("group-open/row:rotate-90");
		expect(screen.getByText("›")).not.toHaveClass("group-open/fold:rotate-90");
	});
});
