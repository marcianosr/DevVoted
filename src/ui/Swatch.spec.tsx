import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Swatch } from "./Swatch.component";

describe("Swatch", () => {
	it("renders a themed chip at the default size", () => {
		const { container } = render(<Swatch />);
		expect(container.firstChild).toHaveClass("bg-theme", "h-3.5", "w-3.5");
	});

	it("sizes by the size prop", () => {
		const { container } = render(<Swatch size="xl" />);
		expect(container.firstChild).toHaveClass("h-7", "w-7");
	});
});
