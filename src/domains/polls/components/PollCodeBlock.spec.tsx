import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PollCodeBlock } from "./PollCodeBlock.component";

describe(PollCodeBlock, () => {
	it("renders code snippet correctly", () => {
		const code = `const gym = "cinnabar";\nconst kazooie = "bird";`;

		render(<PollCodeBlock code={code} />);

		expect(screen.getByText(/const gym/)).toBeInTheDocument();
		expect(screen.getByText(/const kazooie/)).toBeInTheDocument();
	});

	it("handles special characters in code", () => {
		const specialCharsCode = `const birthday = "13-05";\nconst greeting = "Happy Birthday!";`;

		render(<PollCodeBlock code={specialCharsCode} />);

		expect(screen.getByText(/13-05/)).toBeInTheDocument();
		expect(screen.getByText(/Happy Birthday!/)).toBeInTheDocument();
	});
});
