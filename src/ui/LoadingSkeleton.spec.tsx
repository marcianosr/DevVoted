import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LoadingSkeleton } from "./LoadingSkeleton.component";

describe("LoadingSkeleton", () => {
	it("renders an animated pulse container", () => {
		const { container: c } = render(<LoadingSkeleton />);
		expect(c.querySelector(".animate-pulse")).toBeInTheDocument();
	});
});
