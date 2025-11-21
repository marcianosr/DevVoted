import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PollCodeSandboxEmbed } from "./PollCodeSandboxEmbed";

describe(PollCodeSandboxEmbed, () => {
	const mockCodeSandboxUrl =
		"https://codesandbox.io/embed/banjo-kazooie-demo-abc123";

	it("renders iframe with correct src", () => {
		render(<PollCodeSandboxEmbed url={mockCodeSandboxUrl} />);

		const iframe = screen.getByTitle("CodeSandbox Example");
		expect(iframe).toBeInTheDocument();
		expect(iframe).toHaveAttribute("src", mockCodeSandboxUrl);
	});
});
